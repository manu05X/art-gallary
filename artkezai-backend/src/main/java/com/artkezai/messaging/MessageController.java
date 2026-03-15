package com.artkezai.messaging;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.messaging.dto.MessageDto;
import com.artkezai.messaging.dto.SendMessageRequest;
import com.artkezai.messaging.dto.ThreadDto;
import com.artkezai.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

	private final MessageService messageService;

	@PostMapping("/threads")
	public ResponseEntity<ApiResponse<ThreadDto>> createThread(
			@Valid @RequestBody SendMessageRequest request,
			Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		log.info("Create message thread from: {}", user.getEmail());
		ThreadDto thread = messageService.createThread(request, user);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(thread, "Thread created"));
	}

	@GetMapping("/threads")
	public ResponseEntity<ApiResponse<Page<ThreadDto>>> listMyThreads(
			@PageableDefault(size = 20, sort = "lastMessageAt", direction = Sort.Direction.DESC) Pageable pageable,
			Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		log.info("List my threads request from: {}", user.getEmail());
		Page<ThreadDto> threads = messageService.listMyThreads(user, pageable);
		return ResponseEntity.ok(ApiResponse.ok(threads));
	}

	@GetMapping("/threads/{id}")
	public ResponseEntity<ApiResponse<ThreadDto>> getThread(
			@PathVariable Long id,
			Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		log.info("Get thread: {} from: {}", id, user.getEmail());
		ThreadDto thread = messageService.getThread(id, user);
		return ResponseEntity.ok(ApiResponse.ok(thread));
	}

	@PostMapping("/threads/{id}/messages")
	public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
			@PathVariable Long id,
			@Valid @RequestBody SendMessageRequest request,
			Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		log.info("Send message in thread: {} from: {}", id, user.getEmail());
		MessageDto message = messageService.sendMessage(id, request, user);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(message, "Message sent"));
	}

	@PatchMapping("/threads/{id}/read")
	public ResponseEntity<ApiResponse<String>> markAsRead(
			@PathVariable Long id,
			Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		log.info("Mark thread {} as read by: {}", id, user.getEmail());
		messageService.markAsRead(id, user);
		return ResponseEntity.ok(ApiResponse.ok("Marked as read"));
	}

}
