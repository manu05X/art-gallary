-- V1: Reference Tables (Countries, Categories, Mediums)

CREATE TABLE countries (
  id        BIGSERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  code      VARCHAR(2)   NOT NULL UNIQUE,
  is_active BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE categories (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE mediums (
  id        BIGSERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  is_active BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Seed Categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Abstract',        'abstract',        1),
  ('Landscape',       'landscape',       2),
  ('Portrait',        'portrait',        3),
  ('Still Life',      'still-life',      4),
  ('Seascape',        'seascape',        5),
  ('Figurative',      'figurative',      6),
  ('Cityscape',       'cityscape',       7),
  ('Floral',          'floral',          8),
  ('Wildlife',        'wildlife',        9),
  ('Contemporary',    'contemporary',    10);

-- Seed Mediums
INSERT INTO mediums (name, slug) VALUES
  ('Oil on Canvas',       'oil-on-canvas'),
  ('Acrylic on Canvas',   'acrylic-on-canvas'),
  ('Watercolour',         'watercolour'),
  ('Oil on Board',        'oil-on-board'),
  ('Mixed Media',         'mixed-media'),
  ('Gouache',             'gouache'),
  ('Tempera',             'tempera'),
  ('Encaustic',           'encaustic'),
  ('Oil on Paper',        'oil-on-paper'),
  ('Acrylic on Board',    'acrylic-on-board');

-- Seed Countries
INSERT INTO countries (name, code) VALUES
  ('Afghanistan', 'AF'), ('Albania', 'AL'), ('Algeria', 'DZ'),
  ('Argentina', 'AR'), ('Armenia', 'AM'), ('Australia', 'AU'),
  ('Austria', 'AT'), ('Azerbaijan', 'AZ'), ('Bangladesh', 'BD'),
  ('Belgium', 'BE'), ('Brazil', 'BR'), ('Bulgaria', 'BG'),
  ('Canada', 'CA'), ('Chile', 'CL'), ('China', 'CN'),
  ('Colombia', 'CO'), ('Croatia', 'HR'), ('Czech Republic', 'CZ'),
  ('Denmark', 'DK'), ('Egypt', 'EG'), ('Estonia', 'EE'),
  ('Ethiopia', 'ET'), ('Finland', 'FI'), ('France', 'FR'),
  ('Georgia', 'GE'), ('Germany', 'DE'), ('Ghana', 'GH'),
  ('Greece', 'GR'), ('Hungary', 'HU'), ('India', 'IN'),
  ('Indonesia', 'ID'), ('Iran', 'IR'), ('Iraq', 'IQ'),
  ('Ireland', 'IE'), ('Israel', 'IL'), ('Italy', 'IT'),
  ('Japan', 'JP'), ('Jordan', 'JO'), ('Kazakhstan', 'KZ'),
  ('Kenya', 'KE'), ('Lebanon', 'LB'), ('Lithuania', 'LT'),
  ('Malaysia', 'MY'), ('Mexico', 'MX'), ('Morocco', 'MA'),
  ('Netherlands', 'NL'), ('New Zealand', 'NZ'), ('Nigeria', 'NG'),
  ('Norway', 'NO'), ('Pakistan', 'PK'), ('Palestine', 'PS'),
  ('Peru', 'PE'), ('Philippines', 'PH'), ('Poland', 'PL'),
  ('Portugal', 'PT'), ('Romania', 'RO'), ('Russia', 'RU'),
  ('Saudi Arabia', 'SA'), ('Senegal', 'SN'), ('Serbia', 'RS'),
  ('Singapore', 'SG'), ('Slovakia', 'SK'), ('South Africa', 'ZA'),
  ('South Korea', 'KR'), ('Spain', 'ES'), ('Sri Lanka', 'LK'),
  ('Sweden', 'SE'), ('Switzerland', 'CH'), ('Syria', 'SY'),
  ('Taiwan', 'TW'), ('Thailand', 'TH'), ('Tunisia', 'TN'),
  ('Turkey', 'TR'), ('Uganda', 'UG'), ('Ukraine', 'UA'),
  ('United Arab Emirates', 'AE'), ('United Kingdom', 'GB'),
  ('United States', 'US'), ('Uruguay', 'UY'), ('Venezuela', 'VE'),
  ('Vietnam', 'VN'), ('Yemen', 'YE'), ('Zimbabwe', 'ZW');
