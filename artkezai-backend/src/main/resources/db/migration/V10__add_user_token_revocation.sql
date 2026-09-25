-- V10: server-side logout / session revocation.
-- JWTs issued before this instant are rejected for the user (set on logout
-- and on password reset). NULL means no revocation has happened.
ALTER TABLE users ADD COLUMN tokens_valid_after TIMESTAMPTZ;
