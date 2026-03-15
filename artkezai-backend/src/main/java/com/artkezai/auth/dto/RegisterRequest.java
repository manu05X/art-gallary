package com.artkezai.auth.dto;

import com.artkezai.user.UserRole;
import jakarta.validation.constraints.Email;
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
public class RegisterRequest {

	@Email
	@NotBlank
	private String email;

	@Size(min = 8, message = "Password must be at least 8 characters")
	@NotBlank
	private String password;

	@NotBlank
	private String firstName;

	@NotBlank
	private String lastName;

	@Builder.Default
	private UserRole role = UserRole.BUYER;

}
