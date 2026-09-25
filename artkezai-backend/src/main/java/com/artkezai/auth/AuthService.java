package com.artkezai.auth;

import com.artkezai.auth.dto.AuthResponse;
import com.artkezai.auth.dto.ForgotPasswordRequest;
import com.artkezai.auth.dto.LoginRequest;
import com.artkezai.auth.dto.RegisterRequest;
import com.artkezai.auth.dto.ResetPasswordRequest;
import com.artkezai.artist.ArtistService;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.notification.EmailService;
import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import com.artkezai.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final ArtistService artistService;

	@Value("${artkezai.frontend-url:http://localhost:3000}")
	private String frontendUrl;

	public AuthResponse register(RegisterRequest request) {
		// Public self-registration may only ever create BUYER or ARTIST
		// accounts — an allow-list, not a deny-list, so a future new
		// UserRole value defaults to rejected here rather than silently
		// permitted. RegisterRequest.role has no enum-value constraint
		// (Jakarta Validation can't express "one of, from a subset of an
		// existing enum" without a custom annotation), so this service-level
		// guard is the sole enforcement point — deliberately placed here
		// rather than only in the controller, so it still holds if this
		// method is ever called from anywhere else. A missing/null role
		// preserves the existing BUYER default (matches the users table's
		// own NOT NULL DEFAULT 'BUYER'); previously an explicit
		// {"role":null} reached the DB and crashed with an uncaught
		// constraint-violation 500 — now normalized the same as "omitted".
		UserRole requestedRole = request.getRole() != null ? request.getRole() : UserRole.BUYER;
		if (requestedRole != UserRole.BUYER && requestedRole != UserRole.ARTIST) {
			throw new BusinessException("Self-registration is only available for buyer or artist accounts");
		}

		if (userRepository.existsByEmail(request.getEmail())) {
			throw new BusinessException("Email already registered");
		}

		User user = User.builder()
				.email(request.getEmail())
				.passwordHash(passwordEncoder.encode(request.getPassword()))
				.firstName(request.getFirstName())
				.lastName(request.getLastName())
				.role(requestedRole)
				.isActive(true)
				.isEmailVerified(false)
				.build();

		user = userRepository.save(user);
		log.info("New user registered: {}", user.getEmail());

		if (user.getRole() == UserRole.ARTIST) {
			artistService.createArtistProfile(user);
		}

		String token = jwtService.generateToken(user);
		return buildAuthResponse(user, token);
	}

	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new BusinessException("Invalid email or password"));

		if (!user.getIsActive()) {
			throw new BusinessException("Account is inactive");
		}

		if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
			throw new BusinessException("Invalid email or password");
		}

		user.setLastLoginAt(LocalDateTime.now());
		user = userRepository.save(user);
		log.info("User logged in: {}", user.getEmail());

		String token = jwtService.generateToken(user);
		return buildAuthResponse(user, token);
	}

	public void forgotPassword(ForgotPasswordRequest request) {
		// Silent return for unknown emails — don't leak registration status
		userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
			String resetToken = UUID.randomUUID().toString();
			user.setResetToken(resetToken);
			user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
			userRepository.save(user);

			String resetLink = frontendUrl + "/auth/reset-password?token=" + resetToken;
			emailService.sendPasswordReset(user, resetLink);
			log.info("Password reset email sent to: {}", user.getEmail());
		});
	}

	public void resetPassword(ResetPasswordRequest request) {
		User user = userRepository.findByResetToken(request.getToken())
				.orElseThrow(() -> new BusinessException("Invalid or expired reset token"));

		if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
			throw new BusinessException("Reset token has expired");
		}

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		// Sign out every existing session after a password change.
		user.setTokensValidAfter(currentSecond());
		user.setResetToken(null);
		user.setResetTokenExpiry(null);
		userRepository.save(user);
		log.info("Password reset for user: {}", user.getEmail());
	}

	// Issues a fresh token for an already-authenticated user, so an active
	// session can be extended before the current token expires.
	public AuthResponse refresh(User user) {
		return buildAuthResponse(user, jwtService.generateToken(user));
	}

	// Server-side logout: every token issued before now stops working, on all
	// devices. JWT iat has second precision, so the cut-off is truncated too.
	public void logout(User user) {
		user.setTokensValidAfter(currentSecond());
		userRepository.save(user);
		log.info("User logged out: {}", user.getEmail());
	}

	private static LocalDateTime currentSecond() {
		return LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
	}

	private AuthResponse buildAuthResponse(User user, String token) {
		long expiresAt = System.currentTimeMillis() + jwtService.getExpirationTime();
		return AuthResponse.builder()
				.userId(user.getId())
				.email(user.getEmail())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.role(user.getRole())
				.token(token)
				.expiresAt(expiresAt)
				.build();
	}

}
