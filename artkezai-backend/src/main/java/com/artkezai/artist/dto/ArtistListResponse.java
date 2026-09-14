package com.artkezai.artist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public-safe artist summary for the /api/artists list — deliberately
 * excludes the linked User and the unfiltered paintings collection so the
 * controller never serializes an ArtistProfile entity (and its lazy
 * associations) directly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtistListResponse {

	private Long id;
	private String displayName;
	private String slug;
	private String bio;
	private String profilePhotoUrl;
	private String countryName;

}
