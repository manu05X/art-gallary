package com.artkezai.painting;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.common.response.PagedResponse;
import com.artkezai.painting.dto.GalleryFilterRequest;
import com.artkezai.painting.dto.CategoryResponse;
import com.artkezai.painting.dto.CountryResponse;
import com.artkezai.painting.dto.PaintingCreateResponse;
import com.artkezai.painting.dto.PaintingDetailDto;
import com.artkezai.painting.dto.PaintingImageResponse;
import com.artkezai.painting.dto.PaintingListDto;
import com.artkezai.painting.dto.SubmitPaintingRequest;
import com.artkezai.painting.dto.MediumResponse;
import com.artkezai.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/paintings")
@RequiredArgsConstructor
@Slf4j
public class PaintingController {

	private final PaintingService paintingService;

	@GetMapping("/categories")
	public ResponseEntity<ApiResponse<java.util.List<CategoryResponse>>> getCategories() {
		return ResponseEntity.ok(ApiResponse.ok(paintingService.getActiveCategories()));
	}

	@GetMapping("/mediums")
	public ResponseEntity<ApiResponse<java.util.List<MediumResponse>>> getMediums() {
		return ResponseEntity.ok(ApiResponse.ok(paintingService.getActiveMediums()));
	}

	@GetMapping("/countries")
	public ResponseEntity<ApiResponse<java.util.List<CountryResponse>>> getCountries() {
		return ResponseEntity.ok(ApiResponse.ok(paintingService.getActiveCountries()));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<Page<PaintingListDto>>> getGallery(
			@ModelAttribute GalleryFilterRequest filter,
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("Get gallery request with filters");
		Page<PaintingListDto> paintings = paintingService.getGallery(filter, pageable);
		return ResponseEntity.ok(ApiResponse.ok(paintings));
	}

	@GetMapping("/my-listings")
	public ResponseEntity<ApiResponse<PagedResponse<PaintingListDto>>> getMyListings(
			@RequestParam(defaultValue = "1") int page,
			Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User artist = (User) authentication.getPrincipal();
		log.info("Get my listings for artist: {}", artist.getEmail());
		int zeroBasedPage = Math.max(page - 1, 0);
		Pageable pageable = PageRequest.of(zeroBasedPage, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
		Page<PaintingListDto> listings = paintingService.getMyListings(artist, pageable);

		PagedResponse<PaintingListDto> response = PagedResponse.from(listings);
		response.setPage(response.getPage() + 1);
		return ResponseEntity.ok(ApiResponse.ok(response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<PaintingDetailDto>> getPainting(@PathVariable Long id) {
		log.info("Get painting: {}", id);
		PaintingDetailDto painting = paintingService.getPainting(id);
		return ResponseEntity.ok(ApiResponse.ok(painting));
	}

	@GetMapping("/slug/{slug}")
	public ResponseEntity<ApiResponse<PaintingDetailDto>> getPaintingBySlug(@PathVariable String slug) {
		log.info("Get painting by slug: {}", slug);
		PaintingDetailDto painting = paintingService.getPaintingBySlug(slug);
		return ResponseEntity.ok(ApiResponse.ok(painting));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<PaintingCreateResponse>> submitPainting(
			@Valid @RequestBody SubmitPaintingRequest request,
			Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User artist = (User) authentication.getPrincipal();
		log.info("Submit painting request from artist: {}", artist.getEmail());
		Painting painting = paintingService.submitPainting(request, artist);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.ok(PaintingCreateResponse.from(painting), "Painting submitted"));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<Painting>> updatePainting(
			@PathVariable Long id,
			@Valid @RequestBody SubmitPaintingRequest request,
			Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User artist = (User) authentication.getPrincipal();
		log.info("Update painting: {} by artist: {}", id, artist.getEmail());
		Painting painting = paintingService.updatePainting(id, request, artist);
		return ResponseEntity.ok(ApiResponse.ok(painting, "Painting updated"));
	}

	@PostMapping("/{id}/images")
	public ResponseEntity<ApiResponse<PaintingImageResponse>> uploadImage(
			@PathVariable Long id,
			@RequestParam MultipartFile file,
			Authentication authentication) throws Exception {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User artist = (User) authentication.getPrincipal();
		log.info("Upload image for painting: {} by artist: {}", id, artist.getEmail());
		PaintingImage image = paintingService.uploadImage(id, file, artist);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.ok(PaintingImageResponse.from(image), "Image uploaded"));
	}

	@DeleteMapping("/{id}/images/{imageId}")
	public ResponseEntity<ApiResponse<String>> deleteImage(
			@PathVariable Long id,
			@PathVariable Long imageId,
			Authentication authentication) throws Exception {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User artist = (User) authentication.getPrincipal();
		log.info("Delete image: {} from painting: {} by artist: {}", imageId, id, artist.getEmail());
		paintingService.deleteImage(id, imageId, artist);
		return ResponseEntity.ok(ApiResponse.ok("Image deleted"));
	}

}
