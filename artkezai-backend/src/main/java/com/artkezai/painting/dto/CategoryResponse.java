package com.artkezai.painting.dto;

import com.artkezai.painting.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

	private Long id;
	private String name;
	private String slug;

	public static CategoryResponse from(Category category) {
		return CategoryResponse.builder()
				.id(category.getId())
				.name(category.getName())
				.slug(category.getSlug())
				.build();
	}
}
