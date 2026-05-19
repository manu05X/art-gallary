-- V8: Seed demo artists and the 9 paintings shown in the frontend gallery

-- ── Demo Artist Users ─────────────────────────────────────────────────────
-- Passwords are all: Artist@123
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_email_verified)
VALUES
  ('elena@artkezai.com',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgK8Q9mJ6kV5Q5QkQ5e.5e', 'Elena',  'Morozova',  'ARTIST', TRUE, TRUE),
  ('james@artkezai.com',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgK8Q9mJ6kV5Q5QkQ5e.5e', 'James',  'Whitfield', 'ARTIST', TRUE, TRUE),
  ('priya@artkezai.com',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgK8Q9mJ6kV5Q5QkQ5e.5e', 'Priya',  'Sharma',    'ARTIST', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── Demo Artist Profiles ───────────────────────────────────────────────────
INSERT INTO artist_profiles (user_id, display_name, slug, bio, country_id, is_verified)
SELECT u.id, 'Elena Morozova', 'elena-morozova',
       'Contemporary abstract painter known for bold compositions and rich colour palettes.',
       (SELECT id FROM countries WHERE code = 'RU'), TRUE
FROM users u WHERE u.email = 'elena@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO artist_profiles (user_id, display_name, slug, bio, country_id, is_verified)
SELECT u.id, 'James Whitfield', 'james-whitfield',
       'Landscape painter inspired by the English countryside and the changing light of seasons.',
       (SELECT id FROM countries WHERE code = 'GB'), TRUE
FROM users u WHERE u.email = 'james@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO artist_profiles (user_id, display_name, slug, bio, country_id, is_verified)
SELECT u.id, 'Priya Sharma', 'priya-sharma',
       'Watercolour and mixed-media artist exploring identity, culture, and the human form.',
       (SELECT id FROM countries WHERE code = 'IN'), TRUE
FROM users u WHERE u.email = 'priya@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

-- ── 9 Demo Paintings ──────────────────────────────────────────────────────

-- 1. Amber Reverie — Elena — Oil on Canvas — Abstract
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Amber Reverie',
  'amber-reverie',
  'A warm, luminous composition where amber tones dissolve into deep burgundy, evoking the half-conscious drift between waking and dream.',
  (SELECT id FROM mediums    WHERE name = 'Oil on Canvas'),
  (SELECT id FROM categories WHERE name = 'Abstract'),
  (SELECT id FROM countries  WHERE code = 'RU'),
  1200.00, 80, 100, 'portrait', 2023, 'APPROVED', TRUE, TRUE, 42
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'elena@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/amber-reverie.jpg',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=85',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'amber-reverie'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 2. Twilight Over the Valley — James — Acrylic on Canvas — Landscape
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Twilight Over the Valley',
  'twilight-over-the-valley',
  'Purple dusk settles over rolling hills in this sweeping landscape that captures the final moments of a long summer day.',
  (SELECT id FROM mediums    WHERE name = 'Acrylic on Canvas'),
  (SELECT id FROM categories WHERE name = 'Landscape'),
  (SELECT id FROM countries  WHERE code = 'GB'),
  2400.00, 120, 80, 'landscape', 2023, 'APPROVED', TRUE, FALSE, 31
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'james@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/twilight-over-the-valley.jpg',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=85',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'twilight-over-the-valley'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 3. Silent Conversation — Priya — Watercolour — Portrait
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Silent Conversation',
  'silent-conversation',
  'Two figures caught in a wordless exchange — a study in gesture, light and the unspoken language between people.',
  (SELECT id FROM mediums    WHERE name = 'Watercolour'),
  (SELECT id FROM categories WHERE name = 'Portrait'),
  (SELECT id FROM countries  WHERE code = 'IN'),
  800.00, 50, 70, 'portrait', 2024, 'APPROVED', TRUE, FALSE, 19
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'priya@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/silent-conversation.jpg',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=85',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'silent-conversation'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 4. Golden Hour Fields — James — Oil on Canvas — Landscape
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Golden Hour Fields',
  'golden-hour-fields',
  'Wheat fields bathed in the warm amber glow of late afternoon sun stretch endlessly toward a distant treeline.',
  (SELECT id FROM mediums    WHERE name = 'Oil on Canvas'),
  (SELECT id FROM categories WHERE name = 'Landscape'),
  (SELECT id FROM countries  WHERE code = 'GB'),
  3100.00, 140, 90, 'landscape', 2024, 'APPROVED', TRUE, TRUE, 57
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'james@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/golden-hour-fields.jpg',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=85',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'golden-hour-fields'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 5. Fractured Light — Elena — Mixed Media — Abstract
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Fractured Light',
  'fractured-light',
  'Shards of colour refract across the canvas — a meditation on perception and the way we piece reality together from broken fragments.',
  (SELECT id FROM mediums    WHERE name = 'Mixed Media'),
  (SELECT id FROM categories WHERE name = 'Abstract'),
  (SELECT id FROM countries  WHERE code = 'RU'),
  1800.00, 90, 90, 'square', 2023, 'APPROVED', TRUE, FALSE, 28
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'elena@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/fractured-light.jpg',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&q=85',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'fractured-light'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 6. The Red Door — Priya — Acrylic on Canvas — Still Life
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'The Red Door',
  'the-red-door',
  'A solitary crimson door set into a crumbling plaster wall — ordinary subject, extraordinary light.',
  (SELECT id FROM mediums    WHERE name = 'Acrylic on Canvas'),
  (SELECT id FROM categories WHERE name = 'Still Life'),
  (SELECT id FROM countries  WHERE code = 'IN'),
  950.00, 60, 80, 'portrait', 2022, 'APPROVED', TRUE, FALSE, 14
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'priya@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/the-red-door.jpg',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=85',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'the-red-door'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 7. Whispers of Dawn — Elena — Oil on Canvas — Abstract
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Whispers of Dawn',
  'whispers-of-dawn',
  'Soft rose and lavender hues blend at the horizon, capturing the fragile quietness of the world before it wakes.',
  (SELECT id FROM mediums    WHERE name = 'Oil on Canvas'),
  (SELECT id FROM categories WHERE name = 'Abstract'),
  (SELECT id FROM countries  WHERE code = 'RU'),
  2200.00, 100, 80, 'landscape', 2024, 'APPROVED', TRUE, TRUE, 63
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'elena@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/whispers-of-dawn.jpg',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1200&q=85',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'whispers-of-dawn'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 8. Solitude — James — Watercolour — Landscape
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Solitude',
  'solitude',
  'A lone figure stands at the edge of a misty lake. The silence in this piece is almost audible.',
  (SELECT id FROM mediums    WHERE name = 'Watercolour'),
  (SELECT id FROM categories WHERE name = 'Landscape'),
  (SELECT id FROM countries  WHERE code = 'GB'),
  1450.00, 75, 55, 'landscape', 2023, 'APPROVED', TRUE, FALSE, 22
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'james@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/solitude.jpg',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=85',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'solitude'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);

-- 9. Urban Pulse — Priya — Mixed Media — Abstract
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count)
SELECT
  ap.id,
  'Urban Pulse',
  'urban-pulse',
  'Collaged newsprint, spray paint and oil capture the relentless energy of the city — its noise, speed, and hidden beauty.',
  (SELECT id FROM mediums    WHERE name = 'Mixed Media'),
  (SELECT id FROM categories WHERE name = 'Abstract'),
  (SELECT id FROM countries  WHERE code = 'IN'),
  3400.00, 110, 130, 'portrait', 2024, 'APPROVED', TRUE, TRUE, 81
FROM artist_profiles ap JOIN users u ON ap.user_id = u.id WHERE u.email = 'priya@artkezai.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO painting_images (painting_id, storage_key, url, thumbnail_url, is_primary, sort_order)
SELECT p.id,
  'unsplash/urban-pulse.jpg',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=85',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&q=80',
  TRUE, 0
FROM paintings p WHERE p.slug = 'urban-pulse'
AND NOT EXISTS (SELECT 1 FROM painting_images pi WHERE pi.painting_id = p.id);
