package com.artkezai.offer;

import com.artkezai.painting.Painting;
import com.artkezai.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private BigDecimal offerAmount;

	@Column(nullable = false)
	private String currency;

	@Column(columnDefinition = "TEXT")
	private String buyerMessage;

	private BigDecimal counterAmount;

	@Column(columnDefinition = "TEXT")
	private String adminMessage;

	@Enumerated(EnumType.STRING)
	@Builder.Default
	@Column(nullable = false)
	private OfferStatus status = OfferStatus.SUBMITTED;

	private LocalDateTime expiresAt;

	private LocalDateTime respondedAt;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "painting_id", nullable = false)
	private Painting painting;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "buyer_id", nullable = false)
	private User buyer;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (expiresAt == null) {
			expiresAt = LocalDateTime.now().plusDays(7);
		}
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

}
