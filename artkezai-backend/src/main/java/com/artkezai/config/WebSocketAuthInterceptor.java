package com.artkezai.config;

import com.artkezai.auth.TokenAuthenticator;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;

// STOMP-level security for /ws. Browsers cannot send headers on the
// WebSocket upgrade, so the handshake is public and the JWT is checked on the
// CONNECT frame instead. After that a client may only subscribe to its own
// notification queue, plus the admin topic when it is an admin.
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

	public static final String USER_QUEUE = "/user/queue/notifications";
	public static final String ADMIN_TOPIC = "/topic/admin";

	private final TokenAuthenticator tokenAuthenticator;

	@Override
	public Message<?> preSend(Message<?> message, MessageChannel channel) {
		StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
		if (accessor == null || accessor.getCommand() == null) {
			return message;
		}

		if (StompCommand.CONNECT.equals(accessor.getCommand())) {
			String header = accessor.getFirstNativeHeader("Authorization");
			String token = header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
			User user = tokenAuthenticator.authenticate(token)
					.orElseThrow(() -> new MessagingException("Unauthenticated WebSocket connection"));
			accessor.setUser(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()) {
				@Override
				public String getName() {
					return user.getEmail();
				}
			});
		} else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
			String destination = accessor.getDestination();
			if (!isAllowed(accessor.getUser(), destination)) {
				throw new MessagingException("Subscription not allowed: " + destination);
			}
		} else if (StompCommand.SEND.equals(accessor.getCommand())) {
			throw new MessagingException("Clients cannot send messages over this socket");
		}
		return message;
	}

	private boolean isAllowed(Principal principal, String destination) {
		if (!(principal instanceof UsernamePasswordAuthenticationToken auth) || !(auth.getPrincipal() instanceof User user)) {
			return false;
		}
		if (USER_QUEUE.equals(destination)) {
			return true;
		}
		return ADMIN_TOPIC.equals(destination) && user.getRole() == UserRole.ADMIN;
	}
}
