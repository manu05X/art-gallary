package com.artkezai.painting.dto;

import com.artkezai.painting.PaintingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintingDetailDto {

	private Long id;
	private String slug;
	private String title;
	private Long artistId;
	private String artistName;
	private Long mediumId;
	private String mediumName;
	private Long categoryId;
	private String categoryName;
	private BigDecimal price;
	private String currency;
	private String country;
	private String countryCode;
	private PaintingStatus status;
	private PaintingImageDto primaryImage;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String description;
	private Integer width;
	private Integer height;
	private Integer yearCreated;
	private String orientation;
	private List<PaintingImageDto> allImages;
	private ArtistDto artist;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class PaintingImageDto {
		private Long id;
		private String url;
		private Integer displayOrder;
		private Boolean isPrimary;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ArtistDto {
		private Long id;
		private String firstName;
		private String lastName;
		private String profileImageUrl;
		private String bio;
		private String slug;
	}
}