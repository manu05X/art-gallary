# Proposal: Phase 1 verification baseline

## Why

Most of the MVP surface from the PRD and Technical Blueprint now exists (auth, gallery, moderation, offers, orders, payments, messaging, admin pages), but none of it is proven to work: the backend has **zero test files**, the PRD acceptance tests have never been run, and `CLAUDE.md` still lists "Phase 1 Step 3" as the current task even though that work is already in the code. Premium redesign work (CLAUDE.md Phase 2–5) has started on top of an unverified foundation.

A code read during planning also found that core commerce state transitions are missing: nothing ever sets an order to `PAID` or a painting to `SOLD`, and accepting an offer does not create an order. We need an honest, evidence-based baseline before any more features or redesign work.

## What Changes

- Add a backend unit-test baseline (JUnit 5 + Mockito, already on the classpath via `spring-boot-starter-test`) covering the Phase 1 and commerce service rules that exist today: painting create and submit, admin moderation, offers, and payments.
- Record each known defect as a `@Disabled` test that asserts the *correct* PRD behavior and names a defect ID, so the gap is visible in `mvn test` output without failing the build.
- Run the 10 PRD/Blueprint acceptance scenarios against the local Docker stack and record PASS / FAIL / BLOCKED with evidence (HTTP status, DB values) in `acceptance-report.md` inside this change.
- Produce a prioritized gap register (defects + missing MVP features) that maps each gap to a proposed follow-up OpenSpec change.
- Refresh the status sections of the workspace `CLAUDE.md` (`/Users/manishkumar/Desktop/Gallary/CLAUDE.md`) so they match reality and point to the next change.

## Non-goals

- No production code changes in `artkezai-backend/src/main` or `artkezai-frontend/src`. Defects found are reported, not fixed here.
- No edits to existing Flyway migrations, and no new migrations.
- No Docker volume deletion or database reset. Acceptance runs create new, clearly named test records only.
- No UI or design changes, and no continuation of premium redesign work.
- No git merges, pushes, or branch changes (merging `feature/museum-intro` into `main` is a separate decision for the user).
- No integration-test infrastructure (Testcontainers, H2, separate test database) in this change.
- No real Stripe charges. If Stripe test keys are not available, the online-payment scenario is recorded as BLOCKED.

## Capabilities

### New Capabilities
- None. This change adds tests, a verification report, and documentation only. System behavior does not change, so `.openspec.yaml` sets `skip_specs: true`.

### Modified Capabilities
- None.

## Impact

- **New files:** `artkezai-backend/src/test/java/com/artkezai/**` (unit tests), `openspec/changes/phase1-verification-baseline/acceptance-report.md`.
- **Edited files:** `/Users/manishkumar/Desktop/Gallary/CLAUDE.md` (status sections only). This file sits outside the OpenSpec root, one level above the repo.
- **Local environment:** the backend is rebuilt and restarted from the current branch, and the frontend dev server is briefly stopped for `npm run build`. The local database gains test users and paintings created through the public API.
- **Dependencies:** none added.
