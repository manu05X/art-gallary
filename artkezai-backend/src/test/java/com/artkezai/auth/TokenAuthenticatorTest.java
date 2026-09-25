package com.artkezai.auth;

import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import com.artkezai.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

import static com.artkezai.TestData.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenAuthenticatorTest {

	@Mock
	private JwtService jwtService;
	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private TokenAuthenticator authenticator;

	private final User buyer = user(1, UserRole.BUYER);
	private final LocalDateTime issued = LocalDateTime.now().withNano(0).minusMinutes(10);

	@BeforeEach
	void setUp() {
		lenient().when(jwtService.isTokenValid("t")).thenReturn(true);
		lenient().when(jwtService.extractEmail("t")).thenReturn(buyer.getEmail());
		lenient().when(jwtService.extractIssuedAt("t")).thenReturn(Date.from(issued.atZone(ZoneId.systemDefault()).toInstant()));
		lenient().when(userRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));
	}

	@Test
	void validTokenForActiveUserAuthenticates() {
		assertThat(authenticator.authenticate("t")).contains(buyer);
	}

	@Test
	void tokenIssuedBeforeLogoutIsRejected() {
		buyer.setTokensValidAfter(issued.plusMinutes(1));

		assertThat(authenticator.authenticate("t")).isEmpty();
	}

	@Test
	void tokenIssuedAfterLogoutIsAccepted() {
		buyer.setTokensValidAfter(issued.minusMinutes(1));

		assertThat(authenticator.authenticate("t")).contains(buyer);
	}

	@Test
	void deactivatedAccountIsRejectedEvenWithAValidToken() {
		buyer.setIsActive(false);

		assertThat(authenticator.authenticate("t")).isEmpty();
	}

	@Test
	void invalidSignatureIsRejected() {
		when(jwtService.isTokenValid("bad")).thenReturn(false);

		assertThat(authenticator.authenticate("bad")).isEmpty();
		verifyNoInteractions(userRepository);
	}
}
