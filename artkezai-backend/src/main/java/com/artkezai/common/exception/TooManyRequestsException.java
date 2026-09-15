package com.artkezai.common.exception;

import lombok.Getter;

// Phase 2.21: thrown by AuthRateLimiterService when a login/register bucket
// is exhausted. Carries only a retry-after duration — never the bucket key,
// the client address, or anything else that could leak rate-limiter
// internals back to the caller.
@Getter
public class TooManyRequestsException extends RuntimeException {

	private final long retryAfterSeconds;

	public TooManyRequestsException(long retryAfterSeconds) {
		super("Too many requests");
		this.retryAfterSeconds = retryAfterSeconds;
	}

}
