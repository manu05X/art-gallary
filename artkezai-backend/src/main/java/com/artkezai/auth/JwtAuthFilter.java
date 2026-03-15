package com.artkezai.auth;

import com.artkezai.user.User;
import com.artkezai.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		try {
			String authHeader = request.getHeader("Authorization");

			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				String token = authHeader.substring(7);

				if (jwtService.isTokenValid(token)) {
					String email = jwtService.extractEmail(token);
					Optional<User> user = userRepository.findByEmail(email);

					if (user.isPresent()) {
						User userDetails = user.get();
						UsernamePasswordAuthenticationToken auth =
								new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
						SecurityContextHolder.getContext().setAuthentication(auth);
						log.debug("Set security context for user: {}", email);
					}
				}
			}
		} catch (Exception ex) {
			log.debug("Could not set authentication in security context: {}", ex.getMessage());
		}

		filterChain.doFilter(request, response);
	}

}
