package com.artkezai.admin.dto;

import com.artkezai.admin.AdminAuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {

	private Long id;
	private String action;
	private String entityType;
	private Long entityId;
	private String details;
	private Long adminId;
	private String adminEmail;
	private LocalDateTime createdAt;

	public static AuditLogResponse from(AdminAuditLog log) {
		return AuditLogResponse.builder()
				.id(log.getId())
				.action(log.getAction())
				.entityType(log.getEntityType())
				.entityId(log.getEntityId())
				.details(log.getDetails())
				.adminId(log.getAdmin().getId())
				.adminEmail(log.getAdmin().getEmail())
				.createdAt(log.getCreatedAt())
				.build();
	}
}
