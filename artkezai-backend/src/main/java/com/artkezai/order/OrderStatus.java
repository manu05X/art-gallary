package com.artkezai.order;

public enum OrderStatus {
	PENDING_PAYMENT,
	PAID,
	SHIPPING_IN_PROGRESS,
	SHIPPED,
	DELIVERED,
	CLOSED,
	REFUNDED,
	// Reservation released because payment never completed in time.
	CANCELLED
}
