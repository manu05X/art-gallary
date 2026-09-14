package com.artkezai.artist;

import com.artkezai.painting.PaintingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistProfileRepository extends JpaRepository<ArtistProfile, Long> {

	Optional<ArtistProfile> findByUserId(Long userId);

	Optional<ArtistProfile> findBySlug(String slug);

	// Public directory eligibility (Phase 2.10): an artist is publicly
	// listable if they have at least one APPROVED painting — independent of
	// isVerified, which has no admin-facing workflow behind it (see Phase
	// 2.10 report). "Distinct" avoids duplicate rows for artists with more
	// than one approved painting, and Spring Data applies it to both the
	// content and count queries so pagination stays correct.
	Page<ArtistProfile> findDistinctByPaintings_Status(PaintingStatus status, Pageable pageable);

}
