package com.artkezai.content;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentPageRepository extends JpaRepository<ContentPage, Long> {

	Optional<ContentPage> findBySlug(String slug);

	List<ContentPage> findByIsPublishedTrue();

}
