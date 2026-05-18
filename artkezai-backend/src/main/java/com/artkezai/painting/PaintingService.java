package com.artkezai.painting;

import com.artkezai.artist.ArtistProfile;
import com.artkezai.artist.ArtistProfileRepository;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.common.util.SlugUtil;
import com.artkezai.painting.dto.PaintingDetailDto;
import com.artkezai.painting.dto.GalleryFilterRequest;
import com.artkezai.painting.dto.PaintingListDto;
import com.artkezai.painting.dto.SubmitPaintingRequest;
import com.artkezai.user.User;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaintingService {

	private final PaintingRepository paintingRepository;
	private final CategoryRepository categoryRepository;
	private final MediumRepository mediumRepository;
	private final CountryRepository countryRepository;
	private final PaintingImageRepository paintingImageRepository;
	private final ArtistProfileRepository artistProfileRepository;
	private final MinioClient minioClient;

	@Value("${minio.bucket-name:artkezai}")
	private String bucketName;

	public Painting submitPainting(SubmitPaintingRequest request, User artist) {
		ArtistProfile artistProfile = artistProfileRepository.findByUserId(artist.getId())
				.orElseThrow(() -> new BusinessException("Artist profile not found"));

		String slug = SlugUtil.generateSlug(request.getTitle());
		if (paintingRepository.existsBySlug(slug)) {
			slug = SlugUtil.generateUniqueSlug(request.getTitle(), System.currentTimeMillis());
		}

		Painting painting = Painting.builder()
				.title(request.getTitle())
				.slug(slug)
				.description(request.getDescription())
				.price(request.getPrice())
				.currency(request.getCurrency() != null ? request.getCurrency() : "USD")
				.widthCm(request.getWidthCm())
				.heightCm(request.getHeightCm())
				.orientation(request.getOrientation())
				.yearCreated(request.getYearCreated())
				.artist(artistProfile)
				.status(PaintingStatus.DRAFT)
				.build();

		if (request.getMediumId() != null) {
			Medium medium = mediumRepository.findById(request.getMediumId())
					.orElseThrow(() -> new ResourceNotFoundException("Medium", "id", request.getMediumId()));
			painting.setMedium(medium);
		}

		if (request.getCategoryId() != null) {
			Category category = categoryRepository.findById(request.getCategoryId())
					.orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
			painting.setCategory(category);
		}

		if (request.getCountryId() != null) {
			Country country = countryRepository.findById(request.getCountryId())
					.orElseThrow(() -> new ResourceNotFoundException("Country", "id", request.getCountryId()));
			painting.setCountry(country);
		}

		painting = paintingRepository.save(painting);
		log.info("Painting submitted: {} by artist: {}", painting.getId(), artist.getEmail());
		return painting;
	}

	public Painting updatePainting(Long paintingId, SubmitPaintingRequest request, User artist) {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		if (!painting.getArtist().getUser().getId().equals(artist.getId())) {
			throw new UnauthorizedException("You can only update your own paintings");
		}

		painting.setTitle(request.getTitle());
		painting.setDescription(request.getDescription());
		painting.setPrice(request.getPrice());
		if (request.getCurrency() != null) painting.setCurrency(request.getCurrency());
		painting.setWidthCm(request.getWidthCm());
		painting.setHeightCm(request.getHeightCm());
		painting.setOrientation(request.getOrientation());
		painting.setYearCreated(request.getYearCreated());

		if (request.getMediumId() != null) {
			Medium medium = mediumRepository.findById(request.getMediumId())
					.orElseThrow(() -> new ResourceNotFoundException("Medium", "id", request.getMediumId()));
			painting.setMedium(medium);
		}

		if (request.getCategoryId() != null) {
			Category category = categoryRepository.findById(request.getCategoryId())
					.orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
			painting.setCategory(category);
		}

		if (request.getCountryId() != null) {
			Country country = countryRepository.findById(request.getCountryId())
					.orElseThrow(() -> new ResourceNotFoundException("Country", "id", request.getCountryId()));
			painting.setCountry(country);
		}

		painting = paintingRepository.save(painting);
		log.info("Painting updated: {}", paintingId);
		return painting;
	}

	public PaintingImage uploadImage(Long paintingId, MultipartFile file, User artist) throws Exception {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		if (!painting.getArtist().getUser().getId().equals(artist.getId())) {
			throw new UnauthorizedException("You can only upload images for your own paintings");
		}

		String storageKey = "paintings/" + paintingId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

		try (InputStream inputStream = file.getInputStream()) {
			minioClient.putObject(
					PutObjectArgs.builder()
							.bucket(bucketName)
							.object(storageKey)
							.stream(inputStream, file.getSize(), -1)
							.contentType(file.getContentType())
							.build()
			);
		}

		String imageUrl = String.format("https://%s/%s/%s", "minio.artkezai.com", bucketName, storageKey);

		PaintingImage image = PaintingImage.builder()
				.storageKey(storageKey)
				.url(imageUrl)
				.mimeType(file.getContentType())
				.fileSizeBytes(file.getSize())
				.isPrimary(paintingImageRepository.countByPaintingId(paintingId) == 0)
				.sortOrder((int) paintingImageRepository.countByPaintingId(paintingId))
				.painting(painting)
				.build();

		image = paintingImageRepository.save(image);
		log.info("Image uploaded for painting: {}", paintingId);
		return image;
	}

	public void deleteImage(Long paintingId, Long imageId, User artist) throws Exception {
		Painting painting = paintingRepository.findById(paintingId)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", paintingId));

		if (!painting.getArtist().getUser().getId().equals(artist.getId())) {
			throw new UnauthorizedException("You can only delete images from your own paintings");
		}

		PaintingImage image = paintingImageRepository.findById(imageId)
				.orElseThrow(() -> new ResourceNotFoundException("PaintingImage", "id", imageId));

		minioClient.removeObject(
				RemoveObjectArgs.builder()
						.bucket(bucketName)
						.object(image.getStorageKey())
						.build()
		);

		paintingImageRepository.delete(image);
		log.info("Image deleted: {}", imageId);
	}

	@Transactional(readOnly = true)
	public Page<PaintingListDto> getGallery(GalleryFilterRequest filter, Pageable pageable) {
		Specification<Painting> spec = Specification.where(PaintingSpec.hasStatus(PaintingStatus.APPROVED));

		if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
			spec = spec.and(PaintingSpec.searchKeyword(filter.getKeyword()));
		}

		if (filter.getCategoryId() != null) {
			spec = spec.and(PaintingSpec.hasCategory(filter.getCategoryId()));
		}

		if (filter.getMediumId() != null) {
			spec = spec.and(PaintingSpec.hasMedium(filter.getMediumId()));
		}

		if (filter.getCountryId() != null) {
			spec = spec.and(PaintingSpec.hasCountry(filter.getCountryId()));
		}

		if (filter.getArtistId() != null) {
			spec = spec.and(PaintingSpec.hasArtist(filter.getArtistId()));
		}

		if (filter.getMinPrice() != null || filter.getMaxPrice() != null) {
			spec = spec.and(PaintingSpec.priceBetween(filter.getMinPrice(), filter.getMaxPrice()));
		}

		if (filter.getOrientation() != null) {
			spec = spec.and(PaintingSpec.hasOrientation(filter.getOrientation()));
		}

		// Apply sort from filter's sortBy parameter if provided
		Sort sort = buildSortFromSortBy(filter.getSortBy());
		pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

		return paintingRepository.findAll(spec, pageable).map(this::toPaintingListDto);
	}

	@Transactional(readOnly = true)
	public PaintingDetailDto getPainting(Long id) {
		Painting painting = paintingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", id));

		painting.setViewCount(painting.getViewCount() + 1);
		Painting savedPainting = paintingRepository.save(painting);
		return toPaintingDetailDto(savedPainting);
	}

	@Transactional(readOnly = true)
	public PaintingDetailDto getPaintingBySlug(String slug) {
		Painting painting = paintingRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Painting", "slug", slug));

		painting.setViewCount(painting.getViewCount() + 1);
		Painting savedPainting = paintingRepository.save(painting);
		return toPaintingDetailDto(savedPainting);
	}

	private PaintingListDto toPaintingListDto(Painting painting) {
		Optional<PaintingImage> primaryImage = painting.getImages().stream()
				.filter(PaintingImage::getIsPrimary)
				.findFirst();

		return PaintingListDto.builder()
				.id(painting.getId())
				.title(painting.getTitle())
				.slug(painting.getSlug())
				.price(painting.getPrice())
				.currency(painting.getCurrency())
				.primaryImageUrl(primaryImage.map(PaintingImage::getUrl).orElse(null))
				.thumbnailUrl(primaryImage.map(PaintingImage::getThumbnailUrl).orElse(null))
				.artistName(painting.getArtist().getDisplayName())
				.artistSlug(painting.getArtist().getSlug())
				.mediumName(painting.getMedium() != null ? painting.getMedium().getName() : null)
				.categoryName(painting.getCategory() != null ? painting.getCategory().getName() : null)
				.countryName(painting.getCountry() != null ? painting.getCountry().getName() : null)
				.isOfferEnabled(painting.getIsOfferEnabled())
				.status(painting.getStatus())
				.createdAt(painting.getCreatedAt())
				.build();
	}

	private PaintingDetailDto toPaintingDetailDto(Painting painting) {
		List<PaintingDetailDto.PaintingImageDto> allImages = painting.getImages().stream()
				.sorted(Comparator.comparing(img -> img.getSortOrder() == null ? 0 : img.getSortOrder()))
				.map(img -> PaintingDetailDto.PaintingImageDto.builder()
						.id(img.getId())
						.url(img.getUrl())
						.displayOrder(img.getSortOrder())
						.isPrimary(img.getIsPrimary())
						.build())
				.toList();

		PaintingDetailDto.PaintingImageDto primaryImage = allImages.stream()
				.filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
				.findFirst()
				.orElse(allImages.isEmpty() ? null : allImages.get(0));

		return PaintingDetailDto.builder()
				.id(painting.getId())
				.slug(painting.getSlug())
				.title(painting.getTitle())
				.artistId(painting.getArtist() != null ? painting.getArtist().getId() : null)
				.artistName(painting.getArtist() != null ? painting.getArtist().getDisplayName() : null)
				.mediumId(painting.getMedium() != null ? painting.getMedium().getId() : null)
				.mediumName(painting.getMedium() != null ? painting.getMedium().getName() : null)
				.categoryId(painting.getCategory() != null ? painting.getCategory().getId() : null)
				.categoryName(painting.getCategory() != null ? painting.getCategory().getName() : null)
				.price(painting.getPrice())
				.currency(painting.getCurrency())
				.country(painting.getCountry() != null ? painting.getCountry().getName() : null)
				.countryCode(painting.getCountry() != null ? painting.getCountry().getCode() : null)
				.status(painting.getStatus())
				.primaryImage(primaryImage)
				.createdAt(painting.getCreatedAt())
				.updatedAt(painting.getUpdatedAt())
				.description(painting.getDescription())
				.width(painting.getWidthCm())
				.height(painting.getHeightCm())
				.yearCreated(painting.getYearCreated())
				.orientation(painting.getOrientation())
				.allImages(allImages)
				.artist(PaintingDetailDto.ArtistDto.builder()
						.id(painting.getArtist() != null && painting.getArtist().getUser() != null
								? painting.getArtist().getUser().getId()
								: null)
						.firstName(painting.getArtist() != null && painting.getArtist().getUser() != null
								? painting.getArtist().getUser().getFirstName()
								: null)
						.lastName(painting.getArtist() != null && painting.getArtist().getUser() != null
								? painting.getArtist().getUser().getLastName()
								: null)
						.profileImageUrl(painting.getArtist() != null ? painting.getArtist().getProfilePhotoUrl() : null)
						.bio(painting.getArtist() != null ? painting.getArtist().getBio() : null)
						.slug(painting.getArtist() != null ? painting.getArtist().getSlug() : null)
						.build())
				.build();
	}

	/**
	 * Maps user-friendly sort parameters to database field names and directions
	 * Supports: "newest", "oldest", "price-asc", "price-desc"
	 */
	private Sort buildSortFromSortBy(String sortBy) {
		if (sortBy == null || sortBy.isEmpty()) {
			return Sort.by(Sort.Direction.DESC, "createdAt");
		}

		return switch (sortBy.toLowerCase()) {
			case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
			case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
			case "price-asc" -> Sort.by(Sort.Direction.ASC, "price");
			case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
			default -> Sort.by(Sort.Direction.DESC, "createdAt"); // Default fallback
		};
	}

}
