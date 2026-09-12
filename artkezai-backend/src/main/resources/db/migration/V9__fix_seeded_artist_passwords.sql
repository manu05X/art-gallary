-- V9: Fix passwords for the seeded demo artist accounts
UPDATE users
SET password_hash = '$2a$12$OvulPyatnKd9JWJlGUFZp.DIu48/fqRlgmYdjbioLfFr4i5ok5AjC'
WHERE email IN (
  'elena@artkezai.com',
  'james@artkezai.com',
  'priya@artkezai.com'
);