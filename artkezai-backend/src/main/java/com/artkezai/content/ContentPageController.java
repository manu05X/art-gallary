package com.artkezai.content;

import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.response.ApiResponse;
import com.artkezai.content.dto.ContentPageResponse;
import com.artkezai.content.dto.UpdateContentPageRequest;
import jakarta.validation.Valid;
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
	public ResponseEntity<ApiResponse<List<ContentPageResponse>>> listPublished() {
		log.info("List published content pages");
		List<ContentPageResponse> pages = contentPageRepository.findByIsPublishedTrue().stream()
				.map(ContentPageResponse::from)
				.toList();
		return ResponseEntity.ok(ApiResponse.ok(pages));
	}

	@GetMapping("/{slug}")
	public ResponseEntity<ApiResponse<ContentPageResponse>> getBySlug(@PathVariable String slug) {
		log.info("Get content page by slug: {}", slug);
		ContentPage page = contentPageRepository.findBySlug(slug)
				.filter(ContentPage::getIsPublished)
				.orElseThrow(() -> new ResourceNotFoundException("ContentPage", "slug", slug));
		return ResponseEntity.ok(ApiResponse.ok(ContentPageResponse.from(page)));
	}

	@PutMapping("/{slug}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<ContentPageResponse>> update(
			@PathVariable String slug,
			@Valid @RequestBody UpdateContentPageRequest pageData,
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
		return ResponseEntity.ok(ApiResponse.ok(ContentPageResponse.from(page), "Content page updated"));
	}

}
