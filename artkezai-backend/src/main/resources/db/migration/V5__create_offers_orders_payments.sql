-- V5: Offers, Orders, Payments

-- ─── Offers ───────────────────────────────────────────────

CREATE TABLE offers (
  id             BIGSERIAL     PRIMARY KEY,
  painting_id    BIGINT        NOT NULL REFERENCES paintings(id),
  buyer_id       BIGINT        NOT NULL REFERENCES users(id),
  offer_amount   NUMERIC(12,2) NOT NULL,
  currency       VARCHAR(3)    NOT NULL DEFAULT 'USD',
  buyer_message  TEXT,
  counter_amount NUMERIC(12,2),
  admin_message  TEXT,
  status         VARCHAR(30)   NOT NULL DEFAULT 'SUBMITTED',
  expires_at     TIMESTAMPTZ,
  responded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_painting_id ON offers(painting_id);
CREATE INDEX idx_offers_buyer_id    ON offers(buyer_id);
CREATE INDEX idx_offers_status      ON offers(status);
CREATE INDEX idx_offers_created_at  ON offers(created_at DESC);

-- ─── Orders ───────────────────────────────────────────────

CREATE TABLE orders (
  id                BIGSERIAL    PRIMARY KEY,
  painting_id       BIGINT       NOT NULL REFERENCES paintings(id),
  buyer_id          BIGINT       NOT NULL REFERENCES users(id),
  offer_id          BIGINT       REFERENCES offers(id),
  total_price       NUMERIC(12,2) NOT NULL,
  currency          VARCHAR(3)   NOT NULL DEFAULT 'USD',
  status            VARCHAR(30)  NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_method    VARCHAR(20),
  -- Shipping
  shipping_name     VARCHAR(200),
  shipping_email    VARCHAR(255),
  shipping_phone    VARCHAR(50),
  shipping_address1 VARCHAR(300),
  shipping_address2 VARCHAR(300),
  shipping_city     VARCHAR(150),
  shipping_state    VARCHAR(150),
  shipping_zip      VARCHAR(30),
  shipping_country  VARCHAR(100),
  -- Tracking
  tracking_number   VARCHAR(200),
  tracking_url      VARCHAR(500),
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id    ON orders(buyer_id);
CREATE INDEX idx_orders_painting_id ON orders(painting_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at DESC);

-- ─── Payments ─────────────────────────────────────────────

CREATE TABLE payments (
  id                          BIGSERIAL      PRIMARY KEY,
  order_id                    BIGINT         NOT NULL UNIQUE REFERENCES orders(id),
  payment_method              VARCHAR(20)    NOT NULL,
  status                      VARCHAR(30)    NOT NULL DEFAULT 'INITIATED',
  stripe_payment_intent_id    VARCHAR(255),
  stripe_charge_id            VARCHAR(255),
  amount                      NUMERIC(12,2)  NOT NULL,
  currency                    VARCHAR(3)     NOT NULL DEFAULT 'USD',
  bank_instructions           TEXT,
  confirmed_by_admin_id       BIGINT         REFERENCES users(id),
  confirmed_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id              ON payments(order_id);
CREATE INDEX idx_payments_stripe_intent_id      ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status               ON payments(status);
