package com.artkezai.order;

import com.artkezai.artist.dto.ArtistOrderResponse;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.notification.EmailService;
import com.artkezai.offer.Offer;
import com.artkezai.offer.OfferRepository;
import com.artkezai.order.dto.CreateOrderRequest;
import com.artkezai.order.dto.OrderDto;
import com.artkezai.order.dto.UpdateShippingRequest;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.payment.Payment;
import com.artkezai.payment.PaymentRepository;
import com.artkezai.payment.PaymentStatus;
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
public class OrderService {

	private final OrderRepository orderRepository;
	private final PaintingRepository paintingRepository;
	private final OfferRepository offerRepository;
	private final PaymentRepository paymentRepository;
	private final EmailService emailService;

	public OrderDto createOrder(CreateOrderRequest request, User buyer) {
		Painting painting = paintingRepository.findById(request.getPaintingId())
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", request.getPaintingId()));

		if (orderRepository.existsByPaintingId(painting.getId())) {
			throw new BusinessException("This painting is already sold");
		}

		Order order = Order.builder()
				.painting(painting)
				.buyer(buyer)
				.totalPrice(painting.getPrice())
				.currency(painting.getCurrency())
				.status(OrderStatus.PENDING_PAYMENT)
				.shippingName(request.getShippingName())
				.shippingEmail(request.getShippingEmail())
				.shippingPhone(request.getShippingPhone())
				.shippingAddress1(request.getShippingAddress1())
				.shippingAddress2(request.getShippingAddress2())
				.shippingCity(request.getShippingCity())
				.shippingState(request.getShippingState())
				.shippingZip(request.getShippingZip())
				.shippingCountry(request.getShippingCountry())
				.build();

		if (request.getOfferId() != null) {
			Offer offer = offerRepository.findById(request.getOfferId())
					.orElseThrow(() -> new ResourceNotFoundException("Offer", "id", request.getOfferId()));
			order.setOffer(offer);
		}

		order = orderRepository.save(order);

		Payment payment = Payment.builder()
				.order(order)
				.paymentMethod(request.getPaymentMethod())
				.status(PaymentStatus.INITIATED)
				.amount(order.getTotalPrice())
				.currency(order.getCurrency())
				.build();

		paymentRepository.save(payment);
		emailService.sendOrderCreated(order);
		log.info("Order created: {} by buyer: {}", order.getId(), buyer.getEmail());
		return toOrderDto(order);
	}

	@Transactional(readOnly = true)
	public Page<OrderDto> getBuyerOrders(User buyer, Pageable pageable) {
		return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageable)
				.map(this::toOrderDto);
	}

	@Transactional(readOnly = true)
	public Page<OrderDto> getAllOrders(Pageable pageable) {
		return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
				.map(this::toOrderDto);
	}

	// Phase 2.12: orders on the given artist's own paintings — scoped by the
	// artist profile id resolved server-side from the caller's identity
	// (see ArtistController), never a client-supplied id.
	@Transactional(readOnly = true)
	public Page<ArtistOrderResponse> getArtistOrders(Long artistId, Pageable pageable) {
		return orderRepository.findByPainting_Artist_IdOrderByCreatedAtDesc(artistId, pageable)
				.map(this::toArtistOrderResponse);
	}

	// Phase 2.13: previously had no ownership check at all — any authenticated
	// BUYER could fetch any order by id (an IDOR), exposing another buyer's
	// shipping name/address/city/country. Mirrors the ownership check
	// PaymentService.createPaymentIntent already uses for the same Order
	// entity, just never applied here. ADMIN may view any order by design.
	@Transactional(readOnly = true)
	public OrderDto getOrder(Long orderId, User requester) {
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

		boolean isOwner = order.getBuyer().getId().equals(requester.getId());
		boolean isAdmin = requester.getRole() == UserRole.ADMIN;
		if (!isOwner && !isAdmin) {
			throw new UnauthorizedException("You can only view your own orders");
		}

		return toOrderDto(order);
	}

	public OrderDto updateShipping(Long orderId, UpdateShippingRequest request) {
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

		if (request.getStatus() != null) {
			order.setStatus(request.getStatus());

			if (request.getStatus() == OrderStatus.SHIPPED) {
				order.setShippedAt(LocalDateTime.now());
			} else if (request.getStatus() == OrderStatus.DELIVERED) {
				order.setDeliveredAt(LocalDateTime.now());
			}
		}

		if (request.getTrackingNumber() != null) {
			order.setTrackingNumber(request.getTrackingNumber());
		}

		if (request.getTrackingUrl() != null) {
			order.setTrackingUrl(request.getTrackingUrl());
		}

		order = orderRepository.save(order);
		emailService.sendShippingUpdate(order);
		log.info("Order shipping updated: {}", orderId);
		return toOrderDto(order);
	}

	private OrderDto toOrderDto(Order order) {
		Optional<String> thumbnailUrl = order.getPainting().getImages().stream()
				.filter(img -> img.getIsPrimary() || img.getThumbnailUrl() != null)
				.findFirst()
				.map(img -> img.getThumbnailUrl() != null ? img.getThumbnailUrl() : img.getUrl());

		Optional<Payment> payment = paymentRepository.findByOrderId(order.getId());

		return OrderDto.builder()
				.id(order.getId())
				.paintingId(order.getPainting().getId())
				.paintingTitle(order.getPainting().getTitle())
				.paintingThumbnailUrl(thumbnailUrl.orElse(null))
				.buyerId(order.getBuyer().getId())
				.buyerName(order.getBuyer().getFirstName() + " " + order.getBuyer().getLastName())
				.totalPrice(order.getTotalPrice())
				.currency(order.getCurrency())
				.status(order.getStatus())
				.paymentMethod(payment.map(p -> p.getPaymentMethod()).orElse(null))
				.paymentStatus(payment.map(p -> p.getStatus()).orElse(null))
				.shippingName(order.getShippingName())
				.shippingAddress1(order.getShippingAddress1())
				.shippingCity(order.getShippingCity())
				.shippingCountry(order.getShippingCountry())
				.trackingNumber(order.getTrackingNumber())
				.trackingUrl(order.getTrackingUrl())
				.shippedAt(order.getShippedAt())
				.deliveredAt(order.getDeliveredAt())
				.createdAt(order.getCreatedAt())
				.build();
	}

	private ArtistOrderResponse toArtistOrderResponse(Order order) {
		Optional<String> thumbnailUrl = order.getPainting().getImages().stream()
				.filter(img -> img.getIsPrimary() || img.getThumbnailUrl() != null)
				.findFirst()
				.map(img -> img.getThumbnailUrl() != null ? img.getThumbnailUrl() : img.getUrl());

		return ArtistOrderResponse.builder()
				.id(order.getId())
				.paintingId(order.getPainting().getId())
				.paintingTitle(order.getPainting().getTitle())
				.paintingSlug(order.getPainting().getSlug())
				.paintingThumbnailUrl(thumbnailUrl.orElse(null))
				.totalPrice(order.getTotalPrice())
				.currency(order.getCurrency())
				.status(order.getStatus())
				.createdAt(order.getCreatedAt())
				.build();
	}

}
