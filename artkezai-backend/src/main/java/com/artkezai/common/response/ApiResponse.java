package com.artkezai.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

	private boolean success;
	private T data;
	private String message;
	private Map<String, String> errors;

	public static <T> ApiResponse<T> ok(T data) {
		return ApiResponse.<T>builder()
				.success(true)
				.data(data)
				.build();
	}

	public static <T> ApiResponse<T> ok(T data, String message) {
		return ApiResponse.<T>builder()
				.success(true)
				.data(data)
				.message(message)
				.build();
	}

	public static <T> ApiResponse<T> error(String message) {
		return ApiResponse.<T>builder()
				.success(false)
				.message(message)
				.build();
	}

	public static <T> ApiResponse<T> validationError(Map<String, String> errors) {
		return ApiResponse.<T>builder()
				.success(false)
				.message("Validation failed")
				.errors(errors)
				.build();
	}

	public static <T> ApiResponse<T> validationError(String fieldName, String errorMessage) {
		Map<String, String> errors = new HashMap<>();
		errors.put(fieldName, errorMessage);
		return validationError(errors);
	}

}
