package com.artkezai.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateContentPageRequest {

	@NotBlank
	private String title;

	@NotBlank
	private String body;

	@NotNull
	private Boolean isPublished;
}
