package com.artkezai.auth;

import com.artkezai.auth.dto.AuthResponse;
import com.artkezai.auth.dto.ForgotPasswordRequest;
import com.artkezai.auth.dto.LoginRequest;
import com.artkezai.auth.dto.RegisterRequest;
import com.artkezai.auth.dto.ResetPasswordRequest;
import com.artkezai.common.response.ApiResponse;
import com.artkezai.user.User;
import jakarta.servlet.http.HttpServletRequest;
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
	private final AuthRateLimiterService rateLimiterService;

	// Phase 2.21: no trusted-proxy / forwarded-header configuration exists
	// anywhere in this app (no server.forward-headers-strategy, no trusted
	// proxy list) — confirmed by repo-wide audit. Reading X-Forwarded-For or
	// X-Real-IP here would let any client set its own rate-limit key by
	// simply sending a different header value on every request, trivially
	// bypassing the limiter. The server-observed TCP peer address is used
	// instead, exactly as instructed when no trusted proxy resolution
	// exists — a deliberate choice, not an oversight.
	private String clientAddress(HttpServletRequest request) {
		return request.getRemoteAddr();
	}

	@PostMapping("/register")
	public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
		// Rate limiting for this endpoint happens in
		// AuthRegisterRateLimitInterceptor.preHandle(), which runs before
		// @Valid — see that class for why. Not repeated here.
		log.info("Register request for email: {}", request.getEmail());
		AuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Registration successful"));
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<AuthResponse>> login(
			@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		// Consumed unconditionally, before authService even looks up the user —
		// a failed attempt (wrong password, unknown email) must still burn
		// capacity, otherwise brute force is unthrottled.
		rateLimiterService.checkLogin(clientAddress(httpRequest), request.getEmail());
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

	// /api/auth/** is permitAll at the filter level, so these two check the
	// caller themselves, the same way /me does.
	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse<AuthResponse>> refresh(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
		}
		return ResponseEntity.ok(ApiResponse.ok(authService.refresh(user), "Token refreshed"));
	}

	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<String>> logout(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
		}
		authService.logout(user);
		return ResponseEntity.ok(ApiResponse.ok("Logged out"));
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
