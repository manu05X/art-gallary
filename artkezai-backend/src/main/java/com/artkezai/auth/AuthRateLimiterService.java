package com.artkezai.auth;

import com.artkezai.common.exception.TooManyRequestsException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BandwidthBuilder;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

// Phase 2.21: rate limits POST /api/auth/login and POST /api/auth/register
// only. Deliberately in-memory (Bucket4j's local, non-distributed buckets) —
// this app has exactly one backend instance today (render.yaml defines a
// single `web` service, no replica count) and Redis exists in
// docker-compose but is never wired into Spring anywhere in this codebase
// (confirmed by repo-wide search: no spring-data-redis dependency, no
// RedisConnectionFactory, no application.yml redis.* properties). Building a
// distributed limiter would mean standing up a Redis integration this app
// doesn't otherwise have, for a single-instance deployment that doesn't need
// one. Documented technical debt: these counters are per-JVM and reset on
// restart, and would under-count per client if this were ever scaled to
// multiple instances without a shared store.
@Service
@Slf4j
public class AuthRateLimiterService {

	@Value("${app.rate-limit.login.capacity:5}")
	private int loginCapacity;

	@Value("${app.rate-limit.login.refill-tokens:5}")
	private int loginRefillTokens;

	@Value("${app.rate-limit.login.refill-period-seconds:60}")
	private long loginRefillPeriodSeconds;

	@Value("${app.rate-limit.register.capacity:3}")
	private int registerCapacity;

	@Value("${app.rate-limit.register.refill-tokens:3}")
	private int registerRefillTokens;

	@Value("${app.rate-limit.register.refill-period-seconds:300}")
	private long registerRefillPeriodSeconds;

	// Keyed by client address + normalized email for login (Phase 2.21 audit:
	// a per-account-per-source bucket is the simplest defensible mitigation
	// for credential brute force against one account, without the added
	// complexity of tracking account lockout state). Registration is keyed
	// by client address alone — there is no account identity yet at that
	// point, and the threat here is high-frequency spam from one source.
	private final ConcurrentHashMap<String, BucketEntry> loginBuckets = new ConcurrentHashMap<>();
	private final ConcurrentHashMap<String, BucketEntry> registerBuckets = new ConcurrentHashMap<>();

	private record BucketEntry(Bucket bucket, AtomicLong lastAccessMillis) {
	}

	public void checkLogin(String clientAddress, String email) {
		String key = clientAddress + "|" + normalize(email);
		consumeOrThrow(loginBuckets, key, () -> buildBucket(loginCapacity, loginRefillTokens, loginRefillPeriodSeconds));
	}

	public void checkRegister(String clientAddress) {
		consumeOrThrow(registerBuckets, clientAddress,
				() -> buildBucket(registerCapacity, registerRefillTokens, registerRefillPeriodSeconds));
	}

	private void consumeOrThrow(ConcurrentHashMap<String, BucketEntry> buckets, String key, Supplier<Bucket> factory) {
		BucketEntry entry = buckets.computeIfAbsent(key, k -> new BucketEntry(factory.get(), new AtomicLong()));
		entry.lastAccessMillis().set(System.currentTimeMillis());

		ConsumptionProbe probe = entry.bucket().tryConsumeAndReturnRemaining(1);
		if (!probe.isConsumed()) {
			long retryAfterSeconds = Math.max(1, Duration.ofNanos(probe.getNanosToWaitForRefill()).toSeconds() + 1);
			throw new TooManyRequestsException(retryAfterSeconds);
		}
	}

	private Bucket buildBucket(int capacity, int refillTokens, long refillPeriodSeconds) {
		Bandwidth limit = BandwidthBuilder.builder()
				.capacity(capacity)
				.refillGreedy(refillTokens, Duration.ofSeconds(refillPeriodSeconds))
				.build();
		return Bucket.builder().addLimit(limit).build();
	}

	private String normalize(String email) {
		return email == null ? "" : email.trim().toLowerCase();
	}

	// Phase 2.21 memory-management requirement: without this, every distinct
	// (ip, email) or ip that ever hits these two endpoints would leave a
	// permanent entry in these maps — an attacker could grow them
	// indefinitely just by varying the email/IP on each request. Buckets
	// idle for over 30 minutes (long enough that any legitimate refill
	// window above has long since completed) are dropped; a client that
	// returns later simply gets a fresh, full bucket, which is not a
	// meaningful weakening of the limit itself (a genuine attacker sending
	// continuous traffic never goes idle long enough to trigger eviction).
	@Scheduled(fixedDelay = 600_000)
	void evictStaleBuckets() {
		long cutoff = System.currentTimeMillis() - Duration.ofMinutes(30).toMillis();
		int loginRemoved = evict(loginBuckets, cutoff);
		int registerRemoved = evict(registerBuckets, cutoff);
		if (loginRemoved > 0 || registerRemoved > 0) {
			log.debug("Evicted stale rate-limit buckets: login={}, register={}", loginRemoved, registerRemoved);
		}
	}

	private int evict(ConcurrentHashMap<String, BucketEntry> buckets, long cutoffMillis) {
		int before = buckets.size();
		buckets.entrySet().removeIf(e -> e.getValue().lastAccessMillis().get() < cutoffMillis);
		return before - buckets.size();
	}

}
