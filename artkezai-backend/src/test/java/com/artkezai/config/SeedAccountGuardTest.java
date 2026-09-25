package com.artkezai.config;

import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import com.artkezai.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeedAccountGuardTest {

	@Mock
	private UserRepository userRepository;

	// Cost 4 keeps the test fast; matching logic is identical at any cost.
	private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
	private SeedAccountGuard guard;

	@BeforeEach
	void setUp() {
		guard = new SeedAccountGuard(userRepository, encoder);
		lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
	}

	private User seed(String email, UserRole role, String password) {
		User user = User.builder().email(email).role(role).passwordHash(encoder.encode(password)).build();
		when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
		return user;
	}

	@Test
	void seedAdminGetsTheConfiguredInitialPassword() {
		ReflectionTestUtils.setField(guard, "adminInitialPassword", "a-long-unique-password");
		User admin = seed("admin@artkezai.com", UserRole.ADMIN, "Admin@123");

		guard.run(null);

		assertThat(encoder.matches("a-long-unique-password", admin.getPasswordHash())).isTrue();
		assertThat(admin.getIsActive()).isTrue();
	}

	@Test
	void seedAdminIsDeactivatedWithoutAStrongInitialPassword() {
		ReflectionTestUtils.setField(guard, "adminInitialPassword", "short");
		User admin = seed("admin@artkezai.com", UserRole.ADMIN, "Admin@123");

		guard.run(null);

		assertThat(admin.getIsActive()).isFalse();
		assertThat(encoder.matches("Admin@123", admin.getPasswordHash())).isTrue();
	}

	@Test
	void demoArtistsWithPublishedPasswordsAreDeactivated() {
		User artist = seed("elena@artkezai.com", UserRole.ARTIST, "Artist@123");

		guard.run(null);

		assertThat(artist.getIsActive()).isFalse();
		verify(userRepository).save(artist);
	}

	@Test
	void demoArtistsKeepWorkingWithTheConfiguredDemoPassword() {
		ReflectionTestUtils.setField(guard, "demoArtistPassword", "a-private-demo-password");
		User artist = seed("james@artkezai.com", UserRole.ARTIST, "Artist@123");

		guard.run(null);

		assertThat(artist.getIsActive()).isTrue();
		assertThat(encoder.matches("a-private-demo-password", artist.getPasswordHash())).isTrue();
	}

	@Test
	void seedAccountsWithChangedPasswordsAreLeftAlone() {
		User admin = seed("admin@artkezai.com", UserRole.ADMIN, "Changed-Already-2026");

		guard.run(null);

		assertThat(admin.getIsActive()).isTrue();
		verify(userRepository, never()).save(any());
	}
}
