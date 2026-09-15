package com.artkezai.config;

import com.artkezai.auth.AuthRegisterRateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Phase 2.21: registers the register-endpoint rate-limit interceptor so it
// runs ahead of @Valid bean validation. Scoped to exactly one path — this is
// not a general-purpose interceptor chain.
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

	private final AuthRegisterRateLimitInterceptor authRegisterRateLimitInterceptor;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(authRegisterRateLimitInterceptor).addPathPatterns("/api/auth/register");
	}

}
