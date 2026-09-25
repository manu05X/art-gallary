package com.artkezai.payment;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import com.artkezai.notification.NotificationService;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.order.Order;
import com.artkezai.order.OrderRepository;
import com.artkezai.order.OrderStatus;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import com.stripe.exception.SignatureVerificationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static com.artkezai.TestData.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

	@Mock
	private PaymentRepository paymentRepository;
	@Mock
	private OrderRepository orderRepository;
	@Mock
	private PaintingRepository paintingRepository;

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private PaymentService paymentService;

	private final User buyer = user(1, UserRole.BUYER);
	private final User admin = user(9, UserRole.ADMIN);
	private Painting painting;
	private Order order;

	@BeforeEach
	void setUp() {
		painting = painting(10, PaintingStatus.APPROVED, user(2, UserRole.ARTIST));
		order = order(20, painting, buyer, OrderStatus.PENDING_PAYMENT);
	}

	@Test
	void stripeConfirmationMarksPaymentSucceededOrderPaidAndPaintingSold() {
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.INITIATED);
		when(paymentRepository.findByStripePaymentIntentId("pi_1")).thenReturn(Optional.of(payment));

		paymentService.confirmStripePayment("pi_1");

		assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
		assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.SOLD);
		verify(orderRepository).save(order);
		verify(paintingRepository).save(painting);
	}

	@Test
	void repeatedStripeConfirmationDoesNotRewindAShippedOrder() {
		order.setStatus(OrderStatus.SHIPPED);
		painting.setStatus(PaintingStatus.SOLD);
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.SUCCEEDED);
		when(paymentRepository.findByStripePaymentIntentId("pi_1")).thenReturn(Optional.of(payment));

		paymentService.confirmStripePayment("pi_1");

		assertThat(order.getStatus()).isEqualTo(OrderStatus.SHIPPED);
		verify(orderRepository, never()).save(any());
		verify(paintingRepository, never()).save(any());
	}

	@Test
	void bankTransferConfirmationMarksOrderPaidAndPaintingSold() {
		Payment payment = payment(30, order, PaymentMethod.BANK_TRANSFER, PaymentStatus.INSTRUCTIONS_SENT);
		when(paymentRepository.findById(30L)).thenReturn(Optional.of(payment));

		paymentService.confirmBankTransfer(30L, admin);

		assertThat(payment.getStatus()).isEqualTo(PaymentStatus.CONFIRMED);
		assertThat(payment.getConfirmedByAdmin()).isEqualTo(admin);
		assertThat(payment.getConfirmedAt()).isNotNull();
		assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.SOLD);
	}

	@Test
	void bankTransferCannotBeConfirmedBeforeInstructionsAreSent() {
		Payment payment = payment(30, order, PaymentMethod.BANK_TRANSFER, PaymentStatus.INITIATED);
		when(paymentRepository.findById(30L)).thenReturn(Optional.of(payment));

		assertThatThrownBy(() -> paymentService.confirmBankTransfer(30L, admin))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("after instructions are sent");
		assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
		verify(paymentRepository, never()).save(any());
	}

	@Test
	void onlinePaymentCannotBeConfirmedAsBankTransfer() {
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.INITIATED);
		when(paymentRepository.findById(30L)).thenReturn(Optional.of(payment));

		assertThatThrownBy(() -> paymentService.confirmBankTransfer(30L, admin))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("not via bank transfer");
	}

	@Test
	void bankInstructionsMoveBankPaymentToInstructionsSent() {
		Payment payment = payment(30, order, PaymentMethod.BANK_TRANSFER, PaymentStatus.INITIATED);
		when(paymentRepository.findById(30L)).thenReturn(Optional.of(payment));

		paymentService.sendBankInstructions(30L);

		assertThat(payment.getStatus()).isEqualTo(PaymentStatus.INSTRUCTIONS_SENT);
		assertThat(payment.getBankInstructions()).isNotBlank();
	}

	@Test
	void bankInstructionsRejectOnlinePayments() {
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.INITIATED);
		when(paymentRepository.findById(30L)).thenReturn(Optional.of(payment));

		assertThatThrownBy(() -> paymentService.sendBankInstructions(30L))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void webhookWithoutSignatureIsRejectedBeforeAnyWrite() {
		assertThatThrownBy(() -> paymentService.handleStripeWebhook("{}", null))
				.isInstanceOf(SignatureVerificationException.class);
		verifyNoInteractions(paymentRepository, orderRepository, paintingRepository);
	}

	@Test
	void paymentSyncIsLimitedToTheOrdersBuyer() {
		when(orderRepository.findById(20L)).thenReturn(Optional.of(order));

		assertThatThrownBy(() -> paymentService.syncStripePayment(20L, user(3, UserRole.BUYER)))
				.isInstanceOf(BusinessException.class);
		verifyNoInteractions(paymentRepository);
	}

	@Test
	void paymentSyncReturnsStatusWithoutCallingStripeForBankTransfers() {
		Payment payment = payment(30, order, PaymentMethod.BANK_TRANSFER, PaymentStatus.INSTRUCTIONS_SENT);
		when(orderRepository.findById(20L)).thenReturn(Optional.of(order));
		when(paymentRepository.findByOrderId(20L)).thenReturn(Optional.of(payment));

		assertThat(paymentService.syncStripePayment(20L, buyer)).isEqualTo(PaymentStatus.INSTRUCTIONS_SENT);
	}

	@Test
	void latePaymentOnAReleasedReservationDoesNotSellThePainting() {
		order.setStatus(OrderStatus.CANCELLED);
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.FAILED);
		when(paymentRepository.findByStripePaymentIntentId("pi_1")).thenReturn(Optional.of(payment));

		paymentService.confirmStripePayment("pi_1");

		assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.APPROVED);
		verify(paintingRepository, never()).save(any());
	}

	@Test
	void paidOrderNotifiesBuyerAndAdmins() {
		Payment payment = payment(30, order, PaymentMethod.ONLINE, PaymentStatus.INITIATED);
		when(paymentRepository.findByStripePaymentIntentId("pi_1")).thenReturn(Optional.of(payment));

		paymentService.confirmStripePayment("pi_1");

		verify(notificationService).notifyUser(eq(buyer), eq("ORDER_PAID"), anyString(), eq("/dashboard/orders"));
		verify(notificationService).notifyAdmins(eq("ORDER_PAID"), anyString(), eq("/admin/orders"));
	}
}
