package com.artkezai.config;

import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import com.artkezai.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

// Flyway migrations V2 and V8 seed an admin and three demo artists whose
// passwords are published in the README. Those migrations also run in
// production, so on every prod startup any seed account still using its
// published password gets a replacement password from configuration
// (ADMIN_INITIAL_PASSWORD for the admin, DEMO_ARTIST_PASSWORD for the demo
// artists) or, when none is configured, is deactivated. Only the four known
// seed emails are checked, so startup does not pay a BCrypt comparison per user.
@Component
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class SeedAccountGuard implements ApplicationRunner {

	static final Map<String, String> SEEDED_DEFAULT_PASSWORDS = Map.of(
			"admin@artkezai.com", "Admin@123",
			"elena@artkezai.com", "Artist@123",
			"james@artkezai.com", "Artist@123",
			"priya@artkezai.com", "Artist@123");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.admin-initial-password:}")
	private String adminInitialPassword;

	@Value("${app.demo-artist-password:}")
	private String demoArtistPassword;

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		for (Map.Entry<String, String> seed : SEEDED_DEFAULT_PASSWORDS.entrySet()) {
			userRepository.findByEmail(seed.getKey())
					.filter(user -> Boolean.TRUE.equals(user.getIsActive()))
					.filter(user -> passwordEncoder.matches(seed.getValue(), user.getPasswordHash()))
					.ifPresent(this::secure);
		}
	}

	private void secure(User user) {
		boolean isAdmin = user.getRole() == UserRole.ADMIN;
		String replacement = isAdmin ? adminInitialPassword : demoArtistPassword;
		String setting = isAdmin ? "ADMIN_INITIAL_PASSWORD" : "DEMO_ARTIST_PASSWORD";
		if (isStrong(replacement)) {
			user.setPasswordHash(passwordEncoder.encode(replacement));
			log.warn("Seed account {} still had its published default password; replaced with {}.",
					user.getEmail(), setting);
		} else {
			user.setIsActive(false);
			log.warn("Seed account {} still had its published default password and has been deactivated. "
					+ "Set {} (12+ chars) to keep it usable.", user.getEmail(), setting);
		}
		userRepository.save(user);
	}

	private static boolean isStrong(String password) {
		return password != null && password.length() >= 12
				&& !List.copyOf(SEEDED_DEFAULT_PASSWORDS.values()).contains(password);
	}
}
