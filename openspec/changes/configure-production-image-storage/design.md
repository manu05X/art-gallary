# Design: Configure production image storage

## Context

See `proposal.md` (Why) and `specs/image-storage/spec.md` (required behavior).

**Root cause.** Production has no object storage configured. `application.yml` defaults `minio.endpoint` to `http://localhost:9000`, and Render sets no `MINIO_*` variables, so the backend builds a MinIO client aimed at a server that doesn't exist inside the Render container. Every `putObject` then throws a connection exception, which `GlobalExceptionHandler`'s catch-all turns into HTTP 500. Three further defects would break uploads even once storage is configured:

1. **Region lookup.** `MinioConfig` builds the client without a region. MinIO SDK 8.5.7 then issues a `GetBucketLocation` request to discover it. Cloudflare R2 expects signatures for the region `auto`, so the client needs an explicit region.
2. **Unsafe keys.** `PaintingService.uploadImage` and `ArtistService.uploadProfilePhoto` build keys as `<prefix>/<uuid>-<originalFilename>` and interpolate them into the URL unencoded. A filename with spaces, `#`, `?` or non-ASCII characters produces a broken URL, and `../` segments end up in the key.
3. **Frontend image allow-list.** `next.config.mjs` `images.remotePatterns` doesn't include any R2 host, so `next/image` (used by 21 components) refuses to optimize the uploaded images.

There is also no content validation (the declared `Content-Type` is stored as-is into a public bucket) and no handler for `MaxUploadSizeExceededException`, so oversize files return 500.

## Goals / Non-Goals

**Goals:**
- Production uploads work against Cloudflare R2 using configuration only, with no provider-specific code.
- Local Docker MinIO behaves exactly as before.
- Every storage failure maps to HTTP 503, rejected files to 400, and oversize files to 413.

**Non-Goals:** see `proposal.md` (Non-goals). In addition: no presigned direct-to-bucket uploads from the browser, and no background cleanup of orphaned objects.

## Decisions

1. **Keep the MinIO SDK and point it at R2.** R2 is S3-compatible, and the SDK already handles MinIO and S3.
   - *Alternative: switch to the AWS SDK v2.* Rejected: a new dependency and a rewrite of working code, for no behavior gain.
   - Add `minio.region` (`MINIO_REGION`, default empty). When set, pass it to `MinioClient.builder().region(...)`; R2 uses `auto`. When empty, keep today's behavior, so local MinIO is unchanged.

2. **Why Cloudflare R2.** It has a free tier (10 GB of storage, no egress fees) and is S3-compatible.
   - Public reads go through the bucket's `r2.dev` URL at first, which Cloudflare rate-limits and labels non-production. A custom domain on Cloudflare can replace it later just by changing `MINIO_PUBLIC_URL`, with no code change.
   - *Alternatives:* AWS S3 (egress fees, IAM setup), Supabase Storage (another vendor), Cloudinary (a different API). All three would work through the same configuration if the S3-compatible option is chosen later.

3. **One shared upload helper, used by both services.** A small `ImageUploadSupport` component (in `common/storage/`):
   - detects the format from the first bytes (JPEG `FF D8 FF`; PNG `89 50 4E 47 0D 0A 1A 0A`; WebP `RIFF????WEBP`) and requires the declared content type to agree;
   - builds the key as `<prefix>/<uuid>-<slug>.<ext>`. The slug is the filename without its extension, lowercased, with runs of characters outside `[a-z0-9_-]` replaced by `-`, trimmed and capped at 60 characters, falling back to `image`. The extension comes from the detected format, never from the filename;
   - performs `putObject` with the detected content type, and wraps SDK and IO exceptions in a new `StorageUnavailableException`.

   *Alternative: validate with Apache Tika.* Rejected as a dependency for three formats.

   The existing key prefixes are kept (`paintings/{id}/`, `artists/{userId}/profile/`), so existing objects and URLs are unaffected.

4. **Error mapping in `GlobalExceptionHandler`:**
   - `StorageUnavailableException` → 503 "Image storage is temporarily unavailable. Please try again later."
   - A new `InvalidImageException` (extends `BusinessException`) → 400. Handled through the existing `BusinessException` path.
   - `MaxUploadSizeExceededException` → 413 "Image is larger than the 10 MB limit."

   Validation runs before any storage call. The database write happens only after `putObject` succeeds (as today), so a failed upload never creates a row.

5. **Tell "not configured" apart from "configured".** `MinioConfig` exposes whether an endpoint was explicitly set. It stops using the silent placeholder client:
   - When no endpoint is configured, the helper throws `StorageUnavailableException` without attempting a network call. This keeps the 503 fast.
   - Under the `prod` profile, a startup warning is logged when the endpoint is blank or points at `localhost`/`127.0.0.1`.

   There is no health indicator, so a storage outage never makes Render restart or reject a deploy.

   The `application.yml` default of `minio.endpoint` stays `http://localhost:9000`, so local development is unchanged. The production warning comes from the localhost check.

6. **Frontend allow-list.**
   - `next.config.mjs` adds `{ protocol: 'https', hostname: '*.r2.dev' }`.
   - It also adds an optional custom host from `NEXT_PUBLIC_IMAGE_HOST` (read at build time; ignored when empty).
   - No component changes.

## API contract

No request or response DTO changes. Only the status codes the upload endpoints can return are extended:

| Endpoint | Response | New status codes |
|---|---|---|
| `POST /api/paintings/{id}/images` (multipart `file`) | `PaintingImageResponse` { id, url, displayOrder, isPrimary } — unchanged | 400 non-image, 413 oversize, 503 storage unavailable |
| `POST /api/artists/me/photo` (multipart `file`) | unchanged | 400, 413, 503 |

No Flyway migration is required.

## Risks / Trade-offs

- **R2 needs a payment method on the Cloudflare account, even for the free tier.** → Documented in the setup guide. The S3 configuration path works for any provider if R2 isn't an option.
- **`r2.dev` URLs are rate-limited and not meant for production.** → Fine for current traffic. Moving to a custom domain later is a config change plus one frontend environment variable.
- **Image URLs are stored as absolute URLs in `painting_images.url`**, so changing `MINIO_PUBLIC_URL` later doesn't rewrite existing rows. → Acceptable now: production has no uploaded images yet. A later move to a custom domain needs a one-off data migration (a new Flyway migration) or URL building at read time. Noted as a follow-up.
- **Signature checks can reject unusual-but-valid images** (for example, CMYK JPEGs still start with `FF D8 FF`, so they're fine). → Only the three whitelisted signatures are checked, and all common encoders produce them.
- **Unit tests mock the `MinioClient`, so they don't prove R2 compatibility.** → A manual verification task uploads to the real R2 bucket from production.

## Migration Plan

1. Deploy the code; it is backward compatible, and until storage is configured, uploads return 503 instead of 500.
2. *(Deferred until the user sets up Cloudflare; tracked in `docs/operations/PENDING-SETUP.md`.)* Create the R2 bucket, enable public access and create the API token.
3. Set `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PUBLIC_URL` and `MINIO_REGION=auto` on Render, then redeploy the frontend so the image allow-list takes effect.
4. Verify with a real upload.

**Rollback:** remove the `MINIO_*` variables (uploads return 503) or revert the commit. No data changes.

## Open Questions

- Custom image domain (for example `images.artkezai.com`): only possible once a domain is on Cloudflare. Deferrable; it's configuration-only.
