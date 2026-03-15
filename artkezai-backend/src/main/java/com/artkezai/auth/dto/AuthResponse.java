package com.artkezai.auth.dto;

import com.artkezai.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

	private Long userId;
	private String email;
	private String firstName;
	private String lastName;
	private UserRole role;
	private String token;
	private Long expiresAt;

}
