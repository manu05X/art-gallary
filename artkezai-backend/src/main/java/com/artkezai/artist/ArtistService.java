package com.artkezai.artist;

import com.artkezai.artist.dto.ArtistDetailResponse;
import com.artkezai.artist.dto.ArtistListResponse;
import com.artkezai.artist.dto.UpdateArtistProfileRequest;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.util.SlugUtil;
import com.artkezai.painting.Country;
import com.artkezai.painting.CountryRepository;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.user.User;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArtistService {

	private final ArtistProfileRepository artistProfileRepository;
	private final CountryRepository countryRepository;
	private final MinioClient minioClient;

	// Was "${minio.bucket-name:artkezai}" — that property key doesn't exist
	// anywhere in application.yml, so it silently fell back to the literal
	// default "artkezai", a bucket that was never created (only
	// "artkezai-paintings" is). Aligned with PaintingService's real,
	// configured properties so profile-photo uploads land in the bucket that
	// actually exists.
	@Value("${minio.bucket}")
	private String bucketName;

	@Value("${minio.public-base-url}")
	private String publicBaseUrl;

	@Transactional(readOnly = true)
	public ArtistProfile getArtistProfile(Long id) {
		return artistProfileRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("ArtistProfile", "id", id));
	}

	@Transactional(readOnly = true)
	public ArtistProfile getArtistBySlug(String slug) {
		return artistProfileRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("ArtistProfile", "slug", slug));
	}

	@Transactional(readOnly = true)
	public ArtistProfile getMyProfile(User user) {
		return artistProfileRepository.findByUserId(user.getId())
				.orElseThrow(() -> new BusinessException("Artist profile not found for user"));
	}

	// Public directory eligibility (Phase 2.10): an artist appears here once
	// they have at least one APPROVED painting. isVerified is a separate,
	// currently workflow-less trust attribute — see Phase 2.10 report — and
	// is intentionally not the gate for this list.
	@Transactional(readOnly = true)
	public Page<ArtistProfile> listArtists(Pageable pageable) {
		return artistProfileRepository.findDistinctByPaintings_Status(PaintingStatus.APPROVED, pageable);
	}

	// Entity -> DTO mapping happens here, inside the open Hibernate session,
	// so the lazy `country` association resolves safely before the profile
	// (and its lazy `user`/`paintings` associations) would otherwise leave
	// the transaction and fail to serialize.
	public ArtistListResponse toListResponse(ArtistProfile profile) {
		return ArtistListResponse.builder()
				.id(profile.getId())
				.displayName(profile.getDisplayName())
				.slug(profile.getSlug())
				.bio(profile.getBio())
				.profilePhotoUrl(profile.getProfilePhotoUrl())
				.countryName(profile.getCountry() != null ? profile.getCountry().getName() : null)
				.build();
	}

	public ArtistDetailResponse toDetailResponse(ArtistProfile profile) {
		return ArtistDetailResponse.builder()
				.id(profile.getId())
				.displayName(profile.getDisplayName())
				.slug(profile.getSlug())
				.bio(profile.getBio())
				.story(profile.getStory())
				.profilePhotoUrl(profile.getProfilePhotoUrl())
				.websiteUrl(profile.getWebsiteUrl())
				.instagram(profile.getInstagram())
				.countryName(profile.getCountry() != null ? profile.getCountry().getName() : null)
				.build();
	}

	// Partial update — mirrors PaintingService.updatePainting: only fields
	// actually present in the request are applied. The previous version
	// unconditionally overwrote every field (including the NOT NULL
	// displayName) with whatever the request contained, so omitting a field
	// nulled it out and crashed on save with a constraint violation the
	// moment a caller sent anything less than the full entity shape.
	// Slug is deliberately never touched here — it is assigned once at
	// profile creation (from the user's name at that time) and is immutable
	// afterwards, independent of later displayName edits.
	public ArtistProfile updateProfile(User user, UpdateArtistProfileRequest request) {
		ArtistProfile profile = artistProfileRepository.findByUserId(user.getId())
				.orElseThrow(() -> new BusinessException("Artist profile not found"));

		if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName());
		if (request.getBio() != null) profile.setBio(request.getBio());
		if (request.getStory() != null) profile.setStory(request.getStory());
		if (request.getWebsiteUrl() != null) profile.setWebsiteUrl(request.getWebsiteUrl());
		if (request.getInstagram() != null) profile.setInstagram(request.getInstagram());

		if (request.getCountryId() != null) {
			Country country = countryRepository.findById(request.getCountryId())
					.orElseThrow(() -> new ResourceNotFoundException("Country", "id", request.getCountryId()));
			profile.setCountry(country);
		}

		profile.setUpdatedAt(LocalDateTime.now());
		profile = artistProfileRepository.save(profile);
		log.info("Artist profile updated: {}", user.getId());
		return profile;
	}

	public ArtistProfile uploadProfilePhoto(User user, MultipartFile file) throws Exception {
		ArtistProfile profile = artistProfileRepository.findByUserId(user.getId())
				.orElseThrow(() -> new BusinessException("Artist profile not found"));

		String storageKey = "artists/" + user.getId() + "/profile/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

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

		String photoUrl = String.format("%s/%s", publicBaseUrl, storageKey);
		profile.setProfilePhotoUrl(photoUrl);
		profile.setUpdatedAt(LocalDateTime.now());
		profile = artistProfileRepository.save(profile);
		log.info("Artist profile photo uploaded: {}", user.getId());
		return profile;
	}

	public void createArtistProfile(User user) {
		if (artistProfileRepository.findByUserId(user.getId()).isPresent()) {
			throw new BusinessException("Artist profile already exists");
		}

		String slug = SlugUtil.generateSlug(user.getFirstName() + "-" + user.getLastName());
		if (artistProfileRepository.findBySlug(slug).isPresent()) {
			slug = SlugUtil.generateUniqueSlug(user.getFirstName() + "-" + user.getLastName(), user.getId());
		}

		ArtistProfile profile = ArtistProfile.builder()
				.displayName(user.getFirstName() + " " + user.getLastName())
				.slug(slug)
				.user(user)
				.isVerified(false)
				.build();

		artistProfileRepository.save(profile);
		log.info("Artist profile created for user: {}", user.getId());
	}

}
