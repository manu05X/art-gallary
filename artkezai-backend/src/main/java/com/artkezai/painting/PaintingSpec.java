package com.artkezai.painting;

import org.springframework.data.jpa.domain.Specification;

public class PaintingSpec {

	public static Specification<Painting> hasStatus(PaintingStatus status) {
		return (root, query, cb) -> cb.equal(root.get("status"), status);
	}

	public static Specification<Painting> hasCategory(Long categoryId) {
		return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
	}

	public static Specification<Painting> hasMedium(Long mediumId) {
		return (root, query, cb) -> cb.equal(root.get("medium").get("id"), mediumId);
	}

	public static Specification<Painting> hasCountry(Long countryId) {
		return (root, query, cb) -> cb.equal(root.get("country").get("id"), countryId);
	}

	public static Specification<Painting> hasArtist(Long artistId) {
		return (root, query, cb) -> cb.equal(root.get("artist").get("id"), artistId);
	}

	public static Specification<Painting> priceBetween(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
		return (root, query, cb) -> {
			if (minPrice != null && maxPrice != null) {
				return cb.between(root.get("price"), minPrice, maxPrice);
			} else if (minPrice != null) {
				return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
			} else if (maxPrice != null) {
				return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
			}
			return cb.conjunction();
		};
	}

	public static Specification<Painting> searchKeyword(String keyword) {
		return (root, query, cb) -> {
			if (keyword == null || keyword.trim().isEmpty()) {
				return cb.conjunction();
			}
			String pattern = "%" + keyword.toLowerCase() + "%";
			return cb.or(
					cb.like(cb.lower(root.get("title")), pattern),
					cb.like(cb.lower(root.get("description")), pattern)
			);
		};
	}

	public static Specification<Painting> hasOrientation(String orientation) {
		return (root, query, cb) -> cb.equal(root.get("orientation"), orientation);
	}

}
