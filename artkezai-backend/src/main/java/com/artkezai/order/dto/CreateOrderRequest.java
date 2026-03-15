package com.artkezai.order.dto;

import com.artkezai.payment.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

	@NotNull
	private Long paintingId;

	private Long offerId;

	@NotBlank
	private String shippingName;

	@Email
	@NotBlank
	private String shippingEmail;

	private String shippingPhone;

	@NotBlank
	private String shippingAddress1;

	private String shippingAddress2;

	@NotBlank
	private String shippingCity;

	private String shippingState;

	@NotBlank
	private String shippingZip;

	@NotBlank
	private String shippingCountry;

	@NotNull
	private PaymentMethod paymentMethod;

}
