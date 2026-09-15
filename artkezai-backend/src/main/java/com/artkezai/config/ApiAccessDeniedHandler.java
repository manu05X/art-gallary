package com.artkezai.config;

import com.artkezai.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

// Phase 2.19: the status code here (403) was already correct — this handler
// only replaces the default AccessDeniedHandlerImpl's empty response body
// with the same ApiResponse JSON shape the rest of the app uses, for an
// authenticated user who fails a SecurityConfig URL-matcher role check (e.g.
// a BUYER hitting /api/admin/**). This is a distinct denial path from
// @PreAuthorize failures (GlobalExceptionHandler.handleAccessDeniedException,
// Phase 2.17), which never reach this class at all — those are unaffected.
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiAccessDeniedHandler implements AccessDeniedHandler {

	private final ObjectMapper objectMapper;

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
			throws IOException {
		log.warn("Access denied: authenticated user lacks the required role/authority for this request");
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error("Access denied")));
	}

}
