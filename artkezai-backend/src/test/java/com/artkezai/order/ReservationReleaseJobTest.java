package com.artkezai.order;

import com.artkezai.offer.Offer;
import com.artkezai.offer.OfferStatus;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.payment.Payment;
import com.artkezai.payment.PaymentMethod;
import com.artkezai.payment.PaymentStatus;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static com.artkezai.TestData.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationReleaseJobTest {

	@Mock
	private OrderRepository orderRepository;

	@InjectMocks
	private ReservationReleaseJob job;

	private final User buyer = user(1, UserRole.BUYER);
	private Painting painting;
	private Order order;

	@BeforeEach
	void setUp() {
		ReflectionTestUtils.setField(job, "holdHours", 72L);
		painting = painting(10, PaintingStatus.APPROVED, user(2, UserRole.ARTIST));
		order = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
		when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING_PAYMENT), any())).thenReturn(List.of(order));
	}

	@Test
	void acceptedOfferNeverCheckedOutIsReleased() {
		Offer offer = offer(40, painting, buyer, OfferStatus.ACCEPTED);
		order.setOffer(offer);

		job.releaseExpiredReservations();

		assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
		assertThat(offer.getStatus()).isEqualTo(OfferStatus.EXPIRED);
		verify(orderRepository).save(order);
	}

	@Test
	void unpaidOnlineOrderIsReleased() {
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.INITIATED);
		order.setPayment(payment);

		job.releaseExpiredReservations();

		assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
		assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
	}

	@Test
	void bankTransferOrdersAreLeftForTheGallery() {
		order.setPayment(payment(30, order, PaymentMethod.BANK_TRANSFER, PaymentStatus.INITIATED));

		job.releaseExpiredReservations();

		assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
		verify(orderRepository, never()).save(any());
	}
}
