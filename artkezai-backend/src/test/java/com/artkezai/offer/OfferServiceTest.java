package com.artkezai.offer;

import com.artkezai.notification.NotificationService;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.notification.EmailService;
import com.artkezai.offer.dto.MakeOfferRequest;
import com.artkezai.offer.dto.OfferDto;
import com.artkezai.offer.dto.RespondOfferRequest;
import com.artkezai.offer.dto.RespondOfferRequest.OfferAction;
import com.artkezai.order.OrderService;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static com.artkezai.TestData.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

	@Mock
	private OfferRepository offerRepository;
	@Mock
	private PaintingRepository paintingRepository;
	@Mock
	private EmailService emailService;
	@Mock
	private OrderService orderService;

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private OfferService offerService;

	private final User buyer = user(1, UserRole.BUYER);
	private Painting painting;

	@BeforeEach
	void setUp() {
		painting = painting(10, PaintingStatus.APPROVED, user(2, UserRole.ARTIST));
	}

	private Offer stored(OfferStatus status) {
		Offer offer = offer(40, painting, buyer, status);
		when(offerRepository.findById(40L)).thenReturn(Optional.of(offer));
		return offer;
	}

	private void saveReturnsArgument() {
		when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
	}

	@Test
	void adminAcceptCreatesTheOrder() {
		Offer offer = stored(OfferStatus.SUBMITTED);
		saveReturnsArgument();

		OfferDto dto = offerService.respondToOffer(40L, new RespondOfferRequest(OfferAction.ACCEPT, null, "Deal"));

		assertThat(dto.getStatus()).isEqualTo(OfferStatus.ACCEPTED);
		assertThat(dto.getAgreedAmount()).isEqualByComparingTo("800.00");
		verify(orderService).createOrderForAcceptedOffer(offer);
	}

	@Test
	void adminCounterRecordsTheCounterAmountWithoutAnOrder() {
		Offer offer = stored(OfferStatus.SUBMITTED);
		saveReturnsArgument();

		offerService.respondToOffer(40L, new RespondOfferRequest(OfferAction.COUNTER, new BigDecimal("900.00"), null));

		assertThat(offer.getStatus()).isEqualTo(OfferStatus.COUNTERED);
		assertThat(offer.getCounterAmount()).isEqualByComparingTo("900.00");
		verifyNoInteractions(orderService);
	}

	@Test
	void counterWithoutAPositiveAmountIsRejected() {
		stored(OfferStatus.SUBMITTED);

		assertThatThrownBy(() -> offerService.respondToOffer(40L,
				new RespondOfferRequest(OfferAction.COUNTER, BigDecimal.ZERO, null)))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void closedOffersCannotBeRespondedTo() {
		for (OfferStatus status : new OfferStatus[]{OfferStatus.ACCEPTED, OfferStatus.REJECTED,
				OfferStatus.WITHDRAWN, OfferStatus.COUNTERED}) {
			stored(status);
			assertThatThrownBy(() -> offerService.respondToOffer(40L,
					new RespondOfferRequest(OfferAction.ACCEPT, null, null)))
					.as(status.name())
					.isInstanceOf(BusinessException.class);
		}
		verifyNoInteractions(orderService);
	}

	@Test
	void expiredOffersCannotBeAccepted() {
		Offer offer = stored(OfferStatus.SUBMITTED);
		offer.setExpiresAt(LocalDateTime.now().minusMinutes(1));

		assertThatThrownBy(() -> offerService.respondToOffer(40L,
				new RespondOfferRequest(OfferAction.ACCEPT, null, null)))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("expired");
		verifyNoInteractions(orderService);
	}

	@Test
	void buyerAcceptingCounterCreatesOrderAtCounterPrice() {
		Offer offer = stored(OfferStatus.COUNTERED);
		offer.setCounterAmount(new BigDecimal("900.00"));
		saveReturnsArgument();

		OfferDto dto = offerService.acceptCounterOffer(40L, buyer);

		assertThat(dto.getStatus()).isEqualTo(OfferStatus.ACCEPTED);
		assertThat(dto.getAgreedAmount()).isEqualByComparingTo("900.00");
		verify(orderService).createOrderForAcceptedOffer(offer);
	}

	@Test
	void onlyTheOffersBuyerCanAcceptTheCounter() {
		stored(OfferStatus.COUNTERED);

		assertThatThrownBy(() -> offerService.acceptCounterOffer(40L, user(3, UserRole.BUYER)))
				.isInstanceOf(UnauthorizedException.class);
		verifyNoInteractions(orderService);
	}

	@Test
	void onlyCounteredOffersCanBeAcceptedByTheBuyer() {
		stored(OfferStatus.SUBMITTED);

		assertThatThrownBy(() -> offerService.acceptCounterOffer(40L, buyer))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void offersOnUnapprovedPaintingsAreRejected() {
		painting.setStatus(PaintingStatus.UNDER_REVIEW);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> offerService.makeOffer(
				new MakeOfferRequest(10L, new BigDecimal("500.00"), null), buyer))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void buyerCannotViewSomeoneElsesOffer() {
		stored(OfferStatus.SUBMITTED);

		assertThatThrownBy(() -> offerService.getOffer(40L, user(3, UserRole.BUYER)))
				.isInstanceOf(UnauthorizedException.class);
	}

	@Test
	void adminCanViewAnyOffer() {
		stored(OfferStatus.SUBMITTED);

		assertThat(offerService.getOffer(40L, user(9, UserRole.ADMIN)).getId()).isEqualTo(40L);
	}

	@Test
	void acceptedOffersCannotBeWithdrawn() {
		stored(OfferStatus.ACCEPTED);

		assertThatThrownBy(() -> offerService.withdrawOffer(40L, buyer))
				.isInstanceOf(BusinessException.class);
	}
}
