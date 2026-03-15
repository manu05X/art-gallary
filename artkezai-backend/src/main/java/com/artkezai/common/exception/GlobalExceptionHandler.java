package com.artkezai.common.exception;

import com.artkezai.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(
			ResourceNotFoundException ex, WebRequest request) {
		log.warn("Resource not found: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ApiResponse<?>> handleUnauthorizedException(
			UnauthorizedException ex, WebRequest request) {
		log.warn("Unauthorized: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.FORBIDDEN)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiResponse<?>> handleBusinessException(
			BusinessException ex, WebRequest request) {
		log.warn("Business exception: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValid(
			MethodArgumentNotValidException ex, WebRequest request) {
		Map<String, String> errors = new HashMap<>();
		ex.getBindingResult().getFieldErrors().forEach(error ->
				errors.put(error.getField(), error.getDefaultMessage())
		);
		log.warn("Validation error: {}", errors);
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.validationError(errors));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<?>> handleGlobalException(
			Exception ex, WebRequest request) {
		log.error("Unexpected error occurred", ex);
		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.error("An unexpected error occurred. Please try again later."));
	}

}
