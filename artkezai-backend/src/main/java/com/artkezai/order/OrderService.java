package com.artkezai.order;

import com.artkezai.notification.NotificationService;
import com.artkezai.artist.dto.ArtistOrderResponse;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.notification.EmailService;
import com.artkezai.offer.Offer;
import com.artkezai.order.dto.CreateOrderRequest;
import com.artkezai.order.dto.OrderDto;
import com.artkezai.order.dto.UpdateShippingRequest;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.payment.Payment;
import com.artkezai.payment.PaymentMethod;
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
import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

	private static final Set<OrderStatus> SHIPPING_STATUSES = EnumSet.of(
			OrderStatus.SHIPPING_IN_PROGRESS, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

	private final OrderRepository orderRepository;
	private final PaintingRepository paintingRepository;
	private final PaymentRepository paymentRepository;
	private final EmailService emailService;
	private final NotificationService notificationService;

	public OrderDto createOrder(CreateOrderRequest request, User buyer) {
		if (request.getOfferId() != null) {
			return completeOfferCheckout(request, buyer);
		}

		Painting painting = paintingRepository.findById(request.getPaintingId())
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", request.getPaintingId()));

		// D2: only live paintings can be bought.
		if (painting.getStatus() != PaintingStatus.APPROVED) {
			throw new BusinessException("This painting is not available for purchase");
		}

		if (orderRepository.existsByPaintingIdAndStatusNot(painting.getId(), OrderStatus.CANCELLED)) {
			throw new BusinessException("This painting is already sold");
		}

		Order order = Order.builder()
				.painting(painting)
				.buyer(buyer)
				.totalPrice(painting.getPrice())
				.currency(painting.getCurrency())
				.status(OrderStatus.PENDING_PAYMENT)
				.build();
		applyShipping(order, request);
		order = orderRepository.save(order);

		createPayment(order, request.getPaymentMethod());
		emailService.sendOrderCreated(order);
		log.info("Order created: {} by buyer: {}", order.getId(), buyer.getEmail());
		return toOrderDto(order);
	}

	// D3/D4: accepting an offer creates the order straight away, priced at the
	// agreed amount. This also reserves the painting, so nobody else can buy
	// it at list price while the buyer completes checkout. Shipping details
	// and the payment method are added later by completeOfferCheckout.
	public Order createOrderForAcceptedOffer(Offer offer) {
		Painting painting = offer.getPainting();

		if (painting.getStatus() != PaintingStatus.APPROVED) {
			throw new BusinessException("This painting is no longer available");
		}

		if (orderRepository.existsByPaintingIdAndStatusNot(painting.getId(), OrderStatus.CANCELLED)) {
			throw new BusinessException("This painting already has an order");
		}

		Order order = Order.builder()
				.painting(painting)
				.buyer(offer.getBuyer())
				.offer(offer)
				.totalPrice(offer.getAgreedAmount())
				.currency(offer.getCurrency())
				.status(OrderStatus.PENDING_PAYMENT)
				.build();
		order = orderRepository.save(order);
		log.info("Order {} created from accepted offer {}", order.getId(), offer.getId());
		return order;
	}

	private OrderDto completeOfferCheckout(CreateOrderRequest request, User buyer) {
		Order order = orderRepository.findByOfferId(request.getOfferId())
				.orElseThrow(() -> new BusinessException("No order exists for this offer. The offer must be accepted first."));

		if (!order.getBuyer().getId().equals(buyer.getId())) {
			throw new UnauthorizedException("You can only check out your own offers");
		}

		if (!order.getPainting().getId().equals(request.getPaintingId())) {
			throw new BusinessException("This offer is for a different painting");
		}

		if (order.getStatus() != OrderStatus.PENDING_PAYMENT || paymentRepository.findByOrderId(order.getId()).isPresent()) {
			throw new BusinessException("Checkout has already been completed for this offer");
		}

		applyShipping(order, request);
		order = orderRepository.save(order);

		createPayment(order, request.getPaymentMethod());
		emailService.sendOrderCreated(order);
		log.info("Offer checkout completed for order: {} by buyer: {}", order.getId(), buyer.getEmail());
		return toOrderDto(order);
	}

	private void applyShipping(Order order, CreateOrderRequest request) {
		order.setShippingName(request.getShippingName());
		order.setShippingEmail(request.getShippingEmail());
		order.setShippingPhone(request.getShippingPhone());
		order.setShippingAddress1(request.getShippingAddress1());
		order.setShippingAddress2(request.getShippingAddress2());
		order.setShippingCity(request.getShippingCity());
		order.setShippingState(request.getShippingState());
		order.setShippingZip(request.getShippingZip());
		order.setShippingCountry(request.getShippingCountry());
	}

	private void createPayment(Order order, PaymentMethod paymentMethod) {
		Payment payment = Payment.builder()
				.order(order)
				.paymentMethod(paymentMethod)
				.status(PaymentStatus.INITIATED)
				.amount(order.getTotalPrice())
				.currency(order.getCurrency())
				.build();
		paymentRepository.save(payment);
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
			// Shipping updates only move a paid order through fulfilment.
			// PAID itself is set by a confirmed payment, never by hand.
			if (!SHIPPING_STATUSES.contains(request.getStatus())) {
				throw new BusinessException("Shipping status must be one of " + SHIPPING_STATUSES);
			}
			if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
				throw new BusinessException("Shipping can only be updated after the order is paid");
			}
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
		notificationService.notifyUser(order.getBuyer(), "SHIPPING_UPDATE",
				"\"" + order.getPainting().getTitle() + "\" is now " + order.getStatus().name().toLowerCase().replace('_', ' '),
				"/dashboard/orders");
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
				.paintingSlug(order.getPainting().getSlug())
				.paymentId(payment.map(Payment::getId).orElse(null))
				.offerId(order.getOffer() != null ? order.getOffer().getId() : null)
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
