package com.artkezai.admin;

import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

	private final PaintingRepository paintingRepository;
	private final UserRepository userRepository;
	private final AuditLogRepository auditLogRepository;

	@Transactional(readOnly = true)
	public Page<Painting> getModerationQueue(Pageable pageable) {
		return paintingRepository.findAll((root, query, cb) ->
				cb.equal(root.get("status"), PaintingStatus.UNDER_REVIEW), pageable);
	}

	public void approvePainting(Long paintingId, User admin) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		painting.setStatus(PaintingStatus.APPROVED);
		paintingRepository.save(painting);

		logAuditAction(admin, "PAINTING_APPROVED", "Painting", paintingId, "Painting approved");
		log.info("Painting {} approved by admin: {}", paintingId, admin.getEmail());
	}

	public void rejectPainting(Long paintingId, String reason, User admin) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		painting.setStatus(PaintingStatus.REJECTED);
		painting.setRejectionReason(reason);
		paintingRepository.save(painting);

		logAuditAction(admin, "PAINTING_REJECTED", "Painting", paintingId, "Reason: " + reason);
		log.info("Painting {} rejected by admin: {}", paintingId, admin.getEmail());
	}

	public void requestChanges(Long paintingId, String message, User admin) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		painting.setAdminNotes(message);
		paintingRepository.save(painting);

		logAuditAction(admin, "CHANGES_REQUESTED", "Painting", paintingId, message);
		log.info("Changes requested for painting {} by admin: {}", paintingId, admin.getEmail());
	}

	@Transactional(readOnly = true)
	public Map<String, Object> getDashboardStats() {
		Map<String, Object> stats = new HashMap<>();
		stats.put("totalPaintings", paintingRepository.count());
		stats.put("approvedPaintings", paintingRepository.count());
		stats.put("totalUsers", userRepository.count());
		stats.put("pendingModerations", 0L);
		return stats;
	}

	@Transactional(readOnly = true)
	public Page<User> listAllUsers(Pageable pageable) {
		return userRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public Page<AdminAuditLog> getAuditLogs(Pageable pageable) {
		return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
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
