package com.artkezai.auth;

import com.artkezai.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
@Slf4j
public class JwtService {

	@Value("${jwt.secret}")
	private String jwtSecret;

	@Value("${jwt.expiration-ms}")
	private long jwtExpirationMs;

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}

	public String generateToken(User user) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

		return Jwts.builder()
				.subject(user.getEmail())
				.claim("userId", user.getId())
				.claim("email", user.getEmail())
				.claim("role", user.getRole().name())
				.issuedAt(now)
				.expiration(expiryDate)
				.signWith(getSigningKey())
				.compact();
	}

	public String extractEmail(String token) {
		return getClaimsFromToken(token).getSubject();
	}

	public Long extractUserId(String token) {
		Claims claims = getClaimsFromToken(token);
		return claims.get("userId", Long.class);
	}

	public boolean isTokenValid(String token) {
		try {
			Jwts.parser()
					.verifyWith(getSigningKey())
					.build()
					.parseSignedClaims(token);
			return true;
		} catch (Exception ex) {
			log.debug("Invalid JWT token: {}", ex.getMessage());
			return false;
		}
	}

	public Claims getClaimsFromToken(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public long getExpirationTime() {
		return jwtExpirationMs;
	}

}
