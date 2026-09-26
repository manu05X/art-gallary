# Pending production setup

Manual steps that are planned but not done yet. Remove an item once it's complete.

## 1. Image storage (Cloudflare R2): **not done**

**Why it matters:** until this is done, image uploads in production (painting images, artist profile photos) don't work. With the `configure-production-image-storage` change deployed, they return HTTP 503 "Image storage is temporarily unavailable". Before that change, they return a generic HTTP 500. The gallery still shows the seeded paintings, because those images are hosted on Unsplash.

**Planned in:** `openspec/changes/configure-production-image-storage/` (tasks 6.2 and 6.3 are waiting on this).

**Steps.** The full guide will be in `docs/operations/image-storage.md` once that change is applied.

1. Create a Cloudflare account and enable **R2**. Cloudflare asks for a payment method even for the free tier (10 GB of storage, no egress fees).
2. **R2 → Create bucket**, named for example `artkezai-paintings`.
3. Open the bucket, go to **Settings → Public access**, and enable the **r2.dev subdomain**. Copy the public URL (`https://pub-<id>.r2.dev`).
4. **R2 → Manage API tokens → Create API token**, with the permission **Object Read & Write**, scoped to this bucket only. Copy the **Access Key ID**, the **Secret Access Key** and the **S3 endpoint** (`https://<account-id>.r2.cloudflarestorage.com`).
5. In Render, open **artkezai-backend → Environment** and set:

   | Key | Value |
   |---|---|
   | `MINIO_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
   | `MINIO_ACCESS_KEY` | the Access Key ID |
   | `MINIO_SECRET_KEY` | the Secret Access Key |
   | `MINIO_BUCKET` | `artkezai-paintings` |
   | `MINIO_PUBLIC_URL` | `https://pub-<id>.r2.dev` (no trailing slash) |
   | `MINIO_REGION` | `auto` |

   Then click **Save, rebuild, and deploy**.
6. Redeploy the frontend on Vercel, so it picks up the `*.r2.dev` image host.
7. **Verify:** upload an image to a draft painting in production, open the returned URL, and check that it renders on the Vercel site.

## 2. Other known pending items

| Item | Deadline or impact | Where |
|---|---|---|
| Upgrade or back up the Render PostgreSQL database | The free database is **deleted on 2026-10-25** | `docs/operations/backup-restore.md` |
| Real Stripe test keys and webhook (`/api/payments/webhook`, event `payment_intent.succeeded`) | Card payments are rejected while placeholders are set | Render → Environment |
| Mail credentials: `MAIL_USER`, `MAIL_PASS` (a Gmail app password), `MAIL_FROM` | Order, offer and password-reset emails aren't sent | Render → Environment |

## See also

- `production-environment.md`: current production services, instance sizes and upgrade options
