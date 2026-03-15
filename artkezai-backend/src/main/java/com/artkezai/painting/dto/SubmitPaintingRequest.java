package com.artkezai.painting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitPaintingRequest {

	@NotBlank
	private String title;

	private String description;

	@NotNull
	@Positive
	private BigDecimal price;

	private String currency;

	private Long mediumId;

	private Long categoryId;

	private Long countryId;

	private Integer widthCm;

	private Integer heightCm;

	private String orientation;

	private Integer yearCreated;

}
