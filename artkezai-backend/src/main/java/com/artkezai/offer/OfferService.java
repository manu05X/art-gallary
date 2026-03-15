package com.artkezai.offer;

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
import com.artkezai.user.User;
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
	public OfferDto getOffer(Long offerId) {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));
		return toOfferDto(offer);
	}

	public OfferDto respondToOffer(Long offerId, RespondOfferRequest request) {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

		if (request.getAction() == RespondOfferRequest.OfferAction.ACCEPT) {
			offer.setStatus(OfferStatus.ACCEPTED);
			offer.setRespondedAt(LocalDateTime.now());
		} else if (request.getAction() == RespondOfferRequest.OfferAction.REJECT) {
			offer.setStatus(OfferStatus.REJECTED);
			offer.setRespondedAt(LocalDateTime.now());
		} else if (request.getAction() == RespondOfferRequest.OfferAction.COUNTER) {
			if (request.getCounterAmount() == null) {
				throw new BusinessException("Counter amount is required for counter offer");
			}
			offer.setStatus(OfferStatus.COUNTERED);
			offer.setCounterAmount(request.getCounterAmount());
			offer.setRespondedAt(LocalDateTime.now());
		}

		offer.setAdminMessage(request.getMessage());
		offer = offerRepository.save(offer);
		emailService.sendOfferResponse(offer);
		log.info("Offer {} responded with action: {}", offerId, request.getAction());
		return toOfferDto(offer);
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
				.paintingThumbnailUrl(thumbnailUrl.orElse(null))
				.buyerName(offer.getBuyer().getFirstName() + " " + offer.getBuyer().getLastName())
				.offerAmount(offer.getOfferAmount())
				.counterAmount(offer.getCounterAmount())
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
