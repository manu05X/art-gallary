# Artkezai Commerce Features - Implementation Learning Guide

Date: 2026-03-21
Scope: Buy Now checkout, Make Offer, Message Gallery, auth error handling, API contract alignment, and painting-detail data hardening.

## Why this document exists

You asked for a full learning narrative: what we changed, how we changed it, why each decision was chosen, and what trade-offs were accepted. This file captures the complete journey from initial payment activation to current hardening.

## 1. Problem framing and implementation strategy

### Goal

Enable a production-like buyer journey:

- Buy instantly with shipping + payment intent setup.
- Negotiate with Make Offer.
- Contact gallery with context via Message Gallery.

### Initial reality (before implementation)

- Backend already had core modules (orders, payments, offers, messaging).
- Frontend UI existed for many flows, but several buttons were visual-only or wired to outdated contracts.
- DTO field names and endpoint paths differed between frontend assumptions and backend responses.

### Decision taken

Adopt a phased rollout with backend-contract alignment first, instead of building parallel frontend-only logic.

### Why this decision

- Keeps backend as source of truth.
- Reduces hidden integration debt.
- Prevents "UI says success, API fails" behavior.

## 2. Phase 1 - Buy Now checkout activation

### What was implemented

- Activated Buy Now CTA on painting detail page with a real checkout modal.
- Collected shipping details and payment method.
- Implemented order creation and conditional payment-intent creation.
- Updated buyer/admin orders pages to render backend field names.
- Made Stripe publishable key configurable in backend.

### Key files

Frontend:

- `artkezai-frontend/src/lib/api/payments.ts` (new)
- `artkezai-frontend/src/lib/hooks/useCheckout.ts` (new)
- `artkezai-frontend/src/lib/api/orders.ts`
- `artkezai-frontend/src/types/index.ts`
- `artkezai-frontend/src/app/painting/[slug]/page.tsx`
- `artkezai-frontend/src/app/dashboard/orders/page.tsx`
- `artkezai-frontend/src/app/admin/orders/page.tsx`

Backend:

- `artkezai-backend/src/main/java/com/artkezai/payment/PaymentService.java`
- `artkezai-backend/src/main/resources/application.yml`

### Why these decisions

- `createOrder -> createPaymentIntent` sequence was chosen so payment intent always references a real order ID.
- Enums were aligned to backend values to avoid status mismatches in UI badges and transitions.
- Config-driven Stripe key avoids hardcoding secrets and supports environment promotion.

## 3. Registration/auth bug debugging and fix

### Symptom

Artist/collector registration appeared broken from frontend.

### Root causes found

- Frontend parsed errors from `error`, while backend returned `message` and `errors`.
- Frontend accepted min password length 6; backend required 8.

### Fixes implemented

- Error parsing updated to read backend payload structure correctly.
- Password validation aligned to backend rules.
- Inline field-level messages added for better UX.

### Why this decision

- Fastest path to user clarity is showing server-true validation feedback.
- Matching backend constraints on client reduces avoidable round-trips.

## 4. Shared API utility + offers + messaging activation

### What was implemented

- Added shared helper for consistent API error parsing.
- Added helper to normalize Spring page payloads into frontend paging format.
- Corrected offers API endpoints and request/response field mapping.
- Corrected messaging API contracts and thread/message ID typing.
- Activated Make Offer flow from painting page.
- Activated Message Gallery flow from painting page.
- Updated dashboard/admin pages to consume real backend shapes.
- Added optional `paintingId` support in backend thread-creation flow.

### Key files

Frontend:

- `artkezai-frontend/src/lib/api/utils.ts` (new)
- `artkezai-frontend/src/lib/api/offers.ts`
- `artkezai-frontend/src/lib/api/messages.ts`
- `artkezai-frontend/src/lib/hooks/useOffers.ts`
- `artkezai-frontend/src/lib/hooks/useMessages.ts`
- `artkezai-frontend/src/types/index.ts`
- `artkezai-frontend/src/app/dashboard/offers/page.tsx`
- `artkezai-frontend/src/app/admin/offers/page.tsx`
- `artkezai-frontend/src/app/dashboard/messages/page.tsx`
- `artkezai-frontend/src/app/artist/messages/page.tsx`
- `artkezai-frontend/src/components/messaging/MessageComposer.tsx`
- `artkezai-frontend/src/app/painting/[slug]/page.tsx`
- `artkezai-frontend/src/app/contact/page.tsx`

