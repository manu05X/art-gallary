package com.artkezai.config;

import com.artkezai.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthFilter jwtAuthFilter;
	private final ApiAuthenticationEntryPoint apiAuthenticationEntryPoint;
	private final ApiAccessDeniedHandler apiAccessDeniedHandler;

	// Comma-separated list of allowed origins — set ALLOWED_ORIGINS env var in production
	@Value("${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173,https://artkezai-frontend.vercel.app}")
	private String allowedOrigins;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				// Phase 2.19: without this, Spring Security has no
				// AuthenticationEntryPoint registered (no httpBasic/formLogin
				// to implicitly provide one either), so it falls back to its
				// own Http403ForbiddenEntryPoint — every anonymous request
				// denied by the rules below came back as an empty-body 403
				// instead of 401. This restores the conventional distinction
				// (unauthenticated -> 401, authenticated-wrong-role -> 403)
				// for filter-chain-level denials only; @PreAuthorize denials
				// and their own AccessDeniedException handling in
				// GlobalExceptionHandler (Phase 2.17) are untouched.
				.exceptionHandling(handling -> handling
						.authenticationEntryPoint(apiAuthenticationEntryPoint)
						.accessDeniedHandler(apiAccessDeniedHandler)
				)
				.authorizeHttpRequests(authz -> authz
						// Artist + Admin — declared before the broader "GET /api/artists/**
						// -> permitAll" public rule below, since authorizeHttpRequests
						// matches in declaration order and the first match wins. Left in
						// the old order, every method under /api/artists/me/** (including
						// GET) would silently fall through to permitAll instead of the
						// role check (Phase 2.12 finding).
						.requestMatchers("/api/artists/me/**").hasAnyRole("ARTIST", "ADMIN")

						// Public endpoints
						.requestMatchers(HttpMethod.GET, "/api/paintings/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/artists/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/mediums/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/countries/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/content/**").permitAll()
						.requestMatchers("/api/auth/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()
						.requestMatchers("/actuator/health").permitAll()
						// WebSocket handshake; the JWT is checked on the STOMP CONNECT
						// frame by WebSocketAuthInterceptor.
						.requestMatchers("/ws/**").permitAll()

						// Artist view of offers on their own paintings — declared before
						// the broader /api/offers/** rule, which would otherwise match first
						// and deny every artist with 403.
						.requestMatchers(HttpMethod.GET, "/api/offers/received").hasAnyRole("ARTIST", "ADMIN")

						// Buyer + Admin
						.requestMatchers("/api/offers/**").hasAnyRole("BUYER", "ADMIN")
						.requestMatchers("/api/orders/**").hasAnyRole("BUYER", "ADMIN")

						// Artist + Admin
						.requestMatchers(HttpMethod.POST, "/api/paintings").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.PATCH, "/api/paintings/{id}/**").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/paintings/{id}/submit").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/paintings/{id}/images").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/paintings/{id}/images/**").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/paintings/{id}").hasAnyRole("ARTIST", "ADMIN")

						// Admin only
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// All other authenticated
						.anyRequest().authenticated()
				)
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		List<String> origins = Arrays.stream(allowedOrigins.split(","))
				.map(String::trim)
				.collect(Collectors.toList());

		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(origins);
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

}
