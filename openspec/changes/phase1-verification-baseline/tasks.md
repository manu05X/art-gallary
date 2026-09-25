# Tasks

## 1. Pre-flight

- [ ] 1.1 Confirm the running backend (:8080) and frontend (:3000) still match `HEAD` (process start time is after the last commit, and no file in `src/main` is newer than `target/classes`). Verify by recording both checks in `acceptance-report.md` under "Environment".
- [ ] 1.2 Confirm `mvn -q -o dependency:resolve` (or a plain `mvn test-compile`) succeeds with the existing test dependencies and no `pom.xml` edits. Verify the command exits 0.

## 2. Backend test baseline: painting submission (Phase 1)

- [ ] 2.1 Add `painting/PaintingServiceTest`: `submitPainting` persists DRAFT and maps `title`, `description`, `price`, `widthCm`, `heightCm`, `yearCreated`, `mediumId`, `categoryId` and `countryId` onto the entity. It throws `BusinessException` when the artist has no profile and `ResourceNotFoundException` for an unknown `countryId`. Verify `mvn test -Dtest=PaintingServiceTest` passes.
- [ ] 2.2 Add `submitForReview` tests: DRAFT goes to UNDER_REVIEW; a non-owner gets `UnauthorizedException`; a non-DRAFT painting gets `BusinessException`. Verify with the same command.
- [ ] 2.3 Add `@Disabled("D7")` tests asserting that `updatePainting` rejects edits to an APPROVED painting. Verify it shows as skipped, not failed.

## 3. Backend test baseline: moderation

- [ ] 3.1 Add `admin/AdminServiceTest`: approve moves UNDER_REVIEW to APPROVED and saves a `PAINTING_APPROVED` audit log; approving any other status throws `BusinessException`; reject sets `rejectionReason` and saves a `PAINTING_REJECTED` audit log. Verify `mvn test -Dtest=AdminServiceTest` passes.
- [ ] 3.2 Add `@Disabled("D7")` tests asserting that `requestChanges` returns the painting to the artist (not UNDER_REVIEW), and `@Disabled("D8")` tests asserting that dashboard `pendingModerations` equals the UNDER_REVIEW count. Verify both show as skipped.

## 4. Backend test baseline: offers, orders, payments

- [ ] 4.1 Add `offer/OfferServiceTest`: `makeOffer` on a non-APPROVED painting throws; COUNTER without an amount throws; `withdrawOffer` works from SUBMITTED and COUNTERED, and throws from ACCEPTED or for a non-owner. Also add `@Disabled("D3")` tests asserting that ACCEPT creates an order and that responding to a closed offer throws. Verify `mvn test -Dtest=OfferServiceTest` passes, with D3 skipped.
- [ ] 4.2 Add `order/OrderServiceTest`: `createOrder` creates PENDING_PAYMENT with a matching payment; it throws when an order already exists for the painting; `getOrder` throws for a non-owner, non-admin requester. Add `@Disabled` tests for D2 (reject a non-APPROVED painting, and mark the painting SOLD) and D4 (offer order total equals the agreed amount). Verify `mvn test -Dtest=OrderServiceTest` passes.
- [ ] 4.3 Add `payment/PaymentServiceTest`: a webhook with a missing `Stripe-Signature` throws `SignatureVerificationException` and makes no repository writes; `confirmStripePayment` sets SUCCEEDED and is idempotent; `sendBankInstructions` rejects non-bank payments and sets INSTRUCTIONS_SENT; `confirmBankTransfer` sets CONFIRMED and records the admin. Add `@Disabled` tests for D1 (the order becomes PAID) and D9 (confirming requires INSTRUCTIONS_SENT). Verify `mvn test -Dtest=PaymentServiceTest` passes.
- [ ] 4.4 Run the full `mvn test`. Verify it reports BUILD SUCCESS with 0 failures and 0 errors, and record the tests run, skipped and failed counts in `acceptance-report.md`.

## 5. Frontend build check

