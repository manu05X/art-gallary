package com.artkezai.content;

import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.response.ApiResponse;
import com.artkezai.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@Slf4j
public class ContentPageController {

	private final ContentPageRepository contentPageRepository;

	@GetMapping
	public ResponseEntity<ApiResponse<List<ContentPage>>> listPublished() {
		log.info("List published content pages");
		List<ContentPage> pages = contentPageRepository.findByIsPublishedTrue();
		return ResponseEntity.ok(ApiResponse.ok(pages));
	}

	@GetMapping("/{slug}")
	public ResponseEntity<ApiResponse<ContentPage>> getBySlug(@PathVariable String slug) {
		log.info("Get content page by slug: {}", slug);
		ContentPage page = contentPageRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("ContentPage", "slug", slug));
		return ResponseEntity.ok(ApiResponse.ok(page));
	}

	@PutMapping("/{slug}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<ContentPage>> update(
			@PathVariable String slug,
			@RequestBody ContentPage pageData,
			Authentication authentication) {
		log.info("Update content page: {}", slug);
		User admin = (User) authentication.getPrincipal();

		ContentPage page = contentPageRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("ContentPage", "slug", slug));

		page.setTitle(pageData.getTitle());
		page.setBody(pageData.getBody());
		page.setIsPublished(pageData.getIsPublished());
		page.setUpdatedBy(admin);
		page.setUpdatedAt(LocalDateTime.now());

		page = contentPageRepository.save(page);
		return ResponseEntity.ok(ApiResponse.ok(page, "Content page updated"));
	}

}
