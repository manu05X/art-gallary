package com.artkezai.payment;

import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.order.Order;
import com.artkezai.order.OrderRepository;
import com.artkezai.payment.dto.CreatePaymentIntentRequest;
import com.artkezai.user.User;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

	// The only currency this marketplace actually supports today (verified
	// against real painting/order data — Phase 2.16 audit) — not a stand-in
	// for a currency system that doesn't exist yet. USD has 2 decimal places
	// (100 = 1 unit); this deliberately isn't written as a blind "multiply
	// by 100 for any currency" since Stripe has zero-decimal currencies that
	// convert differently — there just aren't any in scope here.
	private static final String SUPPORTED_CURRENCY = "USD";
	private static final Set<String> REUSABLE_STRIPE_STATUSES = Set.of(
			"requires_payment_method", "requires_confirmation", "requires_action", "processing");

	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;

	@Value("${stripe.publishable-key:pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY}")
	private String stripePublishableKey;

	@Value("${stripe.webhook-secret}")
	private String stripeWebhookSecret;

	@Value("${stripe.secret-key}")
	private String stripeSecretKey;

	// Stripe's Java SDK is configured via this static field rather than a
	// per-call option — set once when this singleton bean initializes. If
	// stripe.secret-key can't resolve, Spring already fails to start before
	// this ever runs (see application.yml).
	@PostConstruct
	private void initStripeApiKey() {
		Stripe.apiKey = stripeSecretKey;
	}

	// Phase 2.16: creates a genuine Stripe PaymentIntent. The client sends
	// only orderId (CreatePaymentIntentRequest has no amount/currency field
	// at all — the frontend was never authoritative for money here); amount
	// and currency are read from the Payment row already persisted at order
	// creation time (OrderService.createOrder derives it from the painting's
	// price/currency), never recomputed from anything client-supplied.
	public Map<String, Object> createPaymentIntent(CreatePaymentIntentRequest request, User buyer) {
		Order order = orderRepository.findById(request.getOrderId())
				.orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

		if (!order.getBuyer().getId().equals(buyer.getId())) {
			throw new BusinessException("You can only create payment for your own orders");
		}

		Payment payment = paymentRepository.findByOrderId(order.getId())
				.orElseThrow(() -> new BusinessException("Payment not found for order"));

		if (payment.getPaymentMethod() != PaymentMethod.ONLINE) {
			throw new BusinessException("This order requires bank transfer payment");
		}

		if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
			throw new BusinessException("This order has already been paid");
		}

		if (!SUPPORTED_CURRENCY.equalsIgnoreCase(payment.getCurrency())) {
			throw new BusinessException("Unsupported currency for online payment: " + payment.getCurrency());
		}

		if (payment.getAmount() == null || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException("Invalid payment amount");
		}

		try {
			// A Payment row is 1:1 with an Order (created once, at order
			// creation — see OrderService.createOrder), so a retry/double
			// click always resolves to this same row. Reuse its existing
			// Stripe PaymentIntent if one is still open, rather than
			// creating a new Stripe object on every call.
			if (payment.getStripePaymentIntentId() != null) {
				PaymentIntent existing = PaymentIntent.retrieve(payment.getStripePaymentIntentId());
				if (REUSABLE_STRIPE_STATUSES.contains(existing.getStatus())) {
					log.info("Reusing existing Stripe payment intent {} for order: {}", existing.getId(), order.getId());
					return buildIntentResponse(existing.getClientSecret());
				}
			}

			long amountInSmallestUnit = payment.getAmount()
					.movePointRight(2)
					.setScale(0, RoundingMode.UNNECESSARY)
					.longValueExact();

			PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
					.setAmount(amountInSmallestUnit)
					.setCurrency(payment.getCurrency().toLowerCase())
					.putMetadata("orderId", String.valueOf(order.getId()))
					.putMetadata("paymentId", String.valueOf(payment.getId()))
					.build();

			PaymentIntent intent = PaymentIntent.create(params);

			payment.setStripePaymentIntentId(intent.getId());
			payment.setStatus(PaymentStatus.INITIATED);
			paymentRepository.save(payment);

			log.info("Stripe payment intent created: {} for order: {}, payment: {}", intent.getId(), order.getId(), payment.getId());
			return buildIntentResponse(intent.getClientSecret());
		} catch (StripeException ex) {
			log.error("Stripe PaymentIntent request failed for order: {}, payment: {} — {}",
					order.getId(), payment.getId(), ex.getMessage());
			throw new BusinessException("Unable to process payment at this time. Please try again.");
		}
	}

	private Map<String, Object> buildIntentResponse(String clientSecret) {
		Map<String, Object> response = new HashMap<>();
		response.put("clientSecret", clientSecret);
		response.put("publishableKey", stripePublishableKey);
		return response;
	}

	public void confirmStripePayment(String paymentIntentId) {
		Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
				.orElseThrow(() -> new BusinessException("Payment not found"));

		// Naturally idempotent: setting an already-SUCCEEDED payment to
		// SUCCEEDED again is a no-op state-wise (Phase 2.15) — Stripe retries
		// webhook delivery, so this method may run more than once for the
		// same payment intent.
		payment.setStatus(PaymentStatus.SUCCEEDED);
		paymentRepository.save(payment);
		log.info("Payment confirmed via Stripe: {}", paymentIntentId);
	}

	// Phase 2.15: verifies the raw payload against the Stripe-Signature
	// header using the Stripe SDK's own HMAC verification (Webhook.
	// constructEvent) before any DB mutation is even considered. Only
	// payment_intent.succeeded is dispatched — the one event type
	// confirmStripePayment already existed to handle; every other event
	// type is acknowledged (200) but otherwise ignored, since this phase is
	// scoped to authenticating the webhook, not expanding what it does.
	public void handleStripeWebhook(String payload, String sigHeader) throws SignatureVerificationException {
		if (sigHeader == null || sigHeader.isBlank()) {
			throw new SignatureVerificationException("Missing Stripe-Signature header", null);
		}

		Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
		log.info("Stripe webhook verified — event id: {}, type: {}", event.getId(), event.getType());

		if (!"payment_intent.succeeded".equals(event.getType())) {
			log.info("Ignoring unhandled Stripe event type: {}", event.getType());
			return;
		}

		// Stripe's typed deserialization (getObject()) can legitimately come
		// back empty for a genuine event when the event's api_version
		// doesn't match this SDK build's pinned version — a known SDK
		// behavior, not specific to any test payload. Falling back to the
		// raw JSON's "id" field (same field Stripe's own object model reads)
		// keeps a correctly-signed event effective even when that happens,
		// without adding a dependency on the typed PaymentIntent shape.
		String paymentIntentId = event.getDataObjectDeserializer().getObject()
				.filter(PaymentIntent.class::isInstance)
				.map(o -> ((PaymentIntent) o).getId())
				.orElseGet(() -> extractIdFromRawJson(event.getDataObjectDeserializer().getRawJson()));

		if (paymentIntentId == null) {
			log.warn("Could not determine payment intent id for Stripe event: {}", event.getId());
			return;
		}

		try {
			confirmStripePayment(paymentIntentId);
		} catch (BusinessException ex) {
			// No local Payment row references this intent id — acknowledge
			// and drop rather than fail, so Stripe doesn't retry a delivery
			// that will never succeed.
			log.warn("Stripe webhook for unrecognized payment intent: {}", paymentIntentId);
		}
	}

	private String extractIdFromRawJson(String rawJson) {
		if (rawJson == null) {
			return null;
		}
		try {
			return com.google.gson.JsonParser.parseString(rawJson)
					.getAsJsonObject()
					.get("id")
					.getAsString();
		} catch (RuntimeException ex) {
			return null;
		}
	}

	public void sendBankInstructions(Long paymentId) {
		Payment payment = paymentRepository.findById(paymentId)
				.orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

		if (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
			throw new BusinessException("This payment is not via bank transfer");
		}

		String instructions = "Please transfer " + payment.getAmount() + " " + payment.getCurrency() +
				" to our bank account. Account details will be provided.";

		payment.setBankInstructions(instructions);
		payment.setStatus(PaymentStatus.INSTRUCTIONS_SENT);
		paymentRepository.save(payment);
		log.info("Bank instructions sent for payment: {}", paymentId);
	}

	public void confirmBankTransfer(Long paymentId, User admin) {
		Payment payment = paymentRepository.findById(paymentId)
				.orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

		payment.setStatus(PaymentStatus.CONFIRMED);
		payment.setConfirmedByAdmin(admin);
		payment.setConfirmedAt(LocalDateTime.now());
		paymentRepository.save(payment);
		log.info("Bank transfer confirmed for payment: {} by admin: {}", paymentId, admin.getEmail());
	}

}
