package com.artkezai.admin;

import com.artkezai.notification.NotificationService;
import com.artkezai.admin.dto.AdminUserResponse;
import com.artkezai.admin.dto.AuditLogResponse;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.util.CsvUtil;
import com.artkezai.offer.Offer;
import com.artkezai.offer.OfferRepository;
import com.artkezai.offer.OfferStatus;
import com.artkezai.order.Order;
import com.artkezai.order.OrderRepository;
import com.artkezai.order.OrderStatus;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingService;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.payment.Payment;
import com.artkezai.painting.dto.PaintingListDto;
import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

	private final PaintingRepository paintingRepository;
	private final UserRepository userRepository;
	private final AuditLogRepository auditLogRepository;
	private final PaintingService paintingService;
	private final OrderRepository orderRepository;
	private final OfferRepository offerRepository;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public Page<PaintingListDto> getModerationQueue(Pageable pageable) {
		return paintingRepository.findAll((root, query, cb) ->
				cb.equal(root.get("status"), PaintingStatus.UNDER_REVIEW), pageable)
				.map(paintingService::toPaintingListDto);
	}

	public void approvePainting(Long paintingId, User admin) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		if (painting.getStatus() != PaintingStatus.UNDER_REVIEW) {
			throw new BusinessException(
					"Only paintings under review can be approved. Current status: " + painting.getStatus());
		}

		painting.setStatus(PaintingStatus.APPROVED);
		paintingRepository.save(painting);

		logAuditAction(admin, "PAINTING_APPROVED", "Painting", paintingId, "Painting approved");
		notifyArtist(painting, "PAINTING_APPROVED", "is now live in the gallery");
		log.info("Painting {} approved by admin: {}", paintingId, admin.getEmail());
	}

	public void rejectPainting(Long paintingId, String reason, User admin) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		if (painting.getStatus() != PaintingStatus.UNDER_REVIEW) {
			throw new BusinessException(
					"Only paintings under review can be rejected. Current status: " + painting.getStatus());
		}

		painting.setStatus(PaintingStatus.REJECTED);
		painting.setRejectionReason(reason);
		paintingRepository.save(painting);

		logAuditAction(admin, "PAINTING_REJECTED", "Painting", paintingId, "Reason: " + reason);
		notifyArtist(painting, "PAINTING_REJECTED", "was not approved: " + reason);
		log.info("Painting {} rejected by admin: {}", paintingId, admin.getEmail());
	}

	public void requestChanges(Long paintingId, String message, User admin) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		if (painting.getStatus() != PaintingStatus.UNDER_REVIEW) {
			throw new BusinessException(
					"Changes can only be requested on paintings under review. Current status: " + painting.getStatus());
		}

		// D7: hand the painting back to the artist as a DRAFT so they can edit
		// it and resubmit; adminNotes tells them what to change.
		painting.setStatus(PaintingStatus.DRAFT);
		painting.setAdminNotes(message);
		paintingRepository.save(painting);

		logAuditAction(admin, "CHANGES_REQUESTED", "Painting", paintingId, message);
		notifyArtist(painting, "CHANGES_REQUESTED", "needs changes: " + message);
		log.info("Changes requested for painting {} by admin: {}", paintingId, admin.getEmail());
	}

	@Transactional(readOnly = true)
	public Map<String, Object> getDashboardStats() {
		Map<String, Object> stats = new HashMap<>();
		stats.put("totalPaintings", paintingRepository.count());
		stats.put("approvedPaintings", paintingRepository.countByStatus(PaintingStatus.APPROVED));
		stats.put("soldPaintings", paintingRepository.countByStatus(PaintingStatus.SOLD));
		stats.put("pendingModerations", paintingRepository.countByStatus(PaintingStatus.UNDER_REVIEW));
		stats.put("totalUsers", userRepository.count());
		stats.put("totalOrders", orderRepository.count());
		stats.put("pendingPaymentOrders", orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT));
		stats.put("openOffers", offerRepository.countByStatusIn(List.of(OfferStatus.SUBMITTED, OfferStatus.COUNTERED)));
		return stats;
	}

	@Transactional(readOnly = true)
	public Page<AdminUserResponse> listAllUsers(Pageable pageable) {
		return userRepository.findAll(pageable).map(AdminUserResponse::from);
	}

	@Transactional(readOnly = true)
	public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
		return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(AuditLogResponse::from);
	}

	@Transactional(readOnly = true)
	public String exportOrdersCsv() {
		StringBuilder csv = new StringBuilder(CsvUtil.row(List.of(
				"order_id", "created_at", "status", "painting_id", "painting_title", "buyer_email",
				"total_price", "currency", "payment_method", "payment_status", "offer_id",
				"shipping_name", "shipping_city", "shipping_country", "tracking_number")));
		for (Order order : orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))) {
			Payment payment = order.getPayment();
			csv.append(CsvUtil.row(Arrays.asList(
					order.getId(), order.getCreatedAt(), order.getStatus(), order.getPainting().getId(),
					order.getPainting().getTitle(), order.getBuyer().getEmail(), order.getTotalPrice(),
					order.getCurrency(), payment != null ? payment.getPaymentMethod() : null,
					payment != null ? payment.getStatus() : null,
					order.getOffer() != null ? order.getOffer().getId() : null,
					order.getShippingName(), order.getShippingCity(), order.getShippingCountry(),
					order.getTrackingNumber())));
		}
		return csv.toString();
	}

	@Transactional(readOnly = true)
	public String exportOffersCsv() {
		StringBuilder csv = new StringBuilder(CsvUtil.row(List.of(
				"offer_id", "created_at", "status", "painting_id", "painting_title", "buyer_email",
				"offer_amount", "counter_amount", "currency", "expires_at", "responded_at")));
		for (Offer offer : offerRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))) {
			csv.append(CsvUtil.row(Arrays.asList(
					offer.getId(), offer.getCreatedAt(), offer.getStatus(), offer.getPainting().getId(),
					offer.getPainting().getTitle(), offer.getBuyer().getEmail(), offer.getOfferAmount(),
					offer.getCounterAmount(), offer.getCurrency(), offer.getExpiresAt(), offer.getRespondedAt())));
		}
		return csv.toString();
	}

	private void notifyArtist(Painting painting, String type, String outcome) {
		notificationService.notifyUser(painting.getArtist().getUser(), type,
				"\"" + painting.getTitle() + "\" " + outcome, "/artist/listings");
	}

	private void logAuditAction(User admin, String action, String entityType, Long entityId, String details) {
		AdminAuditLog log = AdminAuditLog.builder()
				.action(action)
				.entityType(entityType)
				.entityId(entityId)
				.details(details)
				.admin(admin)
				.build();
		auditLogRepository.save(log);
	}

}
