package com.artkezai.admin;

import com.artkezai.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String action;

	private String entityType;

	private Long entityId;

	@Column(columnDefinition = "TEXT")
	private String details;

	private String ipAddress;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "admin_id", nullable = false)
	private User admin;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
