package com.artkezai.payment;

public enum PaymentStatus {
	INITIATED,
	INSTRUCTIONS_SENT,
	AWAITING_TRANSFER,
	SUCCEEDED,
	CONFIRMED,
	FAILED
}
