package com.artkezai.painting;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "painting_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintingImage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String storageKey;

	@Column(nullable = false)
	private String url;

	private String thumbnailUrl;

	private Integer widthPx;

	private Integer heightPx;

	private Long fileSizeBytes;

	private String mimeType;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isPrimary = false;

	@Builder.Default
	private Integer sortOrder = 0;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "painting_id", nullable = false)
	private Painting painting;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
