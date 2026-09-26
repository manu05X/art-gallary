# Proposal: Configure production image storage

## Why

Image upload, a core step of the Phase 1 artist flow, does not work in production. The Render backend logs `MinIO configured at: http://localhost:9000`, because no object storage is configured there. The live gallery only shows images because the seed data links to Unsplash. Any artist who submits a painting, or uploads a profile photo, in production gets an unexplained HTTP 500.

## What Changes

- Point the backend at S3-compatible object storage in production (Cloudflare R2), using the existing `MINIO_*` settings plus a new optional `MINIO_REGION`. R2 requires the region `auto`.
- Build storage object keys from a sanitized filename, so public image URLs are always valid (no spaces, non-ASCII characters or path characters).
- Accept only image uploads (JPEG, PNG, WebP), checked by content type and file signature. The bucket is publicly readable, so HTML or SVG uploads must not be stored there.
- Fail clearly when storage is not configured: uploads return HTTP 503 with a readable message instead of a generic 500, and a production startup warning names the missing settings.
- Allow the production image host in the frontend's Next.js image allow-list (`*.r2.dev` plus an optional custom domain), so uploaded images actually render.
- Document the R2 setup (bucket, public access, API token, Render and Vercel settings) in `docs/operations/`.

## Non-goals

- No change to local development: Docker MinIO, `minio.bucket` and `minio.public-base-url` keep working as they do today.
- No change to the upload API contract (`POST /api/paintings/{id}/images`, `POST /api/artists/me/photo`, `PaintingImageResponse`) or to image upload sequencing in the frontend.
- No migration or re-upload of existing image rows. Existing production rows point at Unsplash and remain valid.
- No thumbnails, resizing or image processing. No signed or private URLs.
- No Flyway migration, and no change to reference endpoints, the painting status workflow, or the UI design.
- No storage health indicator. A storage outage must not mark the whole app DOWN on Render (the same reason mail was taken out of the health check).

## Capabilities

### New Capabilities
- `image-storage`: how painting and artist-photo images are accepted, stored and addressed — which files are accepted, how object keys and public URLs are formed, and how the API behaves when storage is unavailable or not configured.

### Modified Capabilities
- None. No specs exist yet.

## Impact

- **Backend:** `config/MinioConfig.java` (region, configured-or-not state), `painting/PaintingService.java` and `artist/ArtistService.java` (validation, key naming, storage errors), a small shared upload helper, `common/exception/GlobalExceptionHandler.java` (503 mapping), and `application.yml` (`minio.region`).
- **Frontend:** `next.config.mjs` (remote image hosts).
- **Config:** `render.yaml` and `.env.example` gain `MINIO_REGION`, and the frontend gains an optional image-host variable.
- **Docs:** a new `docs/operations/image-storage.md`.
- **External (manual, deferred):** a Cloudflare account with R2 enabled (Cloudflare requires a payment method on file even for the free tier), one bucket, and an API token. The user will do this later; it is tracked in `docs/operations/PENDING-SETUP.md`. The code ships first, and until storage is configured, production uploads return 503 instead of 500.
