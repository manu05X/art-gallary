package com.artkezai.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequest {

	@NotBlank
	private String token;

	@Size(min = 8, message = "Password must be at least 8 characters")
	@NotBlank
	private String newPassword;

}
