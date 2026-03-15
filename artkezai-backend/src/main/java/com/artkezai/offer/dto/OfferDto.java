package com.artkezai.offer.dto;

import com.artkezai.offer.OfferStatus;
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
public class OfferDto {

	private Long id;
	private Long paintingId;
	private String paintingTitle;
	private String paintingThumbnailUrl;
	private String buyerName;
	private BigDecimal offerAmount;
	private BigDecimal counterAmount;
	private String buyerMessage;
	private String adminMessage;
	private String currency;
	private OfferStatus status;
	private LocalDateTime expiresAt;
	private LocalDateTime respondedAt;
	private LocalDateTime createdAt;

}
