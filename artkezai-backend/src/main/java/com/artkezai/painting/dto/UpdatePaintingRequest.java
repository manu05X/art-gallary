package com.artkezai.painting.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Partial-update request for an existing painting. Every field is optional —
 * only the fields actually present in the request body are applied. Unlike
 * SubmitPaintingRequest (create-only), this does not require title/price to
 * be present, since a caller editing one field should not have to resend the
 * whole record.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePaintingRequest {

	@Size(min = 1, message = "Title cannot be blank")
	private String title;

	private String description;

	@Positive
	private BigDecimal price;

	private String currency;

	private Long mediumId;

	private Long categoryId;

	private Long countryId;

	@Positive
	private Integer widthCm;

	@Positive
	private Integer heightCm;

	private String orientation;

	private Integer yearCreated;

}
