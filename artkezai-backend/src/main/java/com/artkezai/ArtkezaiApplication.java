package com.artkezai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// Phase 2.21: EnableScheduling powers only the periodic stale-bucket cleanup
// in AuthRateLimiterService — nothing else in the app used @Scheduled before
// this, so this is a narrowly-scoped addition, not a general scheduling
// subsystem.
@SpringBootApplication
@EnableScheduling
public class ArtkezaiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ArtkezaiApplication.class, args);
	}

}
