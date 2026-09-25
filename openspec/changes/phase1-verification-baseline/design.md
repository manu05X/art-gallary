# Design: Phase 1 verification baseline

## Context

See `proposal.md` (Why). Current state observed during planning:

- **Backend tests:** `artkezai-backend/src/test` contains no files. `spring-boot-starter-test` (JUnit 5, Mockito, AssertJ) and `spring-security-test` are already in `pom.xml`.
- **Startup requirements:** `application.yml` has no fallback for `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`, so any `@SpringBootTest` context fails to start without them. The schema uses PostgreSQL enum types (`user_role`, `painting_status`), so H2 is not a drop-in database.
- **Running local stack:** Docker (Postgres, MinIO, Redis, MailHog) has been up for 13 days. The backend (`mvn spring-boot:run`, :8080) and frontend (`next dev`, :3000) were both started on Sept 15, after the latest commit, and no source file is newer than `target/classes`. The running servers match `HEAD` of `feature/museum-intro`.
- **Local data:** 78 users (5 admin, 36 artist, 37 buyer) and 34 paintings. The seed admin is `admin@artkezai.com` (V2 migration and README), and seed artists use `Artist@123` (V8/V9).
- **Rate limits:** register allows 3 per 5 minutes per IP, and login allows 5 per minute per IP and email. The acceptance run has to stay within these.

### Defects found by code read, to be confirmed by tests and the acceptance run

| ID | Area | Observed behavior (root cause) | PRD expectation |
|---|---|---|---|
| D1 | Payments | `PaymentService.confirmStripePayment` and `confirmBankTransfer` update only `Payment.status`. No code anywhere sets `OrderStatus.PAID`. | Payment success moves the order to PAID |
| D2 | Orders | No code sets `PaintingStatus.SOLD`. `OrderService.createOrder` does not check that the painting is `APPROVED`. | Only live paintings can be bought, and bought paintings become SOLD |
| D3 | Offers | `OfferService.respondToOffer(ACCEPT)` sets the status but creates no order. It also has no guard against responding to an offer that is already accepted, rejected, or withdrawn. | Acceptance creates the order automatically |
| D4 | Orders | An order made from an offer uses `painting.getPrice()`, not the accepted or countered amount. | Order total equals the agreed offer amount |
| D5 | Visibility | `GET /api/paintings/{id}` and `/slug/{slug}` are `permitAll` and don't filter by status, so DRAFT, UNDER_REVIEW and REJECTED paintings can be read publicly by ID. | Not visible publicly until approved |
| D6 | Security / API boundary | `GET /api/admin/users` returns the `User` JPA entity, which serializes `passwordHash`, `resetToken` and `emailVerifyToken`. `/audit-logs` also returns an entity. | DTOs only (CLAUDE.md) |
| D7 | Moderation | `requestChanges` sets notes but leaves the status UNDER_REVIEW. `updatePainting` has no status guard, so an APPROVED, live painting can be edited without re-review. | Artist edits only until approved, and request-changes goes back to the artist |
| D8 | Admin | Dashboard stats are hardcoded (`approvedPaintings = count()`, `pendingModerations = 0`), and `/export/orders` returns an empty body. | Real counts, CSV export |
| D9 | Bank transfer | `confirmBankTransfer` doesn't require `INSTRUCTIONS_SENT` first and doesn't check the payment method. | instructions_sent → confirmed |

## Goals / Non-Goals

**Goals:**
- `mvn test` runs a real test suite that is green and fast, and needs no Docker or secrets.
- Every defect above is either confirmed or dismissed with evidence.
- A reader of `acceptance-report.md` knows exactly which PRD acceptance tests pass today.

**Non-Goals:**
- Fixing any defect. Each one becomes a follow-up change.
- Controller and security-filter tests (`@WebMvcTest`). Authorization is checked over real HTTP in the acceptance run instead.

## Decisions

1. **Mockito unit tests on services, not `@SpringBootTest`.**
   The business rules to verify (status transitions, ownership checks, audit logging) live in the service classes, which use constructor injection and can be built directly.
   - *Alternative: Testcontainers.* Rejected: it adds a dependency and Docker coupling to `mvn test`.
   - *Alternative: a separate `artkezai_test` database in the running Postgres.* Rejected: it couples tests to local state, which CLAUDE.md asks us to protect.
   - *Alternative: H2.* Rejected: it doesn't support the Postgres enum types.
   - `@Value` fields (`minio.bucket`, Stripe webhook secret) are set with `ReflectionTestUtils`.

2. **Known defects as `@Disabled("Dn: …")` tests that assert the correct behavior.**
   `mvn test` stays green, the gap shows up in the skipped count, and fixing a defect means deleting one annotation.
   - *Alternative: failing tests.* Rejected: a red build would block unrelated work.
   - *Alternative: no tests for defects.* Rejected: the gap would be invisible.

3. **Test layout mirrors the main packages:** `painting/PaintingServiceTest`, `admin/AdminServiceTest`, `offer/OfferServiceTest`, `payment/PaymentServiceTest`, `order/OrderServiceTest`. Small builder helpers stay inside each test class. No shared fixture framework.

4. **Run acceptance tests over HTTP (`curl`) against the running servers, plus SQL reads.**
   The running servers already match `HEAD`, so no restart is needed, and restarting would require re-supplying the Stripe secrets. Evidence per scenario: request, HTTP status, key response fields, and a `psql` SELECT for persisted state. Browser checks cover only things HTTP can't show (the detail page buttons, and upload-before-navigation on the submit form).

5. **Test data is namespaced.** New users use `qa+<scenario>-<timestamp>@artkezai.test` and new paintings are titled `QA <scenario> <timestamp>`. Nothing is deleted afterwards. The report lists what was created so it can be cleaned up later if the user wants.

6. **Build the frontend in a scratch copy.** `npm run build` writes to `.next/`, which the running `next dev` also uses, so building in place would break the live dev server. The build runs from a copy of `artkezai-frontend` (source plus a symlinked `node_modules`) in the session scratchpad.

7. **`CLAUDE.md` edits are limited to the status sections.** "Phase 1 Completed Work", "Current Task" and "Remaining Phase 1" are rewritten from the acceptance report. Engineering Principles, Technology Stack and the roadmap stay unchanged, except for a one-line note that the blueprint and CLAUDE.md number their phases differently.

## Risks / Trade-offs

- [Unit tests with mocks miss query and mapping bugs (for example, the `PaintingSpec` filters)] → The acceptance run covers these end to end against real Postgres.
- [The admin password may have been changed locally from `Admin@123`] → Admin scenarios are marked BLOCKED and the user is asked; passwords aren't reset through SQL.
- [Stripe secrets in the running process may be placeholders] → The online-payment scenario tests only up to creating a payment intent. If Stripe rejects the key, it's recorded as BLOCKED (config), not FAIL. No signed webhook is forged, because the scenario needs the real webhook secret.
- [Register rate limit (3 per 5 minutes)] → Only 2 new users are registered (1 buyer, 1 artist), and seed accounts are used everywhere else.
- [`mvn test` recompiles into `target/classes` while the backend runs from it] → Class files are rebuilt from the same source. The running JVM has already loaded them and there's no devtools restart, so the effect is nil.
- [The acceptance run adds rows to the persistent local database] → This is accepted and documented (Decision 5). No destructive SQL is run.

## Migration Plan

Not applicable: no schema changes and no deploy. To roll back, delete `src/test/**` and revert `CLAUDE.md`.
