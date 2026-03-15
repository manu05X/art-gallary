-- V6: Messaging, Content Pages, Admin Audit Logs

-- ─── Message Threads ──────────────────────────────────────
CREATE TABLE message_threads (
  id              BIGSERIAL   PRIMARY KEY,
  user_id         BIGINT      NOT NULL REFERENCES users(id),
  admin_id        BIGINT      REFERENCES users(id),
  subject         VARCHAR(500),
  painting_id     BIGINT      REFERENCES paintings(id),
  is_resolved     BOOLEAN     NOT NULL DEFAULT FALSE,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threads_user_id       ON message_threads(user_id);
CREATE INDEX idx_threads_admin_id      ON message_threads(admin_id);
CREATE INDEX idx_threads_last_msg      ON message_threads(last_message_at DESC);

-- ─── Messages ─────────────────────────────────────────────
CREATE TABLE messages (
  id          BIGSERIAL   PRIMARY KEY,
  thread_id   BIGINT      NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id   BIGINT      NOT NULL REFERENCES users(id),
  body        TEXT        NOT NULL,
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created   ON messages(created_at ASC);

-- ─── Content Pages ────────────────────────────────────────
CREATE TABLE content_pages (
  id           BIGSERIAL    PRIMARY KEY,
  slug         VARCHAR(200) NOT NULL UNIQUE,
  title        VARCHAR(300) NOT NULL,
  body         TEXT,
  is_published BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_by_id BIGINT      REFERENCES users(id),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed content pages
INSERT INTO content_pages (slug, title, body, is_published) VALUES
  ('about',           'About Artkezai',            '<p>Artkezai is a curated paintings-only marketplace...</p>', TRUE),
  ('why-artkezai',    'Why Artkezai',               '<p>We believe every painting deserves to find its home...</p>', TRUE),
  ('how-it-works',    'How It Works',               '<p>Browse, offer or buy, and have it shipped to you...</p>', TRUE),
  ('shipping-policy', 'Shipping Policy',            '<p>All shipping is arranged by our team after payment...</p>', TRUE),
  ('returns-policy',  'Returns Policy',             '<p>We accept returns within 14 days if the painting arrives damaged...</p>', TRUE),
  ('authenticity',    'Authenticity Certificate',   '<p>Every painting sold through Artkezai includes a signed Certificate of Authenticity...</p>', TRUE),
  ('terms',           'Terms & Conditions',         '<p>By using Artkezai you agree to these terms...</p>', TRUE),
  ('privacy',         'Privacy Policy',             '<p>We take your privacy seriously...</p>', TRUE);

-- ─── Admin Audit Logs ─────────────────────────────────────
CREATE TABLE admin_audit_logs (
  id          BIGSERIAL    PRIMARY KEY,
  admin_id    BIGINT       NOT NULL REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   BIGINT,
  details     TEXT,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_entity   ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created  ON admin_audit_logs(created_at DESC);
