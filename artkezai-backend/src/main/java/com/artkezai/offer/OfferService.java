package com.artkezai.offer;

import com.artkezai.notification.NotificationService;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.notification.EmailService;
import com.artkezai.offer.dto.MakeOfferRequest;
import com.artkezai.offer.dto.OfferDto;
import com.artkezai.offer.dto.RespondOfferRequest;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.order.OrderService;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OfferService {

	private final OfferRepository offerRepository;
	private final PaintingRepository paintingRepository;
	private final EmailService emailService;
	private final OrderService orderService;
	private final NotificationService notificationService;

	public OfferDto makeOffer(MakeOfferRequest request, User buyer) {
		Painting painting = paintingRepository.findById(request.getPaintingId())
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", request.getPaintingId()));

		if (!painting.getStatus().equals(PaintingStatus.APPROVED)) {
			throw new BusinessException("Can only make offers on approved paintings");
		}

		if (!painting.getIsOfferEnabled()) {
			throw new BusinessException("Offers are not enabled for this painting");
		}

		Offer offer = Offer.builder()
				.painting(painting)
				.buyer(buyer)
				.offerAmount(request.getOfferAmount())
				.currency(painting.getCurrency())
				.buyerMessage(request.getMessage())
				.status(OfferStatus.SUBMITTED)
				.expiresAt(LocalDateTime.now().plusDays(7))
				.build();

		offer = offerRepository.save(offer);
		emailService.sendOfferSubmitted(offer);
		notificationService.notifyAdmins("OFFER_SUBMITTED",
				"New offer on \"" + painting.getTitle() + "\"", "/admin/offers");
		notificationService.notifyUser(painting.getArtist().getUser(), "OFFER_SUBMITTED",
				"New offer on \"" + painting.getTitle() + "\"", "/artist");
		log.info("Offer made: {} by buyer: {}", offer.getId(), buyer.getEmail());
		return toOfferDto(offer);
	}

	@Transactional(readOnly = true)
	public Page<OfferDto> getBuyerOffers(User buyer, Pageable pageable) {
		return offerRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageable)
				.map(this::toOfferDto);
	}

	@Transactional(readOnly = true)
	public Page<OfferDto> getArtistOffers(User artist, Pageable pageable) {
		return offerRepository.findByPaintingArtistUserIdOrderByCreatedAtDesc(artist.getId(), pageable)
				.map(this::toOfferDto);
	}

	@Transactional(readOnly = true)
	public Page<OfferDto> getAllOffers(Pageable pageable) {
		return offerRepository.findAllByOrderByCreatedAtDesc(pageable)
				.map(this::toOfferDto);
	}

	@Transactional(readOnly = true)
	public OfferDto getOffer(Long offerId, User requester) {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

		boolean isOwner = offer.getBuyer().getId().equals(requester.getId());
		if (!isOwner && requester.getRole() != UserRole.ADMIN) {
			throw new UnauthorizedException("You can only view your own offers");
		}
		return toOfferDto(offer);
	}

	public OfferDto respondToOffer(Long offerId, RespondOfferRequest request) {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

		if (request.getAction() == null) {
			throw new BusinessException("Action is required");
		}

		// D3: only an open buyer offer can be answered by the admin. A
		// countered offer is waiting on the buyer; closed offers are final.
		if (offer.getStatus() != OfferStatus.SUBMITTED) {
			throw new BusinessException("Only submitted offers can be responded to. Current status: " + offer.getStatus());
		}
		expireIfPastDeadline(offer);

		if (request.getAction() == RespondOfferRequest.OfferAction.ACCEPT) {
			offer.setStatus(OfferStatus.ACCEPTED);
			orderService.createOrderForAcceptedOffer(offer);
		} else if (request.getAction() == RespondOfferRequest.OfferAction.REJECT) {
			offer.setStatus(OfferStatus.REJECTED);
		} else if (request.getAction() == RespondOfferRequest.OfferAction.COUNTER) {
			if (request.getCounterAmount() == null || request.getCounterAmount().signum() <= 0) {
				throw new BusinessException("A positive counter amount is required for a counter offer");
			}
			offer.setStatus(OfferStatus.COUNTERED);
			offer.setCounterAmount(request.getCounterAmount());
		}

		offer.setRespondedAt(LocalDateTime.now());
		offer.setAdminMessage(request.getMessage());
		offer = offerRepository.save(offer);
		emailService.sendOfferResponse(offer);
		notificationService.notifyUser(offer.getBuyer(), "OFFER_" + offer.getStatus(),
				"Your offer on \"" + offer.getPainting().getTitle() + "\" was " + offer.getStatus().name().toLowerCase(),
				"/dashboard/offers");
		log.info("Offer {} responded with action: {}", offerId, request.getAction());
		return toOfferDto(offer);
	}

	// D3: the buyer accepts the admin's counter offer, which creates the
	// order at the countered price.
	public OfferDto acceptCounterOffer(Long offerId, User buyer) {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

		if (!offer.getBuyer().getId().equals(buyer.getId())) {
			throw new UnauthorizedException("You can only accept counter offers on your own offers");
		}

		if (offer.getStatus() != OfferStatus.COUNTERED) {
			throw new BusinessException("Only countered offers can be accepted. Current status: " + offer.getStatus());
		}
		expireIfPastDeadline(offer);

		offer.setStatus(OfferStatus.ACCEPTED);
		orderService.createOrderForAcceptedOffer(offer);
		offer = offerRepository.save(offer);
		notificationService.notifyAdmins("COUNTER_ACCEPTED",
				"Counter offer accepted on \"" + offer.getPainting().getTitle() + "\"", "/admin/orders");
		log.info("Counter offer {} accepted by buyer: {}", offerId, buyer.getEmail());
		return toOfferDto(offer);
	}

	private void expireIfPastDeadline(Offer offer) {
		if (offer.isExpired()) {
			throw new BusinessException("This offer has expired");
		}
	}

	public OfferDto withdrawOffer(Long offerId, User buyer) {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

		if (!offer.getBuyer().getId().equals(buyer.getId())) {
			throw new UnauthorizedException("You can only withdraw your own offers");
		}

		if (!offer.getStatus().equals(OfferStatus.SUBMITTED) &&
		    !offer.getStatus().equals(OfferStatus.COUNTERED)) {
			throw new BusinessException("Cannot withdraw offers that are already accepted or rejected");
		}

		offer.setStatus(OfferStatus.WITHDRAWN);
		offer = offerRepository.save(offer);
		log.info("Offer {} withdrawn by buyer: {}", offerId, buyer.getEmail());
		return toOfferDto(offer);
	}

	private OfferDto toOfferDto(Offer offer) {
		Optional<String> thumbnailUrl = offer.getPainting().getImages().stream()
				.filter(img -> img.getIsPrimary() || img.getThumbnailUrl() != null)
				.findFirst()
				.map(img -> img.getThumbnailUrl() != null ? img.getThumbnailUrl() : img.getUrl());

		return OfferDto.builder()
				.id(offer.getId())
				.paintingId(offer.getPainting().getId())
				.paintingTitle(offer.getPainting().getTitle())
				.paintingSlug(offer.getPainting().getSlug())
				.paintingThumbnailUrl(thumbnailUrl.orElse(null))
				.buyerName(offer.getBuyer().getFirstName() + " " + offer.getBuyer().getLastName())
				.offerAmount(offer.getOfferAmount())
				.counterAmount(offer.getCounterAmount())
				.agreedAmount(offer.getStatus() == OfferStatus.ACCEPTED ? offer.getAgreedAmount() : null)
				.buyerMessage(offer.getBuyerMessage())
				.adminMessage(offer.getAdminMessage())
				.currency(offer.getCurrency())
				.status(offer.getStatus())
				.expiresAt(offer.getExpiresAt())
				.respondedAt(offer.getRespondedAt())
				.createdAt(offer.getCreatedAt())
				.build();
	}

}
