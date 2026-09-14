package com.artkezai.artist;

import com.artkezai.artist.dto.ArtistDetailResponse;
import com.artkezai.artist.dto.ArtistListResponse;
import com.artkezai.artist.dto.ArtistOrderResponse;
import com.artkezai.artist.dto.UpdateArtistProfileRequest;
import com.artkezai.common.response.ApiResponse;
import com.artkezai.common.response.PagedResponse;
import com.artkezai.order.OrderService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
@Slf4j
public class ArtistController {

	private final ArtistService artistService;
	private final OrderService orderService;

	@GetMapping
	public ResponseEntity<ApiResponse<PagedResponse<ArtistListResponse>>> listArtists(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("List artists request");
		Page<ArtistProfile> artists = artistService.listArtists(pageable);
		Page<ArtistListResponse> response = artists.map(artistService::toListResponse);
		return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(response)));
	}

	@GetMapping("/{slug}")
	public ResponseEntity<ApiResponse<ArtistDetailResponse>> getArtistProfile(@PathVariable String slug) {
		log.info("Get artist profile: {}", slug);
		ArtistProfile artist = artistService.getArtistBySlug(slug);
		return ResponseEntity.ok(ApiResponse.ok(artistService.toDetailResponse(artist)));
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<ArtistDetailResponse>> getMyProfile(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User user = (User) authentication.getPrincipal();
		log.info("Get my profile request from: {}", user.getEmail());
		ArtistProfile profile = artistService.getMyProfile(user);
		return ResponseEntity.ok(ApiResponse.ok(artistService.toDetailResponse(profile)));
	}

	// Phase 2.12: replaces the artist dashboard's previous direct call to the
	// admin-only GET /api/orders. Scoped strictly to the caller's own artist
	// profile — there is no artist-id parameter to request someone else's
	// orders. See Phase 2.12 report for why /api/orders itself was not
	// simply opened up to ARTIST (it is unscoped, admin-wide order data).
	@GetMapping("/me/orders")
	public ResponseEntity<ApiResponse<PagedResponse<ArtistOrderResponse>>> getMyOrders(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
			Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User user = (User) authentication.getPrincipal();
		log.info("Get my orders request from: {}", user.getEmail());
		ArtistProfile profile = artistService.getMyProfile(user);
		Page<ArtistOrderResponse> orders = orderService.getArtistOrders(profile.getId(), pageable);
		return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(orders)));
	}

	@PutMapping("/me")
	public ResponseEntity<ApiResponse<ArtistDetailResponse>> updateMyProfile(
			@Valid @RequestBody UpdateArtistProfileRequest request,
			Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User user = (User) authentication.getPrincipal();
		log.info("Update my profile request from: {}", user.getEmail());
		ArtistProfile profile = artistService.updateProfile(user, request);
		return ResponseEntity.ok(ApiResponse.ok(artistService.toDetailResponse(profile), "Profile updated"));
	}

	@PostMapping("/me/photo")
	public ResponseEntity<ApiResponse<ArtistDetailResponse>> uploadProfilePhoto(
			@RequestParam MultipartFile file,
			Authentication authentication) throws Exception {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User user = (User) authentication.getPrincipal();
		log.info("Upload profile photo from: {}", user.getEmail());
		ArtistProfile profile = artistService.uploadProfilePhoto(user, file);
		return ResponseEntity.ok(ApiResponse.ok(artistService.toDetailResponse(profile), "Profile photo uploaded"));
	}

}
