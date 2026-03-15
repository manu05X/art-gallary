package com.artkezai.offer.dto;

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
public class MakeOfferRequest {

	@NotNull
	private Long paintingId;

	@NotNull
	@Positive
	private BigDecimal offerAmount;

	private String message;

}
