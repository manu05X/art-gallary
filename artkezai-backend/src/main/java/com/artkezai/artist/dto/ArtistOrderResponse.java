package com.artkezai.artist.dto;

import com.artkezai.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * An order on one of the current artist's own paintings, as seen by that
 * artist (Phase 2.12). Deliberately narrower than the buyer/admin-facing
 * OrderDto: no buyer name, no buyer shipping address/contact details, no
 * payment method/status — an artist needs to know what sold and its
 * fulfillment status, not the buyer's private information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtistOrderResponse {

	private Long id;
	private Long paintingId;
	private String paintingTitle;
	private String paintingSlug;
	private String paintingThumbnailUrl;
	private BigDecimal totalPrice;
	private String currency;
	private OrderStatus status;
	private LocalDateTime createdAt;

}
