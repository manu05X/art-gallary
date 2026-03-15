package com.artkezai.admin;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.painting.Painting;
import com.artkezai.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

	private final AdminService adminService;

	@GetMapping("/moderation/queue")
	public ResponseEntity<ApiResponse<Page<Painting>>> getModerationQueue(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("Get moderation queue");
		Page<Painting> paintings = adminService.getModerationQueue(pageable);
		return ResponseEntity.ok(ApiResponse.ok(paintings));
	}

	@PostMapping("/moderation/{id}/approve")
	public ResponseEntity<ApiResponse<String>> approvePainting(
			@PathVariable Long id,
			Authentication authentication) {
		User admin = (User) authentication.getPrincipal();
		log.info("Approve painting: {} by admin: {}", id, admin.getEmail());
		adminService.approvePainting(id, admin);
		return ResponseEntity.ok(ApiResponse.ok("Painting approved"));
	}

	@PostMapping("/moderation/{id}/reject")
	public ResponseEntity<ApiResponse<String>> rejectPainting(
			@PathVariable Long id,
			@RequestBody Map<String, String> request,
			Authentication authentication) {
		User admin = (User) authentication.getPrincipal();
		String reason = request.getOrDefault("reason", "No reason provided");
		log.info("Reject painting: {} by admin: {}", id, admin.getEmail());
		adminService.rejectPainting(id, reason, admin);
		return ResponseEntity.ok(ApiResponse.ok("Painting rejected"));
	}

	@PostMapping("/moderation/{id}/request-changes")
	public ResponseEntity<ApiResponse<String>> requestChanges(
			@PathVariable Long id,
			@RequestBody Map<String, String> request,
			Authentication authentication) {
		User admin = (User) authentication.getPrincipal();
		String message = request.getOrDefault("message", "");
		log.info("Request changes for painting: {} by admin: {}", id, admin.getEmail());
		adminService.requestChanges(id, message, admin);
		return ResponseEntity.ok(ApiResponse.ok("Changes requested"));
	}

	@GetMapping("/dashboard")
	public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
		log.info("Get admin dashboard");
		Map<String, Object> stats = adminService.getDashboardStats();
		return ResponseEntity.ok(ApiResponse.ok(stats));
	}

	@GetMapping("/users")
	public ResponseEntity<ApiResponse<Page<User>>> listUsers(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("List all users");
		Page<User> users = adminService.listAllUsers(pageable);
		return ResponseEntity.ok(ApiResponse.ok(users));
	}

	@GetMapping("/audit-logs")
	public ResponseEntity<ApiResponse<Page<AdminAuditLog>>> getAuditLogs(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("Get audit logs");
		Page<AdminAuditLog> logs = adminService.getAuditLogs(pageable);
		return ResponseEntity.ok(ApiResponse.ok(logs));
	}

	@GetMapping("/export/orders")
	public ResponseEntity<byte[]> exportOrders() {
		log.info("Export orders as CSV");
		// In a real implementation, this would generate a CSV and return it as a file
		return ResponseEntity.ok(new byte[]{});
	}

}
