package com.artkezai.notification;

import com.artkezai.config.WebSocketAuthInterceptor;
import com.artkezai.notification.dto.NotificationMessage;
import com.artkezai.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

// Pushes live in-app notifications over STOMP. Sending waits for the current
// transaction to commit, so a rolled-back action never produces a
// notification. Delivery is best effort: a user who is not connected simply
// does not receive it (email remains the durable channel).
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

	private final SimpMessagingTemplate messagingTemplate;

	public void notifyUser(User user, String type, String message, String link) {
		NotificationMessage payload = NotificationMessage.of(type, message, link);
		afterCommit(() -> messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", payload));
	}

	public void notifyAdmins(String type, String message, String link) {
		NotificationMessage payload = NotificationMessage.of(type, message, link);
		afterCommit(() -> messagingTemplate.convertAndSend(WebSocketAuthInterceptor.ADMIN_TOPIC, payload));
	}

	private void afterCommit(Runnable send) {
		Runnable safeSend = () -> {
			try {
				send.run();
			} catch (RuntimeException ex) {
				log.warn("Could not push notification: {}", ex.getMessage());
			}
		};
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					safeSend.run();
				}
			});
		} else {
			safeSend.run();
		}
	}
}
