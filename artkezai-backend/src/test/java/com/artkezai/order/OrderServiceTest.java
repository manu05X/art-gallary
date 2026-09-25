package com.artkezai.order;

import com.artkezai.notification.NotificationService;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.notification.EmailService;
import com.artkezai.offer.Offer;
import com.artkezai.offer.OfferStatus;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static com.artkezai.TestData.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

	@Mock
	private OrderRepository orderRepository;
	@Mock
	private PaintingRepository paintingRepository;
	@Mock
	private PaymentRepository paymentRepository;
	@Mock
	private EmailService emailService;

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private OrderService orderService;

	private final User buyer = user(1, UserRole.BUYER);
	private Painting painting;

	@BeforeEach
	void setUp() {
		painting = painting(10, PaintingStatus.APPROVED, user(2, UserRole.ARTIST));
	}

	private CreateOrderRequest checkout(Long offerId) {
		return CreateOrderRequest.builder()
				.paintingId(painting.getId())
				.offerId(offerId)
				.shippingName("Buyer One")
				.shippingEmail("buyer@example.test")
				.shippingAddress1("1 Gallery Road")
				.shippingCity("Paris")
				.shippingZip("75001")
				.shippingCountry("France")
				.paymentMethod(PaymentMethod.BANK_TRANSFER)
				.build();
	}

	private void saveReturnsArgument() {
		when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
	}

	@Test
	void buyNowCreatesPendingOrderAndPaymentAtListPrice() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		saveReturnsArgument();

		OrderDto dto = orderService.createOrder(checkout(null), buyer);

		assertThat(dto.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
		assertThat(dto.getTotalPrice()).isEqualByComparingTo("1000.00");
		ArgumentCaptor<Payment> payment = ArgumentCaptor.forClass(Payment.class);
		verify(paymentRepository).save(payment.capture());
		assertThat(payment.getValue().getAmount()).isEqualByComparingTo("1000.00");
		assertThat(payment.getValue().getPaymentMethod()).isEqualTo(PaymentMethod.BANK_TRANSFER);
	}

	@Test
	void unapprovedPaintingCannotBeBought() {
		painting.setStatus(PaintingStatus.UNDER_REVIEW);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> orderService.createOrder(checkout(null), buyer))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("not available");
		verify(orderRepository, never()).save(any());
	}

	@Test
	void paintingWithAnExistingOrderCannotBeBoughtAgain() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		when(orderRepository.existsByPaintingIdAndStatusNot(10L, OrderStatus.CANCELLED)).thenReturn(true);

		assertThatThrownBy(() -> orderService.createOrder(checkout(null), buyer))
				.isInstanceOf(BusinessException.class);
		verify(orderRepository, never()).save(any());
	}

	@Test
	void acceptedOfferCreatesOrderAtTheOfferAmount() {
		Offer offer = offer(40, painting, buyer, OfferStatus.ACCEPTED);
		saveReturnsArgument();

		Order order = orderService.createOrderForAcceptedOffer(offer);

		assertThat(order.getTotalPrice()).isEqualByComparingTo("800.00");
		assertThat(order.getOffer()).isEqualTo(offer);
		assertThat(order.getBuyer()).isEqualTo(buyer);
		assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
	}

	@Test
	void acceptedCounterOfferCreatesOrderAtTheCounterAmount() {
		Offer offer = offer(40, painting, buyer, OfferStatus.ACCEPTED);
		offer.setCounterAmount(new BigDecimal("900.00"));
		saveReturnsArgument();

		Order order = orderService.createOrderForAcceptedOffer(offer);

		assertThat(order.getTotalPrice()).isEqualByComparingTo("900.00");
	}

	@Test
	void offerCannotCreateOrderWhenPaintingAlreadyHasOne() {
		Offer offer = offer(40, painting, buyer, OfferStatus.ACCEPTED);
		when(orderRepository.existsByPaintingIdAndStatusNot(10L, OrderStatus.CANCELLED)).thenReturn(true);

		assertThatThrownBy(() -> orderService.createOrderForAcceptedOffer(offer))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void offerCheckoutAddsShippingAndPaymentToTheReservedOrder() {
		Offer offer = offer(40, painting, buyer, OfferStatus.ACCEPTED);
		Order reserved = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
		reserved.setOffer(offer);
		reserved.setTotalPrice(new BigDecimal("800.00"));
		when(orderRepository.findByOfferId(40L)).thenReturn(Optional.of(reserved));
		saveReturnsArgument();

		OrderDto dto = orderService.createOrder(checkout(40L), buyer);

		assertThat(dto.getId()).isEqualTo(20L);
		assertThat(reserved.getShippingCity()).isEqualTo("Paris");
		ArgumentCaptor<Payment> payment = ArgumentCaptor.forClass(Payment.class);
		verify(paymentRepository).save(payment.capture());
		assertThat(payment.getValue().getAmount()).isEqualByComparingTo("800.00");
	}

	@Test
	void offerCheckoutIsLimitedToTheOffersBuyer() {
		Order reserved = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
		when(orderRepository.findByOfferId(40L)).thenReturn(Optional.of(reserved));

		assertThatThrownBy(() -> orderService.createOrder(checkout(40L), user(3, UserRole.BUYER)))
				.isInstanceOf(UnauthorizedException.class);
		verify(paymentRepository, never()).save(any());
	}

	@Test
	void offerCheckoutCannotRunTwice() {
		Order reserved = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
		when(orderRepository.findByOfferId(40L)).thenReturn(Optional.of(reserved));
		when(paymentRepository.findByOrderId(20L))
				.thenReturn(Optional.of(payment(30, reserved, PaymentMethod.ONLINE, PaymentStatus.INITIATED)));

		assertThatThrownBy(() -> orderService.createOrder(checkout(40L), buyer))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("already been completed");
	}

	@Test
	void offerCheckoutRequiresAnAcceptedOffer() {
		when(orderRepository.findByOfferId(40L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> orderService.createOrder(checkout(40L), buyer))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("must be accepted first");
	}

	@Test
	void buyerCannotViewSomeoneElsesOrder() {
		Order order = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
		when(orderRepository.findById(20L)).thenReturn(Optional.of(order));

		assertThatThrownBy(() -> orderService.getOrder(20L, user(3, UserRole.BUYER)))
				.isInstanceOf(UnauthorizedException.class);
	}

	@Test
	void unpaidOrderCannotBeMarkedAsShipped() {
		Order order = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
		when(orderRepository.findById(20L)).thenReturn(Optional.of(order));

		assertThatThrownBy(() -> orderService.updateShipping(20L,
				new UpdateShippingRequest(OrderStatus.SHIPPED, "TRK1", null)))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("after the order is paid");
	}

	@Test
	void shippingUpdateCannotMarkAnOrderPaid() {
		Order order = order(20, painting, buyer, OrderStatus.PAID);
		when(orderRepository.findById(20L)).thenReturn(Optional.of(order));

		assertThatThrownBy(() -> orderService.updateShipping(20L,
				new UpdateShippingRequest(OrderStatus.PAID, null, null)))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void paidOrderCanBeShippedWithTracking() {
		Order order = order(20, painting, buyer, OrderStatus.PAID);
		when(orderRepository.findById(20L)).thenReturn(Optional.of(order));
		saveReturnsArgument();

		orderService.updateShipping(20L,
				new UpdateShippingRequest(OrderStatus.SHIPPED, "TRK1", "https://track.example/TRK1"));

		assertThat(order.getStatus()).isEqualTo(OrderStatus.SHIPPED);
		assertThat(order.getShippedAt()).isNotNull();
		assertThat(order.getTrackingNumber()).isEqualTo("TRK1");
	}
}
