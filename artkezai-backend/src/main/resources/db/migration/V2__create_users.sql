-- V2: Users Table

CREATE TABLE users (
  id                  BIGSERIAL PRIMARY KEY,
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  phone               VARCHAR(30),
  role                VARCHAR(20)  NOT NULL DEFAULT 'BUYER',
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  is_email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
  email_verify_token  VARCHAR(255),
  reset_token         VARCHAR(255),
  reset_token_expiry  TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- Default admin user (password: Admin@123 — CHANGE IN PRODUCTION)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_email_verified)
VALUES (
  'admin@artkezai.com',
  '$2b$12$9qUrrljQoawd2D2lZdqhQuvwGPflIqrEpncGs1Do8nm4T8BZcpbaG',
  'Artkezai',
  'Admin',
  'ADMIN',
  TRUE,
  TRUE
);
