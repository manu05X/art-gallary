package com.artkezai.painting;

import com.artkezai.artist.ArtistProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paintings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Painting {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false, unique = true)
	private String slug;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(nullable = false)
	private BigDecimal price;

	@Column(nullable = false)
	private String currency;

	private Integer widthCm;

	private Integer heightCm;

	private String orientation;

	private Integer yearCreated;

	@Enumerated(EnumType.STRING)
	@Builder.Default
	@Column(nullable = false)
	private PaintingStatus status = PaintingStatus.DRAFT;

	private String rejectionReason;

	@Column(columnDefinition = "TEXT")
	private String adminNotes;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isOfferEnabled = true;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isFeatured = false;

	@Builder.Default
	@Column(nullable = false)
	private Integer viewCount = 0;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "artist_id", nullable = false)
	private ArtistProfile artist;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "medium_id")
	private Medium medium;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private Category category;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "country_id")
	private Country country;

	@OneToMany(mappedBy = "painting", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.LAZY)
	@Builder.Default
	private List<PaintingImage> images = new ArrayList<>();

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
