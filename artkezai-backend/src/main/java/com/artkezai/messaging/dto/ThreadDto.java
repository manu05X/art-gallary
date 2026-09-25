package com.artkezai.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreadDto {

	private Long id;
	private String subject;
	private Long userId;
	private String userName;
	private Boolean isResolved;
	private LocalDateTime lastMessageAt;
	private Long unreadCount;
	private Long paintingId;
	private LocalDateTime createdAt;
	// Only populated by the thread-detail endpoint.
	private List<MessageDto> messages;

}
