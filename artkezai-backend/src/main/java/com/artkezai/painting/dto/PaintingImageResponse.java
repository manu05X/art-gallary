package com.artkezai.painting.dto;

import com.artkezai.painting.PaintingImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintingImageResponse {

	private Long id;
	private String url;
	private Integer displayOrder;
	private Boolean isPrimary;

	public static PaintingImageResponse from(PaintingImage image) {
		return PaintingImageResponse.builder()
				.id(image.getId())
				.url(image.getUrl())
				.displayOrder(image.getSortOrder())
				.isPrimary(image.getIsPrimary())
				.build();
	}
}
