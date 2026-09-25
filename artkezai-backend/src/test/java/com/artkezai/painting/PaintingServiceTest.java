package com.artkezai.painting;

import org.springframework.test.util.ReflectionTestUtils;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import io.minio.RemoveObjectArgs;
import com.artkezai.messaging.ThreadRepository;
import com.artkezai.order.OrderRepository;
import com.artkezai.offer.OfferRepository;
import com.artkezai.notification.NotificationService;
import com.artkezai.artist.ArtistProfile;
import com.artkezai.artist.ArtistProfileRepository;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.painting.dto.PaintingDetailDto;
import com.artkezai.painting.dto.SubmitPaintingRequest;
import com.artkezai.painting.dto.UpdatePaintingRequest;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import io.minio.MinioClient;
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
class PaintingServiceTest {

	@Mock
	private PaintingRepository paintingRepository;
	@Mock
	private CategoryRepository categoryRepository;
	@Mock
	private MediumRepository mediumRepository;
	@Mock
	private CountryRepository countryRepository;
	@Mock
	private PaintingImageRepository paintingImageRepository;
	@Mock
	private ArtistProfileRepository artistProfileRepository;
	@Mock
	private MinioClient minioClient;

	@Mock
	private OfferRepository offerRepository;
	@Mock
	private OrderRepository orderRepository;
	@Mock
	private ThreadRepository threadRepository;
	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private PaintingService paintingService;

	private final User artistUser = user(2, UserRole.ARTIST);
	private Painting painting;

	@BeforeEach
	void setUp() {
		painting = painting(10, PaintingStatus.DRAFT, artistUser);
	}

	private void saveReturnsArgument() {
		when(paintingRepository.save(any(Painting.class))).thenAnswer(inv -> inv.getArgument(0));
	}

	@Test
	void submitPaintingPersistsEveryRequestFieldAsDraft() {
		SubmitPaintingRequest request = new SubmitPaintingRequest();
		request.setTitle("Harbour at Dawn");
		request.setDescription("Oil on linen");
		request.setPrice(new BigDecimal("1500.00"));
		request.setMediumId(1L);
		request.setCategoryId(2L);
		request.setCountryId(3L);
		request.setWidthCm(60);
		request.setHeightCm(80);
		request.setYearCreated(2024);

		when(artistProfileRepository.findByUserId(2L)).thenReturn(Optional.of(painting.getArtist()));
		when(mediumRepository.findById(1L)).thenReturn(Optional.of(Medium.builder().id(1L).name("Oil").build()));
		when(categoryRepository.findById(2L)).thenReturn(Optional.of(Category.builder().id(2L).name("Landscape").build()));
		when(countryRepository.findById(3L)).thenReturn(Optional.of(Country.builder().id(3L).name("France").code("FR").build()));
		saveReturnsArgument();

		paintingService.submitPainting(request, artistUser);

		ArgumentCaptor<Painting> saved = ArgumentCaptor.forClass(Painting.class);
		verify(paintingRepository).save(saved.capture());
		Painting p = saved.getValue();
		assertThat(p.getStatus()).isEqualTo(PaintingStatus.DRAFT);
		assertThat(p.getTitle()).isEqualTo("Harbour at Dawn");
		assertThat(p.getDescription()).isEqualTo("Oil on linen");
		assertThat(p.getPrice()).isEqualByComparingTo("1500.00");
		assertThat(p.getCurrency()).isEqualTo("USD");
		assertThat(p.getWidthCm()).isEqualTo(60);
		assertThat(p.getHeightCm()).isEqualTo(80);
		assertThat(p.getYearCreated()).isEqualTo(2024);
		assertThat(p.getMedium().getId()).isEqualTo(1L);
		assertThat(p.getCategory().getId()).isEqualTo(2L);
		assertThat(p.getCountry().getCode()).isEqualTo("FR");
	}

