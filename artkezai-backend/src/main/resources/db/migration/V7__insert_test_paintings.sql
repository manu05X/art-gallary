-- V7: Insert test paintings with slugs for development and testing

-- Note: This script assumes test artist profiles and reference data exist
-- Adjust artist_id, medium_id, category_id, and country_id as needed for your environment

-- Insert test paintings with proper slugs
INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, currency, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count, created_at, updated_at)
SELECT 
  ap.id as artist_id,
  'Abstract Blue Symphony' as title,
  'abstract-blue-symphony' as slug,
  'A stunning abstract painting featuring shades of blue with dynamic brushstrokes' as description,
  m.id as medium_id,
  c.id as category_id,
  ct.id as country_id,
  1500.00 as price,
  'USD' as currency,
  60 as width_cm,
  80 as height_cm,
  'portrait' as orientation,
  2023 as year_created,
  'APPROVED' as status,
  true as is_offer_enabled,
  true as is_featured,
  42 as view_count,
  NOW() as created_at,
  NOW() as updated_at
FROM artist_profiles ap, mediums m, categories c, countries ct
WHERE ap.id = (SELECT MIN(id) FROM artist_profiles LIMIT 1)
  AND m.name = 'Oil' 
  AND c.name = 'Abstract'
  AND ct.code = 'US'
  AND NOT EXISTS (
    SELECT 1 FROM paintings p WHERE p.slug = 'abstract-blue-symphony'
  )
LIMIT 1;

INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, currency, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count, created_at, updated_at)
SELECT 
  ap.id as artist_id,
  'Sunset Over Mountains' as title,
  'sunset-over-mountains' as slug,
  'A breathtaking landscape painting capturing the golden hour over majestic mountains' as description,
  m.id as medium_id,
  c.id as category_id,
  ct.id as country_id,
  2000.00 as price,
  'USD' as currency,
  100 as width_cm,
  70 as height_cm,
  'landscape' as orientation,
  2024 as year_created,
  'APPROVED' as status,
  true as is_offer_enabled,
  false as is_featured,
  18 as view_count,
  NOW() as created_at,
  NOW() as updated_at
FROM artist_profiles ap, mediums m, categories c, countries ct
WHERE ap.id = (SELECT MIN(id) FROM artist_profiles LIMIT 1)
  AND m.name = 'Acrylic'
  AND c.name = 'Landscape'
  AND ct.code = 'US'
  AND NOT EXISTS (
    SELECT 1 FROM paintings p WHERE p.slug = 'sunset-over-mountains'
  )
LIMIT 1;

INSERT INTO paintings (artist_id, title, slug, description, medium_id, category_id, country_id, price, currency, width_cm, height_cm, orientation, year_created, status, is_offer_enabled, is_featured, view_count, created_at, updated_at)
SELECT 
  ap.id as artist_id,
  'Portrait in Sepia Tones' as title,
  'portrait-in-sepia-tones' as slug,
  'An elegant portrait rendered in rich sepia tones with exceptional detail and emotion' as description,
  m.id as medium_id,
  c.id as category_id,
  ct.id as country_id,
  1800.00 as price,
  'USD' as currency,
  50 as width_cm,
  60 as height_cm,
  'portrait' as orientation,
  2023 as year_created,
  'APPROVED' as status,
  true as is_offer_enabled,
  false as is_featured,
  27 as view_count,
  NOW() as created_at,
  NOW() as updated_at
FROM artist_profiles ap, mediums m, categories c, countries ct
WHERE ap.id = (SELECT MIN(id) FROM artist_profiles LIMIT 1)
  AND m.name = 'Watercolor'
  AND c.name = 'Portrait'
  AND ct.code = 'US'
  AND NOT EXISTS (
    SELECT 1 FROM paintings p WHERE p.slug = 'portrait-in-sepia-tones'
  )
LIMIT 1;
