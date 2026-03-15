-- V3: Artist Profiles

CREATE TABLE artist_profiles (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name      VARCHAR(150) NOT NULL,
  slug              VARCHAR(180) NOT NULL UNIQUE,
  bio               TEXT,
  story             TEXT,
  website_url       VARCHAR(500),
  instagram         VARCHAR(200),
  country_id        BIGINT       REFERENCES countries(id),
  profile_photo_url VARCHAR(500),
  story_images      JSONB        DEFAULT '[]',
  is_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artist_profiles_user_id    ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_country_id ON artist_profiles(country_id);
CREATE INDEX idx_artist_profiles_slug       ON artist_profiles(slug);
