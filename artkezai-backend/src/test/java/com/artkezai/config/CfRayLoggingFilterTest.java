package com.artkezai.config;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class CfRayLoggingFilterTest {

	private final CfRayLoggingFilter filter = new CfRayLoggingFilter();

	@Test
	void cfRayIsAvailableToLogsDuringTheRequestAndClearedAfter() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest();
		request.addHeader("CF-Ray", "8f1a2b3c4d5e6f70-FRA");
		AtomicReference<String> seen = new AtomicReference<>();

		filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> seen.set(MDC.get("cfRay")));

		assertThat(seen.get()).isEqualTo("8f1a2b3c4d5e6f70-FRA");
		assertThat(MDC.get("cfRay")).isNull();
	}

	@Test
	void requestsWithoutCfRayLeaveTheContextEmpty() throws Exception {
		AtomicReference<String> seen = new AtomicReference<>("unset");

		filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), (req, res) -> seen.set(MDC.get("cfRay")));

		assertThat(seen.get()).isNull();
	}
}
