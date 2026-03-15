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

}
