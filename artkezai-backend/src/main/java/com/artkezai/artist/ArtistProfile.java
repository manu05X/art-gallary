package com.artkezai.artist;

import com.artkezai.painting.Country;
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
@Table(name = "artist_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtistProfile {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String displayName;

	@Column(nullable = false, unique = true)
	private String slug;

	@Column(columnDefinition = "TEXT")
	private String bio;

	@Column(columnDefinition = "TEXT")
	private String story;

	private String websiteUrl;

	private String instagram;

	private String profilePhotoUrl;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isVerified = false;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "country_id")
	private Country country;

	@OneToMany(mappedBy = "artist", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Painting> paintings = new ArrayList<>();

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
