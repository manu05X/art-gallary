package com.artkezai.auth;

import com.artkezai.auth.dto.AuthResponse;
import com.artkezai.auth.dto.ForgotPasswordRequest;
import com.artkezai.auth.dto.LoginRequest;
import com.artkezai.auth.dto.RegisterRequest;
import com.artkezai.auth.dto.ResetPasswordRequest;
import com.artkezai.common.response.ApiResponse;
import com.artkezai.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
		log.info("Register request for email: {}", request.getEmail());
		AuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Registration successful"));
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
		log.info("Login request for email: {}", request.getEmail());
		AuthResponse response = authService.login(request);
		return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		log.info("Forgot password request for email: {}", request.getEmail());
		authService.forgotPassword(request);
		return ResponseEntity.ok(ApiResponse.ok("Check your email for password reset instructions"));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		log.info("Reset password request");
		authService.resetPassword(request);
		return ResponseEntity.ok(ApiResponse.ok("Password reset successful"));
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(ApiResponse.error("Not authenticated"));
		}

		User user = (User) authentication.getPrincipal();
		AuthResponse response = AuthResponse.builder()
				.userId(user.getId())
				.email(user.getEmail())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.role(user.getRole())
				.build();

		return ResponseEntity.ok(ApiResponse.ok(response));
	}

}
