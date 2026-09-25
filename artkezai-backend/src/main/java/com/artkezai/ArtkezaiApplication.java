package com.artkezai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// EnableScheduling powers the periodic stale-bucket cleanup in
// AuthRateLimiterService and the unpaid-reservation release in
// ReservationReleaseJob.
@SpringBootApplication
@EnableScheduling
public class ArtkezaiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ArtkezaiApplication.class, args);
	}

}
