package com.artkezai.config;

import com.artkezai.auth.TokenAuthenticator;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static com.artkezai.TestData.user;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketAuthInterceptorTest {

	@Mock
	private TokenAuthenticator tokenAuthenticator;

	@InjectMocks
	private WebSocketAuthInterceptor interceptor;

	private Message<byte[]> frame(StompCommand command, User user, String destination, String authHeader) {
		StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
		if (user != null) {
			accessor.setUser(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
		}
		if (destination != null) {
			accessor.setDestination(destination);
		}
		if (authHeader != null) {
			accessor.addNativeHeader("Authorization", authHeader);
		}
		accessor.setLeaveMutable(true);
		return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
	}

	@Test
	void connectWithoutValidTokenIsRefused() {
		when(tokenAuthenticator.authenticate("bad")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> interceptor.preSend(frame(StompCommand.CONNECT, null, null, "Bearer bad"), null))
				.isInstanceOf(MessagingException.class);
	}

	@Test
	void connectWithValidTokenIsAccepted() {
		User buyer = user(1, UserRole.BUYER);
		when(tokenAuthenticator.authenticate("good")).thenReturn(Optional.of(buyer));

		assertThatCode(() -> interceptor.preSend(frame(StompCommand.CONNECT, null, null, "Bearer good"), null))
				.doesNotThrowAnyException();
	}

	@Test
	void memberMaySubscribeOnlyToOwnQueue() {
		User buyer = user(1, UserRole.BUYER);

		assertThatCode(() -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, buyer, "/user/queue/notifications", null), null))
				.doesNotThrowAnyException();
		assertThatThrownBy(() -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, buyer, "/topic/admin", null), null))
				.isInstanceOf(MessagingException.class);
		assertThatThrownBy(() -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, buyer, "/queue/notifications-user123", null), null))
				.isInstanceOf(MessagingException.class);
	}

	@Test
	void adminMaySubscribeToAdminTopic() {
		assertThatCode(() -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, user(9, UserRole.ADMIN), "/topic/admin", null), null))
				.doesNotThrowAnyException();
	}

	@Test
	void anonymousSubscriptionIsRefused() {
		assertThatThrownBy(() -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, null, "/user/queue/notifications", null), null))
				.isInstanceOf(MessagingException.class);
	}
}
