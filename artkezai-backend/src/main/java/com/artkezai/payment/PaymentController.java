package com.artkezai.payment;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.payment.dto.CreatePaymentIntentRequest;
import com.artkezai.user.User;
import com.stripe.exception.SignatureVerificationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

	private final PaymentService paymentService;

	@PostMapping("/intent")
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(
			@Valid @RequestBody CreatePaymentIntentRequest request,
			Authentication authentication) {
		User buyer = (User) authentication.getPrincipal();
		log.info("Create payment intent request from: {}", buyer.getEmail());
		Map<String, Object> intent = paymentService.createPaymentIntent(request, buyer);
		return ResponseEntity.ok(ApiResponse.ok(intent));
	}

	// Phase 2.15: intentionally no @PreAuthorize / JWT here — Stripe calls
	// this endpoint directly with no application session. It is public at
	// the HTTP auth layer (see SecurityConfig) and instead authenticated
	// cryptographically inside PaymentService.handleStripeWebhook, which
	// verifies the raw body against the Stripe-Signature header before any
	// DB mutation. `payload` is bound as a plain String — Spring's
	// StringHttpMessageConverter reads the raw request bytes with no JSON
	// parsing/reserialization, which is required for Stripe's signature
	// check to see the exact bytes Stripe signed.
	@PostMapping("/webhook")
	public ResponseEntity<ApiResponse<String>> handleStripeWebhook(
			@RequestBody String payload,
			@RequestHeader(value = "Stripe-Signature", required = false) String sigHeader)
			throws SignatureVerificationException {
		paymentService.handleStripeWebhook(payload, sigHeader);
		return ResponseEntity.ok(ApiResponse.ok("Webhook received"));
	}

	@PostMapping("/{id}/bank-instructions")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<String>> sendBankInstructions(@PathVariable Long id) {
		log.info("Send bank instructions for payment: {}", id);
		paymentService.sendBankInstructions(id);
		return ResponseEntity.ok(ApiResponse.ok("Bank instructions sent"));
	}

	@PostMapping("/{id}/bank-confirm")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<String>> confirmBankTransfer(
			@PathVariable Long id,
			Authentication authentication) {
		User admin = (User) authentication.getPrincipal();
		log.info("Confirm bank transfer for payment: {}", id);
		paymentService.confirmBankTransfer(id, admin);
		return ResponseEntity.ok(ApiResponse.ok("Bank transfer confirmed"));
	}

}
