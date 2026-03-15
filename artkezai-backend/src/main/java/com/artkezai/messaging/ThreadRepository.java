package com.artkezai.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThreadRepository extends JpaRepository<MessageThread, Long> {

	Page<MessageThread> findByUserIdOrderByLastMessageAtDesc(Long userId, Pageable pageable);

}
