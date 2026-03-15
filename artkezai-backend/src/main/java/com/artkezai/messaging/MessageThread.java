package com.artkezai.messaging;

import com.artkezai.painting.Painting;
import com.artkezai.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "message_threads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageThread {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String subject;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isResolved = false;

	private LocalDateTime lastMessageAt;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "admin_id")
	private User admin;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "painting_id")
	private Painting painting;

	@OneToMany(mappedBy = "thread", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.LAZY)
	@Builder.Default
	private List<Message> messages = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		lastMessageAt = LocalDateTime.now();
	}

}
