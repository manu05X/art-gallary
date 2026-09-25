package com.artkezai.auth;

import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

// Resolves a bearer token to its user. Shared by the HTTP filter and the
// WebSocket CONNECT handshake so both apply the same rules: a valid
// signature, an active account, and a token issued after the user's last
// logout or password reset.
@Component
@RequiredArgsConstructor
public class TokenAuthenticator {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public Optional<User> authenticate(String token) {
		if (token == null || !jwtService.isTokenValid(token)) {
			return Optional.empty();
		}
		return userRepository.findByEmail(jwtService.extractEmail(token))
				.filter(user -> Boolean.TRUE.equals(user.getIsActive()))
				.filter(user -> issuedAfterRevocation(user, token));
	}

	private boolean issuedAfterRevocation(User user, String token) {
		LocalDateTime validAfter = user.getTokensValidAfter();
		if (validAfter == null) {
			return true;
		}
		LocalDateTime issuedAt = LocalDateTime.ofInstant(jwtService.extractIssuedAt(token).toInstant(), ZoneId.systemDefault());
		return !issuedAt.isBefore(validAfter);
	}
}
