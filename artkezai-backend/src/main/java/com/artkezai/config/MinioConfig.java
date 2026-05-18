package com.artkezai.config;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class MinioConfig {

	@Value("${minio.endpoint:}")
	private String endpoint;

	@Value("${minio.access-key:minioadmin}")
	private String accessKey;

	@Value("${minio.secret-key:minioadmin123}")
	private String secretKey;

	@Bean
	public MinioClient minioClient() {
		if (endpoint == null || endpoint.isBlank()) {
			log.warn("MinIO not configured — image upload disabled. Set MINIO_ENDPOINT to enable.");
			return MinioClient.builder()
					.endpoint("http://localhost:9000")
					.credentials("disabled", "disabled")
					.build();
		}
		log.info("MinIO configured at: {}", endpoint);
		return MinioClient.builder()
				.endpoint(endpoint)
				.credentials(accessKey, secretKey)
				.build();
	}

}