- [ ] 5.1 Copy `artkezai-frontend` (excluding `.next` and `node_modules`, with `node_modules` symlinked) into the session scratchpad and run `npm run build` there. Verify the exit code, and record the result and any type or lint errors in `acceptance-report.md`. Confirm the dev server on :3000 still responds with 200 afterwards.

## 6. PRD acceptance run (local stack)

- [ ] 6.1 Scenario 3, signup/login: register one buyer and one artist (the `qa+…@artkezai.test` namespace), log in as each, call `GET /api/auth/me`, and log in as the seed admin. Verify the roles returned, and record PASS/FAIL/BLOCKED with HTTP evidence.
- [ ] 6.2 Scenario 4, artist submit: as the artist, `POST /api/paintings` with every field, `POST /{id}/images` twice, and `POST /{id}/submit`. Confirm in `psql` that the saved values aren't null (including `country_id`, `width_cm`, `height_cm` and `year_created`), and confirm the painting is absent from `GET /api/paintings` while it's UNDER_REVIEW. Also check D5 with an anonymous `GET /api/paintings/{id}`. Record the evidence.
- [ ] 6.3 Scenario 5, moderation: as admin, find the painting in `GET /api/admin/moderation/queue`, approve it, and confirm it appears in `GET /api/paintings`, that `admin_audit_logs` has a row, and that `GET /my-listings` shows APPROVED. Check D6 by inspecting whether the `GET /api/admin/users` response contains `passwordHash`, and record only that the key is present, never its values. Record the evidence.
- [ ] 6.4 Scenario 1 (gallery filters) and scenario 2 (detail page): call `GET /api/paintings` with each filter (artist, medium, category, price range, country, keyword) and each sort, and compare the counts with SQL. In the browser, open `/painting/{slug}` and confirm the Buy Now, Make Offer and Message Admin controls exist and do something. Record the evidence.
- [ ] 6.5 Scenario 6, offers: the buyer offers on the approved painting, the admin counters, and the buyer accepts or the admin accepts. Check whether an order was created (D3) and what its total is (D4). Record the evidence.
- [ ] 6.6 Scenarios 7 and 8, payments: the buyer creates an order with BANK_TRANSFER; the admin sends instructions and then confirms; check `payments.status` and `orders.status` (D1). For online payment, call `POST /api/payments/intent` on a separate order and record PASS if a client secret comes back, or BLOCKED if Stripe rejects the key. Record the evidence.
- [ ] 6.7 Scenarios 9 and 10, messaging and shipping: the buyer starts a thread, the admin replies, and the thread history is retained; the admin calls `PATCH /api/orders/{id}/shipping` with tracking, and the buyer sees it in `GET /api/orders/my`. Record the evidence.
- [ ] 6.8 Browser check of the submit form: submit with 2 images and confirm navigation happens only after both upload requests finish (network log order). Record the evidence.
- [ ] 6.9 List every record created during the run (user emails, painting IDs, order IDs) at the end of `acceptance-report.md`.

## 7. Gap register and status docs

- [ ] 7.1 Add a "Gap register" section to `acceptance-report.md`: each confirmed defect (D1–D9) and missing MVP item (the `/categories` and `/countries` pages, empty `why-artkezai` and `policies` routes, 404/500 pages, the 3-step checkout, auth refresh/logout, `DELETE /api/paintings/{id}`, offers CSV, WebSocket push, analytics, backup docs), each with a P0/P1/P2 priority and a proposed follow-up change name. Verify every item traces to a scenario result, a test, or a code reference.
- [ ] 7.2 Rewrite the status sections of `/Users/manishkumar/Desktop/Gallary/CLAUDE.md` ("Phase 1 Completed Work", "Current Task", "Remaining Phase 1") from the report, name the first follow-up change as the current task, and add the note about the two phase-numbering schemes. Verify that no other CLAUDE.md section changed (diff against a backup copy in the scratchpad).
- [ ] 7.3 Run `openspec validate phase1-verification-baseline --strict`. Verify it passes.