	@Test
	void submitPaintingRequiresAnArtistProfile() {
		when(artistProfileRepository.findByUserId(2L)).thenReturn(Optional.empty());
		SubmitPaintingRequest request = new SubmitPaintingRequest();
		request.setTitle("Untitled");

		assertThatThrownBy(() -> paintingService.submitPainting(request, artistUser))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void draftCanBeSubmittedForReview() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		saveReturnsArgument();

		paintingService.submitForReview(10L, artistUser);

		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.UNDER_REVIEW);
	}

	@Test
	void rejectedPaintingCanBeResubmittedAndLosesItsRejectionReason() {
		painting.setStatus(PaintingStatus.REJECTED);
		painting.setRejectionReason("Blurry photos");
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		saveReturnsArgument();

		paintingService.submitForReview(10L, artistUser);

		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.UNDER_REVIEW);
		assertThat(painting.getRejectionReason()).isNull();
	}

	@Test
	void livePaintingCannotBeResubmitted() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.submitForReview(10L, artistUser))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void onlyTheOwnerCanSubmitForReview() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.submitForReview(10L, user(3, UserRole.ARTIST)))
				.isInstanceOf(UnauthorizedException.class);
	}

	@Test
	void livePaintingCannotBeEdited() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		UpdatePaintingRequest request = new UpdatePaintingRequest();
		request.setPrice(new BigDecimal("1.00"));

		assertThatThrownBy(() -> paintingService.updatePainting(10L, request, artistUser))
				.isInstanceOf(BusinessException.class);
		assertThat(painting.getPrice()).isEqualByComparingTo("1000.00");
	}

	@Test
	void draftCanBeEdited() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		saveReturnsArgument();
		UpdatePaintingRequest request = new UpdatePaintingRequest();
		request.setPrice(new BigDecimal("1200.00"));

		paintingService.updatePainting(10L, request, artistUser);

		assertThat(painting.getPrice()).isEqualByComparingTo("1200.00");
	}

	@Test
	void unpublishedPaintingIsHiddenFromTheAnonymousPublic() {
		painting.setStatus(PaintingStatus.UNDER_REVIEW);
		when(paintingRepository.findBySlug("painting-10")).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.getPaintingBySlug("painting-10", null))
				.isInstanceOf(ResourceNotFoundException.class);
	}

	@Test
	void unpublishedPaintingIsHiddenFromOtherUsers() {
		painting.setStatus(PaintingStatus.DRAFT);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.getPainting(10L, user(3, UserRole.BUYER)))
				.isInstanceOf(ResourceNotFoundException.class);
	}

	@Test
	void unpublishedPaintingIsVisibleToItsArtistAndToAdmins() {
		painting.setStatus(PaintingStatus.REJECTED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		PaintingDetailDto forOwner = paintingService.getPainting(10L, artistUser);
		PaintingDetailDto forAdmin = paintingService.getPainting(10L, user(9, UserRole.ADMIN));

		assertThat(forOwner.getTitle()).isEqualTo("Painting 10");
		assertThat(forAdmin.getTitle()).isEqualTo("Painting 10");
		verify(paintingRepository, never()).save(any());
	}

	@Test
	void livePaintingIsPublicAndCountsTheView() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findBySlug("painting-10")).thenReturn(Optional.of(painting));
		saveReturnsArgument();

		paintingService.getPaintingBySlug("painting-10", null);

		assertThat(painting.getViewCount()).isEqualTo(1);
	}

	@Test
	void soldPaintingStaysPublic() {
		painting.setStatus(PaintingStatus.SOLD);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		saveReturnsArgument();

		assertThat(paintingService.getPainting(10L, null).getTitle()).isEqualTo("Painting 10");
	}

	@Test
	void artistDeletesOwnDraftAndItsStoredImages() throws Exception {
		ReflectionTestUtils.setField(paintingService, "bucketName", "artkezai-paintings");
		painting.getImages().add(PaintingImage.builder().id(1L).painting(painting).storageKey("paintings/10/a.png").build());
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		paintingService.deletePainting(10L, artistUser);

		verify(threadRepository).detachPainting(10L);
		verify(paintingRepository).delete(painting);
		verify(minioClient).removeObject(any(RemoveObjectArgs.class));
	}

	@Test
	void artistCannotDeleteALivePainting() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.deletePainting(10L, artistUser))
				.isInstanceOf(BusinessException.class);
		verify(paintingRepository, never()).delete(any(Painting.class));
	}

	@Test
	void artistCannotDeleteSomeoneElsesPainting() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.deletePainting(10L, user(3, UserRole.ARTIST)))
				.isInstanceOf(UnauthorizedException.class);
	}

	@Test
	void adminCanDeleteALivePaintingWithoutHistory() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		paintingService.deletePainting(10L, user(9, UserRole.ADMIN));

		verify(paintingRepository).delete(painting);
	}

	@Test
	void paintingWithOffersCannotBeDeleted() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		when(offerRepository.existsByPaintingId(10L)).thenReturn(true);

		assertThatThrownBy(() -> paintingService.deletePainting(10L, user(9, UserRole.ADMIN)))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("offers or orders");
		verify(paintingRepository, never()).delete(any(Painting.class));
	}

	@Test
	void soldPaintingCannotBeDeletedEvenByAdmin() {
		painting.setStatus(PaintingStatus.SOLD);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> paintingService.deletePainting(10L, user(9, UserRole.ADMIN)))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void imageMustBelongToThePaintingInThePath() {
		Painting other = painting(11, PaintingStatus.DRAFT, user(3, UserRole.ARTIST));
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		when(paintingImageRepository.findById(5L))
				.thenReturn(Optional.of(PaintingImage.builder().id(5L).painting(other).storageKey("k").build()));

		assertThatThrownBy(() -> paintingService.deleteImage(10L, 5L, artistUser))
				.isInstanceOf(ResourceNotFoundException.class);
		verify(paintingImageRepository, never()).delete(any());
	}

	@Test
	void submittingForReviewNotifiesAdmins() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));
		saveReturnsArgument();

		paintingService.submitForReview(10L, artistUser);

		verify(notificationService).notifyAdmins(eq("PAINTING_SUBMITTED"), anyString(), eq("/admin/moderation"));
	}
}
