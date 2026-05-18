package com.artkezai.painting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryFilterRequest {

	private String keyword;

	private Long categoryId;

	private Long mediumId;

	private Long countryId;

	private Long artistId;

	private BigDecimal minPrice;

	private BigDecimal maxPrice;

	private String orientation;

	private String sortBy; // "newest", "oldest", "price-asc", "price-desc", or field name like "createdAt"

}
