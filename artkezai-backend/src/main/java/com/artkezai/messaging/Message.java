package com.artkezai.messaging;

import com.artkezai.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(columnDefinition = "TEXT", nullable = false)
	@NotBlank
	private String body;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isRead = false;

	private LocalDateTime readAt;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "thread_id", nullable = false)
	private MessageThread thread;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "sender_id", nullable = false)
	private User sender;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
