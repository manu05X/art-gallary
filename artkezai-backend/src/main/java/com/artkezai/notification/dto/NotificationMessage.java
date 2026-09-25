package com.artkezai.notification.dto;

import java.time.LocalDateTime;

// Live in-app notification pushed over the WebSocket. `link` is a frontend
// path the client can navigate to.
public record NotificationMessage(String type, String message, String link, LocalDateTime createdAt) {

	public static NotificationMessage of(String type, String message, String link) {
		return new NotificationMessage(type, message, link, LocalDateTime.now());
	}
}
