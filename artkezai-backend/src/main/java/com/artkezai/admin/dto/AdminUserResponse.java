package com.artkezai.admin.dto;

import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Admin user listing. Deliberately excludes passwordHash, resetToken and
// emailVerifyToken, which the raw User entity would otherwise serialize.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {

	private Long id;
	private String email;
	private String firstName;
	private String lastName;
	private UserRole role;
	private Boolean isActive;
	private Boolean isEmailVerified;
	private LocalDateTime lastLoginAt;
	private LocalDateTime createdAt;

	public static AdminUserResponse from(User user) {
		return AdminUserResponse.builder()
				.id(user.getId())
				.email(user.getEmail())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.role(user.getRole())
				.isActive(user.getIsActive())
				.isEmailVerified(user.getIsEmailVerified())
				.lastLoginAt(user.getLastLoginAt())
				.createdAt(user.getCreatedAt())
				.build();
	}
}
