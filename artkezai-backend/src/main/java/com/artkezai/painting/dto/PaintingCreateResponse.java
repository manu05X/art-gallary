package com.artkezai.painting.dto;

import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintingCreateResponse {

	private Long id;
	private String title;
	private String slug;
	private PaintingStatus status;
	private LocalDateTime createdAt;

	public static PaintingCreateResponse from(Painting painting) {
		return PaintingCreateResponse.builder()
				.id(painting.getId())
				.title(painting.getTitle())
				.slug(painting.getSlug())
				.status(painting.getStatus())
				.createdAt(painting.getCreatedAt())
				.build();
	}
}
