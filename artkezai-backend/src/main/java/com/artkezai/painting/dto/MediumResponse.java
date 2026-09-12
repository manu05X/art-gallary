package com.artkezai.painting.dto;

import com.artkezai.painting.Medium;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediumResponse {

	private Long id;
	private String name;

	public static MediumResponse from(Medium medium) {
		return MediumResponse.builder()
				.id(medium.getId())
				.name(medium.getName())
				.build();
	}
}
