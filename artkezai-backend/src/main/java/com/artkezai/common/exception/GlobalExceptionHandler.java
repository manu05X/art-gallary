package com.artkezai.common.exception;

import com.artkezai.common.response.ApiResponse;
import com.stripe.exception.SignatureVerificationException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

	// Phase 2.18: org.springframework.web.servlet.resource.NoResourceFoundException
	// — thrown by Spring MVC's own DispatcherServlet/ResourceHttpRequestHandler
	// when a request matches no controller mapping and no static resource
	// (i.e. a genuinely nonexistent route, such as a typo'd or fake URL).
	// Distinct from this app's own ResourceNotFoundException above, which
	// means "a real entity your request named doesn't exist" (e.g. order id
	// 999999) — that case was already correctly handled and is untouched.
	// Before this handler existed, an unmatched route fell through to the
	// generic Exception handler below and was misreported as a 500 (found
	// during Phase 2.17 testing). A missing route is routine, expected
	// client behavior — not an application failure — so this logs at DEBUG
	// with a static message only, never the requested path (which could
	// otherwise echo attacker-supplied input into the logs on every probe).
	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiResponse<?>> handleNoResourceFoundException(
			NoResourceFoundException ex, WebRequest request) {
		log.debug("No matching route for this request");
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.error("Resource not found"));
	}

	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ApiResponse<?>> handleUnauthorizedException(
			UnauthorizedException ex, WebRequest request) {
		log.warn("Unauthorized: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.FORBIDDEN)
				.body(ApiResponse.error(ex.getMessage()));
	}

	// Phase 2.15: Stripe webhook signature failures (missing header,
	// malformed header, wrong signature, tampered payload) all surface as
	// this exception from Webhook.constructEvent. Deliberately does NOT log
	// ex.getMessage() — Stripe's own message can echo back header content,
	// which is attacker-controlled on a forged request — only a static,
	// safe description. Must be its own handler so this never falls into
	// the generic 500 handler below.
	@ExceptionHandler(SignatureVerificationException.class)
	public ResponseEntity<ApiResponse<?>> handleSignatureVerificationException(
			SignatureVerificationException ex, WebRequest request) {
		log.warn("Rejected Stripe webhook request: signature verification failed");
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error("Invalid webhook signature"));
	}

	// Phase 2.17: org.springframework.security.access.AccessDeniedException —
	// the exception Spring Security's method-security interceptor throws
	// when an authenticated user fails a @PreAuthorize check (e.g. an
	// ARTIST hitting a @PreAuthorize("hasRole('BUYER')") endpoint). This is
	// a distinct denial path from the SecurityConfig filter-chain's own URL
	// matchers (".requestMatchers(...).hasRole(...)"), which are intercepted
	// earlier by Spring Security's own ExceptionTranslationFilter and never
	// reach this class at all — those already correctly return 403 via
	// Spring Boot's default AccessDeniedHandler and are unaffected by this
	// change. @PreAuthorize denials, by contrast, are thrown from inside
	// the controller method invocation itself and propagate as an ordinary
	// exception straight to @RestControllerAdvice, where — before this
	// handler existed — they fell through to the generic Exception handler
	// below and were misreported as a 500. Deliberately does not log
	// ex.getMessage()/the authorization expression or stack trace — this is
	// an expected, routine outcome of normal request handling, not an
	// application failure, so it's logged at WARN with a static message
	// only, matching the same rationale as the UnauthorizedException and
	// SignatureVerificationException handlers above.
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(
			AccessDeniedException ex, WebRequest request) {
		log.warn("Access denied: authenticated user lacks the required role/authority for this request");
		return ResponseEntity
				.status(HttpStatus.FORBIDDEN)
				.body(ApiResponse.error("Access denied"));
	}

	// Phase 2.21: thrown by AuthRateLimiterService when the login or register
	// bucket for a given key is exhausted. Deliberately does not log the
	// bucket key (client address / normalized email) or echo it back in the
	// response — only that a limit was hit. Retry-After is derived from the
	// limiter's own computed wait time, not a hardcoded value.
	@ExceptionHandler(TooManyRequestsException.class)
	public ResponseEntity<ApiResponse<?>> handleTooManyRequestsException(
			TooManyRequestsException ex, WebRequest request) {
		log.warn("Rate limit exceeded for an auth request");
		return ResponseEntity
				.status(HttpStatus.TOO_MANY_REQUESTS)
				.header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
				.body(ApiResponse.error("Too many requests. Please try again later."));
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

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiResponse<?>> handleConstraintViolation(
			ConstraintViolationException ex, WebRequest request) {
		Map<String, String> errors = new HashMap<>();
		ex.getConstraintViolations().forEach(violation ->
				errors.put(violation.getPropertyPath().toString(), violation.getMessage())
		);
		log.warn("Constraint violation: {}", errors);
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.validationError(errors));
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiResponse<?>> handleMethodNotSupported(
			HttpRequestMethodNotSupportedException ex, WebRequest request) {
		log.warn("Method not supported: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.METHOD_NOT_ALLOWED)
				.body(ApiResponse.error("HTTP method not supported for this endpoint"));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiResponse<?>> handleTypeMismatch(
			MethodArgumentTypeMismatchException ex, WebRequest request) {
		log.warn("Type mismatch: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error("Invalid value for parameter '" + ex.getName() + "'"));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<?>> handleMessageNotReadable(
			HttpMessageNotReadableException ex, WebRequest request) {
		log.warn("Malformed request body: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error("Malformed request body"));
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
