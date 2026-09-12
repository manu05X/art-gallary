package com.artkezai.painting.dto;

import com.artkezai.painting.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryResponse {

	private Long id;
	private String name;
	private String code;

	public static CountryResponse from(Country country) {
		return CountryResponse.builder()
				.id(country.getId())
				.name(country.getName())
				.code(country.getCode())
				.build();
	}
}
