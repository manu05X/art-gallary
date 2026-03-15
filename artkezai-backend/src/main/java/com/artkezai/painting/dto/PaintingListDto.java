package com.artkezai.painting.dto;

import com.artkezai.painting.PaintingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintingListDto {

	private Long id;
	private String title;
	private String slug;
	private BigDecimal price;
	private String currency;
	private String primaryImageUrl;
	private String thumbnailUrl;
	private String artistName;
	private String artistSlug;
	private String mediumName;
	private String categoryName;
	private String countryName;
	private Boolean isOfferEnabled;
	private PaintingStatus status;
	private LocalDateTime createdAt;

}
