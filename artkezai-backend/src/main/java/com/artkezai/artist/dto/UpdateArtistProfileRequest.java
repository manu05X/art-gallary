package com.artkezai.artist.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Partial-update request for the authenticated artist's own profile —
 * mirrors UpdatePaintingRequest's semantics (Phase 1): every field is
 * optional, and only fields actually present in the request are applied.
 * Slug is intentionally not editable here — it is assigned once at profile
 * creation and never changes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateArtistProfileRequest {

	@Size(min = 1, message = "Display name cannot be blank")
	private String displayName;

	private String bio;

	private String story;

	private String websiteUrl;

	private String instagram;

	private Long countryId;

}
