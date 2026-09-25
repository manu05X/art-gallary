# Acceptance report: 2026-09-25

## Environment

- Docker: Postgres 15, MinIO, Redis and MailHog restarted with existing volumes (no data reset). Flyway reported schema version 9 with no pending migrations.
- Backend: `target/artkezai-backend-0.0.1-SNAPSHOT.jar` built from the working tree, with `mvn clean package` running 67 unit tests (all passing).
- Stripe: no real keys were available on this machine. The backend ran with a placeholder `STRIPE_SECRET_KEY` and a locally generated `STRIPE_WEBHOOK_SECRET`. Webhook events were signed with that local secret.
- Frontend: `npm run build` passes on Next 14.2.35, with type checks, lint and 32 routes. Browser checks ran against the existing `next dev` server on :3000.

## API scenarios: 61 passed, 1 blocked

A first run failed 3 messaging checks. Admins could not see or reply to buyer threads, and thread history was not returned. That defect was fixed in `MessageService`, and the table below is the re-run.

| Scenario | Check | Result | Evidence |
|---|---|---|---|
| S3 | register buyer | PASS | HTTP 201 role=BUYER |
| S3 | register artist | PASS | HTTP 201 role=ARTIST |
| S3 | seed admin login | PASS | HTTP 200 |
| S3 | GET /auth/me as buyer | PASS | HTTP 200 role=BUYER |
| S3 | admin self-registration refused | PASS | HTTP 400 |
| S4 | POST /paintings returns 201 DRAFT | PASS | HTTP 201 id=47 status=DRAFT |
| S4 | upload 2 images | PASS | HTTP [201, 201] urls=['http://localhost:9000/artkezai-paintings/paintings/47/0dcc0c', 'http://localhost:9000/a |
| S4 | persisted fields not null | PASS | db: QA Harbour 1790340495/1500.00/1/1/24/60/80/2024/DRAFT |
| S4 | 2 images persisted | PASS | db images=2 |
| S4 | submit for review | PASS | HTTP 200 status=UNDER_REVIEW |
| S4 | under-review painting absent from gallery | PASS | HTTP 200 |
| S4/D5 | anonymous GET unpublished by id → 404 | PASS | HTTP 404 |
| S4/D5 | other user GET unpublished by slug → 404 | PASS | HTTP 404 |
| S4/D5 | owner can view own unpublished painting | PASS | HTTP 200 |
| S5 | painting in moderation queue | PASS | HTTP 200 queue=3 |
| S5 | approve | PASS | HTTP 200 |
| S5 | approved painting visible in gallery | PASS | HTTP 200 |
| S5 | audit log written | PASS | db: PAINTING_APPROVED |
| S5 | my-listings shows APPROVED | PASS | HTTP 200 status=APPROVED |
| S5/D6 | admin users response has no credentials | PASS | HTTP 200 keys=['createdAt', 'email', 'firstName', 'id', 'isActive', 'isEmailVerified', 'lastLoginAt', 'lastNam |
| S5/D7 | artist cannot edit live painting | PASS | HTTP 400 |
| S5/D7 | request-changes returns painting to DRAFT with notes | PASS | HTTP 200 db=DRAFT/Please add a photo of the back |
| S5/D7 | artist can edit returned draft | PASS | HTTP 200 |
| S1 | filter [categoryId=1] matches DB | PASS | api=7 db=7 |
| S1 | filter [mediumId=1] matches DB | PASS | api=9 db=9 |
| S1 | filter [countryId=24] matches DB | PASS | api=1 db=1 |
| S1 | filter [minPrice=1000&maxPrice=2000] matches DB | PASS | api=5 db=5 |
| S1 | filter [artistId=39] matches DB | PASS | api=1 db=1 |
| S1 | filter [none] matches DB | PASS | api=15 db=15 |
| S1 | keyword search finds the new painting | PASS | api=1 |
| S1 | sort price-asc | PASS | first=[1.0, 500.0, 800.0] |
| S1 | sort price-desc | PASS | first=[4250.0, 3400.0, 3100.0] |
| S6 | buyer makes offer | PASS | HTTP 201 id=2 |
| S6 | artist sees offers received (was 403) | PASS | HTTP 200 |
| S6 | other user cannot read the offer | PASS | HTTP 403 |
| S6 | admin counters | PASS | HTTP 200 |
| S6/D3 | admin cannot accept its own counter | PASS | HTTP 400 |
| S6/D3 | buyer accepts counter | PASS | HTTP 200 agreed=1200.0 |
| S6/D3+D4 | order created automatically at agreed price | PASS | db: 11/1200.00/PENDING_PAYMENT |
| S6/D2 | painting is reserved: another buy is refused | PASS | HTTP 403 |
| S6 | buyer completes offer checkout | PASS | HTTP 201 order=11 total=1200.0 |
| S6 | offer checkout cannot run twice | PASS | HTTP 400 |
| S10 | cannot ship an unpaid order | PASS | HTTP 400 |
| S8/D9 | confirm before instructions refused | PASS | HTTP 400 |
| S8 | admin sends bank instructions | PASS | HTTP 200 |
| S8/D1+D2 | bank confirm → payment CONFIRMED, order PAID, painting SOLD | PASS | HTTP 200 db=CONFIRMED/PAID/SOLD |
| S8 | sold painting stays public | PASS | HTTP 200 |
| S10 | admin marks shipped with tracking | PASS | HTTP 200 |
| S10 | buyer sees SHIPPED + tracking | PASS | HTTP 200 status=SHIPPED tracking=QA-TRK-1790340495 |
| S7 | Buy Now online creates order | PASS | HTTP 201 order=12 |
| S7 | create Stripe payment intent — BLOCKED: needs a real STRIPE_SECRET_KEY | BLOCKED | HTTP 400 {"success":false,"message":"Unable to process payment at this time. Please try again."} |
| S7 | webhook with bad signature refused | PASS | HTTP 400 |
| S7/D1 | signed payment_intent.succeeded → SUCCEEDED, PAID, SOLD | PASS | HTTP 200 db=SUCCEEDED/PAID/SOLD |
| S7 | webhook redelivery is idempotent | PASS | HTTP 200 |
| S9 | buyer starts thread | PASS | HTTP 201 thread=3 |
| S9 | admin sees the thread in inbox | PASS | HTTP 200 count=3 |
| S9 | admin replies | PASS | HTTP 201 {"success":true,"data":{"id":5,"threadId":3,"senderId":1,"senderName":"Artkezai Admin","body":"Yes,  |
| S9 | thread history returned with messages | PASS | HTTP 200 messages=2 |
| D8 | dashboard pendingModerations is real | PASS | api=2 |
| D8 | orders CSV export | PASS | HTTP 200 lines=13 |
| D8 | offers CSV export | PASS | HTTP 200 |
| content | public content page has no user data | PASS | HTTP 200 keys=['body', 'isPublished', 'slug', 'title', 'updatedAt'] |

## Browser checks

| Check | Result | Evidence |
|---|---|---|
| B1 detail page shows Buy Now / Make an Offer / Message Gallery | PASS | slug=e2elifecyclepainting1789442375148 |
| B2 sold painting shows Sold, no Buy Now | PASS | slug=qaharbour1790340495 |
| B3 /policies/privacy renders | PASS | footer link target |
| B3 /why-artkezai renders | see note |  |
| B3 unknown route shows 404 page | PASS | HTTP 404 |
| B4 submit: 2 uploads succeed before navigation | PASS | ["upload:201","upload:201","nav:0"] |
| B4 new painting appears in My Listings | see note |  |
| B5 admin orders page shows shipping / bank actions | PASS |  |
| B5 admin offers page renders | PASS |  |
| B6 buyer orders page shows SHIPPED order + tracking | PASS |  |

Notes:
- `/why-artkezai` returned 404 only on the long-running dev server, which was started before the route existed. The production build serves it with HTTP 200.
- The browser-created painting was saved as DRAFT with 2 images (row id 50). It is listed under the Draft tab of My Listings; the page opens on the Approved tab.

## Blocked

- S7, creating a Stripe PaymentIntent needs a real `STRIPE_SECRET_KEY` (sk_test_…). Everything after it (signed webhook, then SUCCEEDED, PAID and SOLD, plus idempotent redelivery) was verified.

## Records created in the local database

- Users: qa+buyer-1790340495@artkezai.test, qa+artist-1790340495@artkezai.test, plus the first run's `qa+…-1790340413@artkezai.test` pair
- Paintings: titles starting with `QA ` (ids 44–50)
- Orders, offers and message threads linked to those users and paintings
- One `payments.stripe_payment_intent_id` value was set by SQL on each QA online order (`pi_qa_<ts>`) to exercise the webhook path

---

# Re-run after follow-up fixes (2026-09-25, evening)

## What changed

- **Next.js 15.5.26 + React 19.** `npm audit --omit=dev` reports 0 vulnerabilities, with Next's bundled PostCSS overridden to 8.5.28. Route params now come from `useParams()` or async `params`, and the global `JSX` type changed to `React.JSX`.
- **Unpaid reservations are released.** `ReservationReleaseJob` cancels offer orders whose checkout was never completed, and unpaid online orders, after `app.reservation.hold-hours` (default 72). Bank-transfer orders are never auto-released. A late payment on a cancelled order is logged for refund and does not sell the painting. There is a new `OrderStatus.CANCELLED`.
- **Demo accounts in production.** `DEMO_ARTIST_PASSWORD` rotates the demo artists' published password instead of deactivating them.
- **Token refresh and logout.** `POST /api/auth/refresh`, and `POST /api/auth/logout`, which revokes every earlier token using the new `users.tokens_valid_after` column (migration V10). Password reset also revokes tokens. Deactivated accounts' tokens are now rejected. The frontend refreshes tokens that are close to expiry, and its Logout button calls the server.
- **Delete painting.** `DELETE /api/paintings/{id}`: the artist can delete their own draft or rejected paintings, and an admin can delete any painting that isn't sold. A painting with offers or orders cannot be deleted. The frontend has a Delete button on draft and rejected listings.
- **Fixed: image deletion.** Deleting an image now checks that it belongs to the painting in the URL. Before, an artist could delete another artist's image.
- **Live notifications.** STOMP over `/ws` with JWT on CONNECT. A member can subscribe only to their own queue, and only admins to `/topic/admin`. Notifications cover offers, moderation, payment, shipping and messages, and are sent after commit. The frontend shows them as toasts and refreshes data.
- **Analytics.** Plausible pageviews plus `offer_submitted`, `order_created` and `payment_succeeded` events. Off unless `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set.
- **Backup and restore guide:** `docs/operations/backup-restore.md`.
- **Fixed: dashboard reload.** Reloading or deep-linking into `/dashboard/*` bounced through the login page. The buyer dashboard guard now waits for the persisted session, like the admin and artist guards.

## Results

- Backend `mvn clean package`: 92 tests, 0 failures.
- Frontend: `tsc --noEmit` clean; `next build` passes, 32 routes; clean-install build passes.
- API end-to-end, run against a freshly restarted backend with migration V10 applied: **71/72**. The 10 new checks for delete, image ownership, refresh, logout and revocation all pass. Still blocked: creating a Stripe PaymentIntent (needs a real `STRIPE_SECRET_KEY`).
- WebSocket: **5/5.** A bad token is refused, a buyer cannot subscribe to `/topic/admin`, the buyer is notified when their offer is answered, and the admin is notified of a new offer.
- Browser, run against a fresh `next dev` on Next 15: **13/13.** This includes the notification socket opening after login, and the Logout button revoking the old token on the server.

## Test-session note

For the test run the backend was started with `-Dapp.reservation.hold-hours=876000`. That stopped the release job from cancelling pre-existing local orders 2, 5, 7 and 8, which are unpaid online orders from 2026-09-14/15. With the default setting, the backend will cancel them about a minute after startup.

The WebSocket check left two offers (one rejected, one submitted) from `qa+buyer-1790342680@artkezai.test` on painting 40.
