# Buy Now Checkout + Payment Intent Integration (Artkezai)

This document explains what was implemented for Phase 1 (`Buy Now checkout`) and how the frontend and backend talk to each other.

## What is now active

- `Buy Now` button on painting detail page opens a real checkout modal.
- Buyer can enter shipping details and choose payment method (`ONLINE` or `BANK_TRANSFER`).
- Frontend now creates an order by calling backend `/api/orders`.
- If payment method is `ONLINE`, frontend automatically requests payment intent from `/api/payments/intent`.
- After successful order creation, user is redirected to buyer orders page.

## End-to-end flow

1. User opens painting page and clicks `Buy Now`.
2. Frontend checks authentication and role.
   - Not logged in -> redirect to `/auth/login`.
   - Logged in but not buyer -> show error toast.
3. User submits checkout form.
4. Frontend calls `POST /api/orders` with shipping + payment method.
5. Backend creates:
   - `Order` with `PENDING_PAYMENT`
   - `Payment` record with `INITIATED`
6. If `paymentMethod = ONLINE`, frontend calls `POST /api/payments/intent` with `orderId`.
7. Backend returns:
   - `clientSecret`
   - `publishableKey`
8. Frontend shows success and navigates to `/dashboard/orders`.

## Files changed

### Frontend

- `src/types/index.ts`
  - Aligned `OrderStatus`, `PaymentStatus`, and `PaymentMethod` enums with backend values.
  - Updated `OrderDto` shape to match backend `OrderDto`.
  - Updated `CreateOrderRequest` fields for shipping details.
  - Added `CreatePaymentIntentRequest` and `PaymentIntentResponse`.

- `src/lib/api/orders.ts`
  - Fixed API paths:
    - `GET /orders/my` instead of old `my-orders` path
    - `GET /orders` for admin list
    - `PATCH /orders/{id}/shipping`
  - Added Spring `Page` -> frontend `PagedResponse` normalization.

- `src/lib/api/payments.ts` (new)
  - Added `createPaymentIntent()` client for `/payments/intent`.

- `src/lib/hooks/useCheckout.ts` (new)
  - Added reusable `useBuyNowCheckout()` mutation.
  - Handles sequence: `createOrder -> createPaymentIntent (only for ONLINE)`.

- `src/app/painting/[slug]/page.tsx`
  - Activated `Buy Now` button.
  - Added checkout modal with full shipping form.
  - Added payment method selector.
  - Integrated role/auth checks and submit logic.

- `src/app/dashboard/orders/page.tsx`
  - Updated to use backend order fields (`paintingTitle`, `paintingThumbnailUrl`, `status`).
  - Updated badge mappings for current payment/order statuses.

- `src/app/admin/orders/page.tsx`
  - Updated to use backend order field names and payload shape.

### Backend

- `src/main/java/com/artkezai/payment/PaymentService.java`
  - Replaced hardcoded publishable key with configurable value.

- `src/main/resources/application.yml`
  - Added `stripe.publishable-key` property:
    - `STRIPE_PUBLISHABLE_KEY`

## API contracts used

### Create Order

`POST /api/orders`

Request body:

```json
{
  "paintingId": 1,
  "paymentMethod": "ONLINE",
  "shippingName": "Manish Kumar",
  "shippingEmail": "manish.kumar@gmail.com",
  "shippingPhone": "",
  "shippingAddress1": "Street 1",
  "shippingAddress2": "",
  "shippingCity": "Bengaluru",
  "shippingState": "Karnataka",
  "shippingZip": "560001",
  "shippingCountry": "India"
}
```

### Create Payment Intent

`POST /api/payments/intent`

Request body:

```json
{
  "orderId": 123
}
```

Response `data`:

```json
{
  "clientSecret": "pi_...",
  "publishableKey": "pk_test_..."
}
```

## Environment variables

Set these for backend:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Notes and next steps

- Current online payment intent is mocked in backend (`clientSecret` simulation). This is good for integration testing.
- Next phase can plug real Stripe SDK and confirm payment webhook handling.
- After that, we can move to:
  1. Make Offer activation
  2. Message Gallery activation
  3. Order success/failure pages
