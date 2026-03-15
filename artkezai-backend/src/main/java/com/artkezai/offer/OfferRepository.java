package com.artkezai.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

	Page<Offer> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

	Page<Offer> findByPaintingArtistUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	Page<Offer> findAllByOrderByCreatedAtDesc(Pageable pageable);

}
