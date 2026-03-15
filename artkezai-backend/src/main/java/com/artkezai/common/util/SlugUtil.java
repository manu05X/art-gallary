package com.artkezai.common.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtil {

	private static final Pattern PATTERN = Pattern.compile("[^a-z0-9-]");

	public static String generateSlug(String text) {
		if (text == null || text.trim().isEmpty()) {
			return "";
		}

		String normalized = Normalizer.normalize(text.trim().toLowerCase(), Normalizer.Form.NFD);
		String slug = PATTERN.matcher(normalized).replaceAll("");
		slug = slug.replaceAll("-+", "-");
		slug = slug.replaceAll("^-+|-+$", "");

		return slug;
	}

	public static String generateUniqueSlug(String text, Long id) {
		String slug = generateSlug(text);
		return id != null ? slug + "-" + id : slug;
	}

}
