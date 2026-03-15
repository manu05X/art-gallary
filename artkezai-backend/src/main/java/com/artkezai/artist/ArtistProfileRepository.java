package com.artkezai.artist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistProfileRepository extends JpaRepository<ArtistProfile, Long> {

	Optional<ArtistProfile> findByUserId(Long userId);

	Optional<ArtistProfile> findBySlug(String slug);

	Page<ArtistProfile> findByIsVerifiedTrue(Pageable pageable);

}
