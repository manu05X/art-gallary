package com.artkezai.config;

import com.artkezai.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

// Phase 2.19: without this, Spring Security had no AuthenticationEntryPoint
// configured (no httpBasic/formLogin/oauth2Login in SecurityConfig either,
// which would otherwise register one implicitly), so it fell back to its own
// default Http403ForbiddenEntryPoint — meaning every anonymous request denied
// by the filter chain (a missing/invalid JWT hitting a protected route) came
// back as an empty-body 403, not a 401. This is the root cause identified and
// confirmed live in the Phase 2.19 audit. Registering this entry point only
// changes that one thing: unauthenticated -> 401 with the same ApiResponse
// JSON shape used everywhere else. It does not touch AccessDeniedHandler
// (authenticated-but-wrong-role still 403, see ApiAccessDeniedHandler),
// route permissions, or the JWT filter itself.
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper;

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException {
		log.debug("Rejected unauthenticated request to a protected endpoint");
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error("Authentication required")));
	}

}
