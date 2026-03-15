package com.artkezai.offer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespondOfferRequest {

	private OfferAction action;

	private BigDecimal counterAmount;

	private String message;

	public enum OfferAction {
		ACCEPT, REJECT, COUNTER
	}

}
