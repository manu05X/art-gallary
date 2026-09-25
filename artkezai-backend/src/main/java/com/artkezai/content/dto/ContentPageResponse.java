package com.artkezai.content.dto;

import com.artkezai.content.ContentPage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentPageResponse {

	private String slug;
	private String title;
	private String body;
	private Boolean isPublished;
	private LocalDateTime updatedAt;

	public static ContentPageResponse from(ContentPage page) {
		return ContentPageResponse.builder()
				.slug(page.getSlug())
				.title(page.getTitle())
				.body(page.getBody())
				.isPublished(page.getIsPublished())
				.updatedAt(page.getUpdatedAt())
				.build();
	}
}
