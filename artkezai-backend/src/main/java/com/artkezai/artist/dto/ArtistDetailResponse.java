package com.artkezai.artist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public-safe artist profile for GET /api/artists/{slug} — same rationale
 * as ArtistListResponse: no User, no raw paintings collection. Real
 * approved artworks for this artist are fetched separately via the
 * existing GET /api/paintings?artistId= endpoint, which is already
 * scoped to APPROVED status only.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtistDetailResponse {

	private Long id;
	private String displayName;
	private String slug;
	private String bio;
	private String story;
	private String profilePhotoUrl;
	private String websiteUrl;
	private String instagram;
	private String countryName;

}
