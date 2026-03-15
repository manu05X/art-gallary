package com.artkezai.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {

	private Long id;
	private Long threadId;
	private Long senderId;
	private String senderName;
	private String body;
	private Boolean isRead;
	private LocalDateTime createdAt;

}
