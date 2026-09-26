# Tasks

## 1. Storage configuration

- [ ] 1.1 Add `minio.region: ${MINIO_REGION:}` to `application.yml`. In `MinioConfig`, pass the region to the client when it is non-blank, expose whether an endpoint is explicitly configured, and log a warning under the `prod` profile when the endpoint is blank or `localhost`/`127.0.0.1`. Verify that the local backend still starts against Docker MinIO and that an upload through `POST /api/paintings/{id}/images` still returns 201 with a `http://localhost:9000/artkezai-paintings/...` URL.
- [ ] 1.2 Add `MINIO_REGION` to `render.yaml` and `artkezai-backend/.env.example`, with a comment saying R2 uses `auto`. Verify with `git diff` that no other environment variables changed.

## 2. Shared upload handling

- [ ] 2.1 Create `common/storage/InvalidImageException` (extends `BusinessException`) and `StorageUnavailableException`. Map `StorageUnavailableException` to 503 and `MaxUploadSizeExceededException` to 413 in `GlobalExceptionHandler`, with the messages from the design. Verify with a `GlobalExceptionHandler` unit test covering each mapping.
- [ ] 2.2 Create `common/storage/ImageUploadSupport`: signature-based detection of JPEG, PNG and WebP that must agree with the declared content type; key building as `<prefix>/<uuid>-<slug>.<ext>`; `putObject` with the detected content type; SDK and IO errors wrapped in `StorageUnavailableException`; a fast failure when storage isn't configured. Verify with `ImageUploadSupportTest` covering: valid JPEG, PNG and WebP; HTML declared as PNG rejected; SVG rejected; a content type that disagrees with the signature rejected; the filename `Mona Lisa (copy) é.JPG` producing a key that matches `^[a-z0-9/_.-]+$` and ends in `.jpg`; `../../etc/passwd.png` producing no `..` segment; a MinIO exception becoming `StorageUnavailableException`; an unconfigured endpoint throwing without any client call.
- [ ] 2.3 Switch `PaintingService.uploadImage` and `ArtistService.uploadProfilePhoto` to the helper, keeping the key prefixes, the ownership and status checks, and the response DTOs. Verify with `mvn test`: existing `PaintingServiceTest` still passes, plus new tests showing that a storage failure creates no `PaintingImage` row and no profile-photo update, and that a rejected file makes no storage call.

## 3. Frontend

- [ ] 3.1 In `next.config.mjs`, add `*.r2.dev` and an optional `NEXT_PUBLIC_IMAGE_HOST` host to `images.remotePatterns`, and document the variable in `artkezai-frontend/.env.example`. Verify that `npm run build` passes, both with and without `NEXT_PUBLIC_IMAGE_HOST` set.

## 4. Local verification

- [ ] 4.1 Rebuild and restart the local backend (with `-Dapp.reservation.hold-hours=876000`). Over HTTP, verify:
  - a JPEG upload returns 201 and its URL returns 200;
  - an HTML file declared as PNG returns 400 and the bucket object count doesn't change;
  - an 11 MB file returns 413;
  - with MinIO stopped (`docker stop artkezai_minio`), an upload returns 503 while `/actuator/health` stays 200; then restart MinIO.

  Record the results in this change's folder as `verification.md`.
- [ ] 4.2 Browser check: submit a painting with 2 images through `/artist/submit` and confirm both images render on the painting detail page. Record the result in `verification.md`.

## 5. Documentation

- [ ] 5.1 Write `docs/operations/image-storage.md`:
  - enabling R2 and creating the bucket;
  - turning on public access (`r2.dev`) and copying the public URL;
  - creating an R2 API token with Object Read & Write on this bucket only;
  - the exact Render variables (`MINIO_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PUBLIC_URL`, `MINIO_REGION=auto`);
  - redeploying the Vercel frontend;
  - moving to a custom domain later, and the absolute-URL caveat.

  Link it from `docs/operations/backup-restore.md` and from `docs/operations/PENDING-SETUP.md`. Verify that each variable name in the document matches `application.yml`.

## 6. Production rollout

Task 6.1 can ship now. Tasks 6.2 and 6.3 are **deferred until the user sets up a Cloudflare account with R2**; the steps are tracked in `docs/operations/PENDING-SETUP.md`. Until then, production uploads return 503 "image storage is unavailable".

- [ ] 6.1 Merge and deploy the code. Verify that production `/actuator/health` returns 200, and that an upload without storage configured now returns 503 instead of 500.
- [ ] 6.2 (Deferred: needs a Cloudflare account.) The user creates the R2 bucket and token, then sets the Render variables following `docs/operations/image-storage.md`. Verify that the Render startup log no longer shows the storage warning.
- [ ] 6.3 (Deferred: needs a Cloudflare account.) End-to-end check in production: upload an image to a draft painting and confirm the returned URL loads publicly and renders on the Vercel site. Record the result in `verification.md`.
