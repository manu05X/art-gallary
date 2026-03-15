package com.artkezai.payment;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.payment.dto.CreatePaymentIntentRequest;
import com.artkezai.user.User;
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

	@PostMapping("/webhook")
	public ResponseEntity<ApiResponse<String>> handleStripeWebhook(@RequestBody String payload) {
		log.info("Stripe webhook received");
		// In a real implementation, validate Stripe signature and process event
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
