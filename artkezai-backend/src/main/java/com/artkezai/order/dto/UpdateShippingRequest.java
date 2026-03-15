package com.artkezai.order.dto;

import com.artkezai.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShippingRequest {

	private OrderStatus status;

	private String trackingNumber;

	private String trackingUrl;

}
