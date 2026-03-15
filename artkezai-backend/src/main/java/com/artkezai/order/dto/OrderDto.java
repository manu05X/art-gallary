package com.artkezai.order.dto;

import com.artkezai.order.OrderStatus;
import com.artkezai.payment.PaymentMethod;
import com.artkezai.payment.PaymentStatus;
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
public class OrderDto {

	private Long id;
	private Long paintingId;
	private String paintingTitle;
	private String paintingThumbnailUrl;
	private Long buyerId;
	private String buyerName;
	private BigDecimal totalPrice;
	private String currency;
	private OrderStatus status;
	private PaymentMethod paymentMethod;
	private PaymentStatus paymentStatus;
	private String shippingName;
	private String shippingAddress1;
	private String shippingCity;
	private String shippingCountry;
	private String trackingNumber;
	private String trackingUrl;
	private LocalDateTime shippedAt;
	private LocalDateTime deliveredAt;
	private LocalDateTime createdAt;

}
