package com.artkezai.painting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaintingRepository extends JpaRepository<Painting, Long>, JpaSpecificationExecutor<Painting> {

	Optional<Painting> findBySlug(String slug);

	boolean existsBySlug(String slug);

	Page<Painting> findByArtistId(Long artistId, Pageable pageable);

}
