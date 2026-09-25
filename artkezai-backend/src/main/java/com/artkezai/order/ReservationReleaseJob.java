package com.artkezai.order;

import com.artkezai.offer.OfferStatus;
import com.artkezai.payment.Payment;
import com.artkezai.payment.PaymentMethod;
import com.artkezai.payment.PaymentStatus;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

// An unpaid order reserves its painting (no one else can buy it). This job
// releases reservations nobody is paying for: an accepted offer whose buyer
// never completed checkout, or an online order whose card payment never
// succeeded. Bank-transfer orders are never released automatically; the
// gallery handles those by hand.
@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationReleaseJob {

	private final OrderRepository orderRepository;

	@Value("${app.reservation.hold-hours:72}")
	private long holdHours;

	@Scheduled(fixedDelayString = "${app.reservation.check-interval-ms:900000}", initialDelay = 60000)
	@Transactional
	public void releaseExpiredReservations() {
		LocalDateTime cutoff = LocalDateTime.now().minusHours(holdHours);
		int released = 0;
		for (Order order : orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING_PAYMENT, cutoff)) {
			if (isAbandoned(order.getPayment())) {
				release(order);
				released++;
			}
		}
		if (released > 0) {
			log.info("Released {} unpaid reservation(s) older than {}h", released, holdHours);
		}
	}

	private boolean isAbandoned(Payment payment) {
		if (payment == null) {
			return true; // accepted offer, checkout never completed
		}
		// Unpaid card payment. A bank transfer at INITIATED is waiting on the
		// gallery to send instructions, not on the buyer, so it is kept.
		return payment.getPaymentMethod() == PaymentMethod.ONLINE
				&& payment.getStatus() == PaymentStatus.INITIATED;
	}

	private void release(Order order) {
		order.setStatus(OrderStatus.CANCELLED);
		order.setAdminNotes("Reservation released after " + holdHours + "h without payment");
		if (order.getOffer() != null) {
			order.getOffer().setStatus(OfferStatus.EXPIRED);
		}
		Payment payment = order.getPayment();
		if (payment != null) {
			payment.setStatus(PaymentStatus.FAILED);
			cancelStripeIntent(payment);
		}
		orderRepository.save(order);
		log.info("Released reservation: order {} for painting {}", order.getId(), order.getPainting().getId());
	}

	// Best effort: stops a late card payment on an intent we no longer honour.
	private void cancelStripeIntent(Payment payment) {
		if (payment.getStripePaymentIntentId() == null) {
			return;
		}
		try {
			PaymentIntent.retrieve(payment.getStripePaymentIntentId()).cancel();
		} catch (StripeException | RuntimeException ex) {
			log.warn("Could not cancel Stripe intent {}: {}", payment.getStripePaymentIntentId(), ex.getMessage());
		}
	}
}
