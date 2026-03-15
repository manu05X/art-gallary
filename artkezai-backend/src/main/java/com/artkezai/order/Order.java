package com.artkezai.order;

import com.artkezai.offer.Offer;
import com.artkezai.painting.Painting;
import com.artkezai.payment.Payment;
import com.artkezai.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private BigDecimal totalPrice;

	@Column(nullable = false)
	private String currency;

	@Enumerated(EnumType.STRING)
	@Builder.Default
	@Column(nullable = false)
	private OrderStatus status = OrderStatus.PENDING_PAYMENT;

	@Column(nullable = false)
	private String shippingName;

	@Column(nullable = false)
	private String shippingEmail;

	private String shippingPhone;

	@Column(nullable = false)
	private String shippingAddress1;

	private String shippingAddress2;

	@Column(nullable = false)
	private String shippingCity;

	private String shippingState;

	@Column(nullable = false)
	private String shippingZip;

	@Column(nullable = false)
	private String shippingCountry;

	private String trackingNumber;

	private String trackingUrl;

	private LocalDateTime shippedAt;

	private LocalDateTime deliveredAt;

	@Column(columnDefinition = "TEXT")
	private String adminNotes;

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

	@OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "offer_id")
	private Offer offer;

	@OneToOne(mappedBy = "order", fetch = jakarta.persistence.FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL)
	private Payment payment;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

}
