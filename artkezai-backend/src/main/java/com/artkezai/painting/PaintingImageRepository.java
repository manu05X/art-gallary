package com.artkezai.painting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaintingImageRepository extends JpaRepository<PaintingImage, Long> {

	long countByPaintingId(Long paintingId);

	List<PaintingImage> findByPaintingIdOrderBySortOrder(Long paintingId);

}
