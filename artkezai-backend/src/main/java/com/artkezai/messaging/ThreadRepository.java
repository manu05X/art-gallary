package com.artkezai.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ThreadRepository extends JpaRepository<MessageThread, Long> {

	Page<MessageThread> findByUserIdOrderByLastMessageAtDesc(Long userId, Pageable pageable);

	Page<MessageThread> findAllByOrderByLastMessageAtDesc(Pageable pageable);

	// Keeps a conversation when the painting it was about is deleted.
	@Modifying
	@Query("update MessageThread t set t.painting = null where t.painting.id = :paintingId")
	int detachPainting(@Param("paintingId") Long paintingId);

}