Backend:

- `artkezai-backend/src/main/java/com/artkezai/messaging/dto/SendMessageRequest.java`
- `artkezai-backend/src/main/java/com/artkezai/messaging/MessageService.java`

### Why these decisions

- Shared error/parser utility avoids repeated parsing bugs across pages.
- Pageable normalization isolates backend pagination shape from UI consumption.
- Numeric ID alignment prevents subtle mutation failures and typing drift.
- Thread `paintingId` attachment preserves conversation context for support and sales workflows.

## 5. Current hardening - remove static painting-detail data

### Problem

Painting detail page still used a local static dataset. That made commerce actions risky because payload IDs could differ from actual backend records.

### Fix implemented now

- Replaced static lookup with backend query via `usePainting(slug)`.
- Added related paintings query via `usePaintings({ categoryId })`.
- Mapped UI fields to backend DTO (`categoryName`, `mediumName`, `primaryImage`, artist object).
- Added loading and API-error states for detail page.
- Kept existing Buy Now / Make Offer / Message Gallery handlers, now powered by real backend painting IDs.

### Key file

- `artkezai-frontend/src/app/painting/[slug]/page.tsx`

### Why this decision

- Commerce operations must reference canonical DB IDs.
- Removing static data eliminates false-positive UI success paths.
- Query-driven rendering keeps page consistent with gallery and API source of truth.

## 6. Flow maps (how the final system works)

### Buy Now flow

1. Buyer opens painting detail page (fetched by slug).
2. Buyer submits shipping + payment method.
3. Frontend calls `POST /api/orders`.
4. If `ONLINE`, frontend calls `POST /api/payments/intent` with returned order ID.
5. Buyer is redirected to dashboard orders.

### Make Offer flow

1. Buyer opens painting detail page.
2. Submits amount + optional message.
3. Frontend calls offers create endpoint with `paintingId` and `offerAmount`.
4. Buyer is redirected to offers dashboard.

### Message Gallery flow

1. User writes inquiry on painting detail page.
2. Frontend creates thread with `subject`, `body`, optional `paintingId`.
3. Backend associates thread with painting when provided.
4. User lands in messages dashboard with contextual conversation.

## 7. Decision log (short version)

- Contract-first integration over UI-only mocks: chosen for correctness.
- Centralized error parsing over per-page parsing: chosen for consistency and maintainability.
- Sequence `order` then `payment-intent`: chosen for data integrity.
- Numeric ID and enum strictness: chosen to prevent silent runtime mismatches.
- Backend-linked painting detail data: chosen to ensure commerce actions target valid records.

## 8. Verification performed

- Frontend diagnostics were checked for changed files and returned no errors.
- Lint command in this environment can enter interactive setup prompt, so editor diagnostics were used as immediate safety check.
- Backend language-server diagnostics may show noisy classpath/symbol errors depending on local tooling state; logic changes were kept minimal and targeted.

## 9. Trade-offs and known limits

- Related paintings currently use first-page category query, so the set is representative, not exhaustive.
- Stripe intent is currently integration-friendly/mocked on backend side (good for flow testing).
- Admin messages page can still be expanded for richer moderation tooling.

## 10. Recommended next steps

1. Replace remaining static gallery/home painting datasets with backend queries for full consistency.
2. Add integration tests for checkout, offer submission, and thread creation.
3. Add explicit success/failure pages for payment outcomes and webhook-confirmed states.
4. Build admin message triage UI (resolve, filter by painting, unread prioritization).

## Related docs

- `BUY_NOW_PAYMENT_INTEGRATION.md` (phase-specific detail)
