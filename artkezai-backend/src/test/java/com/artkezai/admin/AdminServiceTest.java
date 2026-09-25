package com.artkezai.admin;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import com.artkezai.notification.NotificationService;
import com.artkezai.admin.dto.AdminUserResponse;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.offer.OfferRepository;
import com.artkezai.order.OrderRepository;
import com.artkezai.order.OrderStatus;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingService;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import com.artkezai.user.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.artkezai.TestData.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

	@Mock
	private PaintingRepository paintingRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private AuditLogRepository auditLogRepository;
	@Mock
	private PaintingService paintingService;
	@Mock
	private OrderRepository orderRepository;
	@Mock
	private OfferRepository offerRepository;

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private AdminService adminService;

	private final User admin = user(9, UserRole.ADMIN);
	private Painting painting;

	@BeforeEach
	void setUp() {
		painting = painting(10, PaintingStatus.UNDER_REVIEW, user(2, UserRole.ARTIST));
	}

	private AdminAuditLog savedAuditLog() {
		ArgumentCaptor<AdminAuditLog> log = ArgumentCaptor.forClass(AdminAuditLog.class);
		verify(auditLogRepository).save(log.capture());
		return log.getValue();
	}

	@Test
	void approveMakesPaintingLiveAndIsAudited() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		adminService.approvePainting(10L, admin);

		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.APPROVED);
		AdminAuditLog log = savedAuditLog();
		assertThat(log.getAction()).isEqualTo("PAINTING_APPROVED");
		assertThat(log.getEntityId()).isEqualTo(10L);
		assertThat(log.getAdmin()).isEqualTo(admin);
	}

	@Test
	void onlyPaintingsUnderReviewCanBeApproved() {
		painting.setStatus(PaintingStatus.DRAFT);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> adminService.approvePainting(10L, admin))
				.isInstanceOf(BusinessException.class);
		verifyNoInteractions(auditLogRepository);
	}

	@Test
	void rejectRecordsReasonAndIsAudited() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		adminService.rejectPainting(10L, "Photos are blurry", admin);

		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.REJECTED);
		assertThat(painting.getRejectionReason()).isEqualTo("Photos are blurry");
		assertThat(savedAuditLog().getAction()).isEqualTo("PAINTING_REJECTED");
	}

	@Test
	void requestChangesReturnsPaintingToTheArtistAsDraft() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		adminService.requestChanges(10L, "Add a photo of the back", admin);

		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.DRAFT);
		assertThat(painting.getAdminNotes()).isEqualTo("Add a photo of the back");
		assertThat(savedAuditLog().getAction()).isEqualTo("CHANGES_REQUESTED");
	}

	@Test
	void changesCannotBeRequestedOnALivePainting() {
		painting.setStatus(PaintingStatus.APPROVED);
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		assertThatThrownBy(() -> adminService.requestChanges(10L, "x", admin))
				.isInstanceOf(BusinessException.class);
		assertThat(painting.getStatus()).isEqualTo(PaintingStatus.APPROVED);
	}

	@Test
	void dashboardReportsRealCountsPerStatus() {
		when(paintingRepository.count()).thenReturn(34L);
		when(paintingRepository.countByStatus(PaintingStatus.APPROVED)).thenReturn(14L);
		when(paintingRepository.countByStatus(PaintingStatus.SOLD)).thenReturn(1L);
		when(paintingRepository.countByStatus(PaintingStatus.UNDER_REVIEW)).thenReturn(2L);
		when(userRepository.count()).thenReturn(78L);
		when(orderRepository.count()).thenReturn(5L);
		when(orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT)).thenReturn(3L);
		when(offerRepository.countByStatusIn(any())).thenReturn(4L);

		Map<String, Object> stats = adminService.getDashboardStats();

		assertThat(stats).containsEntry("approvedPaintings", 14L)
				.containsEntry("pendingModerations", 2L)
				.containsEntry("soldPaintings", 1L)
				.containsEntry("pendingPaymentOrders", 3L)
				.containsEntry("openOffers", 4L);
	}

	@Test
	void userListingNeverSerializesCredentials() throws Exception {
		User user = user(1, UserRole.BUYER);
		user.setResetToken("reset-secret");
		user.setEmailVerifyToken("verify-secret");
		Pageable page = PageRequest.of(0, 20);
		when(userRepository.findAll(page)).thenReturn(new PageImpl<>(List.of(user), page, 1));

		AdminUserResponse response = adminService.listAllUsers(page).getContent().get(0);
		String json = new ObjectMapper().registerModule(new JavaTimeModule()).writeValueAsString(response);

		assertThat(json).contains("user1@example.test")
				.doesNotContain("hash")
				.doesNotContain("reset-secret")
				.doesNotContain("verify-secret")
				.doesNotContainIgnoringCase("password");
	}

	@Test
	void approvalNotifiesTheArtist() {
		when(paintingRepository.findById(10L)).thenReturn(Optional.of(painting));

		adminService.approvePainting(10L, admin);

		verify(notificationService).notifyUser(eq(painting.getArtist().getUser()), eq("PAINTING_APPROVED"),
				anyString(), eq("/artist/listings"));
	}
}
