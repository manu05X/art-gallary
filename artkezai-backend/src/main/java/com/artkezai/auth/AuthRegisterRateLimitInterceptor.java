package com.artkezai.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

// Phase 2.21: Spring MVC's @Valid bean validation on RegisterRequest runs
// during controller-method argument resolution, which happens AFTER
// HandlerInterceptor.preHandle() but BEFORE the controller method body. A
// call to AuthRateLimiterService placed inside AuthController.register()
// itself would never run for a malformed payload (missing fields, bad email
// shape) — @Valid rejects it with 400 first, so the limiter never sees the
// request, letting an attacker send unlimited malformed registration
// payloads for free. Running the check here, in preHandle(), closes that
// gap. Only registration needs this: its rate-limit key is the client
// address alone (see AuthRateLimiterService), so no request body needs to
// be read to compute it. Login's key includes the email, which is only
// available after body deserialization, so login's check stays in
// AuthController itself — its documented requirement ("failed login attempt
// must consume capacity") is about wrong-credential attempts, which already
// pass @Valid and reach the controller body.
@Component
@RequiredArgsConstructor
public class AuthRegisterRateLimitInterceptor implements HandlerInterceptor {

	private final AuthRateLimiterService rateLimiterService;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		rateLimiterService.checkRegister(request.getRemoteAddr());
		return true;
	}

}
