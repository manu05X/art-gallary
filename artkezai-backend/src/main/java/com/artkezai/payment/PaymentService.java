package com.artkezai.payment;

import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.order.Order;
import com.artkezai.order.OrderRepository;
import com.artkezai.payment.dto.CreatePaymentIntentRequest;
import com.artkezai.user.User;
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

		payment.setStatus(PaymentStatus.SUCCEEDED);
		paymentRepository.save(payment);
		log.info("Payment confirmed via Stripe: {}", paymentIntentId);
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
