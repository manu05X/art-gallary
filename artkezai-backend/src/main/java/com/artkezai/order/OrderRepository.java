package com.artkezai.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

	Page<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

	boolean existsByPaintingId(Long paintingId);

	Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

	// Artist-scoped orders (Phase 2.12): orders for paintings this artist
	// owns, via the existing Order -> Painting -> ArtistProfile chain. Scoped
	// server-side by the artist's own profile id — never a client-supplied id.
	Page<Order> findByPainting_Artist_IdOrderByCreatedAtDesc(Long artistId, Pageable pageable);

}
