package com.artkezai.payment;

import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.order.Order;
import com.artkezai.order.OrderRepository;
import com.artkezai.payment.dto.CreatePaymentIntentRequest;
import com.artkezai.user.User;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;

	@Value("${stripe.publishable-key:pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY}")
	private String stripePublishableKey;

	@Value("${stripe.webhook-secret}")
	private String stripeWebhookSecret;

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

		// In a real implementation, this would call Stripe API
		String clientSecret = "pi_" + System.nanoTime();
		payment.setStripePaymentIntentId(clientSecret);
		payment.setStatus(PaymentStatus.INITIATED);
		paymentRepository.save(payment);

		Map<String, Object> response = new HashMap<>();
		response.put("clientSecret", clientSecret);
		response.put("publishableKey", stripePublishableKey);

		log.info("Payment intent created for order: {}", order.getId());
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
