package com.artkezai.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Render routes every request through Cloudflare, which tags it with a
// CF-Ray id. Putting that id in the logging context (printed by the log
// pattern) ties all log lines of one request together and lets Render
// support trace it. Runs first so even security/auth logs carry the id.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CfRayLoggingFilter extends OncePerRequestFilter {

	static final String MDC_KEY = "cfRay";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String cfRay = request.getHeader("CF-Ray");
		if (cfRay != null && !cfRay.isBlank()) {
			MDC.put(MDC_KEY, cfRay.length() > 64 ? cfRay.substring(0, 64) : cfRay);
		}
		try {
			chain.doFilter(request, response);
		} finally {
			MDC.remove(MDC_KEY);
		}
	}
}
