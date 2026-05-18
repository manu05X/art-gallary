package com.artkezai.config;

import com.artkezai.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.security.EnableMethodSecurity;
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

	// Comma-separated list of allowed origins — set ALLOWED_ORIGINS env var in production
	@Value("${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}")
	private String allowedOrigins;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(authz -> authz
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

						// Buyer + Admin
						.requestMatchers("/api/offers/**").hasAnyRole("BUYER", "ADMIN")
						.requestMatchers("/api/orders/**").hasAnyRole("BUYER", "ADMIN")

						// Artist + Admin
						.requestMatchers(HttpMethod.POST, "/api/paintings").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/paintings/{id}/**").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/paintings/{id}/images").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/paintings/{id}/images/**").hasAnyRole("ARTIST", "ADMIN")
						.requestMatchers("/api/artists/me/**").hasAnyRole("ARTIST", "ADMIN")

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
