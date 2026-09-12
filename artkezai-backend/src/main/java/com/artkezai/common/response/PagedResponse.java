package com.artkezai.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedResponse<T> {

	private List<T> data;
	private int page;
	private int pageSize;
	private long totalCount;
	private int totalPages;
	private boolean hasNextPage;
	private boolean hasPreviousPage;

	public static <T> PagedResponse<T> from(Page<T> page) {
		return PagedResponse.<T>builder()
				.data(page.getContent())
				.page(page.getNumber())
				.pageSize(page.getSize())
				.totalCount(page.getTotalElements())
				.totalPages(page.getTotalPages())
				.hasNextPage(page.hasNext())
				.hasPreviousPage(page.hasPrevious())
				.build();
	}
}
