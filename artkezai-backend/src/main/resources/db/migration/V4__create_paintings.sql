-- V4: Paintings and Images


CREATE TABLE paintings (
  id               BIGSERIAL       PRIMARY KEY,
  artist_id        BIGINT          NOT NULL REFERENCES artist_profiles(id),
  title            VARCHAR(300)    NOT NULL,
  slug             VARCHAR(350)    NOT NULL UNIQUE,
  description      TEXT,
  medium_id        BIGINT          REFERENCES mediums(id),
  category_id      BIGINT          REFERENCES categories(id),
  country_id       BIGINT          REFERENCES countries(id),
  price            NUMERIC(12,2)   NOT NULL,
  currency         VARCHAR(3)      NOT NULL DEFAULT 'USD',
  width_cm         INTEGER,
  height_cm        INTEGER,
  orientation      VARCHAR(20),
  year_created     INTEGER,
  status           VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
  rejection_reason TEXT,
  admin_notes      TEXT,
  is_offer_enabled BOOLEAN         NOT NULL DEFAULT TRUE,
  is_featured      BOOLEAN         NOT NULL DEFAULT FALSE,
  view_count       INT             NOT NULL DEFAULT 0,
  search_vector    TSVECTOR,
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paintings_artist_id   ON paintings(artist_id);
CREATE INDEX idx_paintings_status      ON paintings(status);
CREATE INDEX idx_paintings_medium_id   ON paintings(medium_id);
CREATE INDEX idx_paintings_category_id ON paintings(category_id);
CREATE INDEX idx_paintings_country_id  ON paintings(country_id);
CREATE INDEX idx_paintings_price       ON paintings(price);
CREATE INDEX idx_paintings_search      ON paintings USING GIN(search_vector);
CREATE INDEX idx_paintings_created_at  ON paintings(created_at DESC);
CREATE INDEX idx_paintings_is_featured ON paintings(is_featured) WHERE is_featured = TRUE;

-- Full-text search trigger
CREATE OR REPLACE FUNCTION paintings_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trig_paintings_search
  BEFORE INSERT OR UPDATE ON paintings
  FOR EACH ROW EXECUTE FUNCTION paintings_search_trigger();

-- Painting Images
CREATE TABLE painting_images (
  id                BIGSERIAL    PRIMARY KEY,
  painting_id       BIGINT       NOT NULL REFERENCES paintings(id) ON DELETE CASCADE,
  storage_key       VARCHAR(500) NOT NULL,
  url               VARCHAR(1000) NOT NULL,
  thumbnail_url     VARCHAR(1000),
  width_px          INT,
  height_px         INT,
  file_size_bytes   BIGINT,
  mime_type         VARCHAR(50),
  is_primary        BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order        INT          NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_painting_images_painting_id ON painting_images(painting_id);
CREATE INDEX idx_painting_images_is_primary  ON painting_images(painting_id, is_primary);
