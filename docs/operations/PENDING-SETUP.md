# Pending production setup

Manual steps that are planned but not done yet. Remove an item once it's complete.

Last checked: 2026-09-26.

| # | Item | Status | Impact until done |
|---|---|---|---|
| 1 | Re-enable the production admin | **Not done** (checked: login says "Account is inactive") | Nobody can moderate paintings, manage orders or answer messages |
| 2 | Image storage (Cloudflare R2) | Not done (deferred) | Artists can't upload images |
| 3 | Stripe (card payments) | Unknown; check the values | Card payments are rejected if the keys are placeholders |
| 4 | Database upgrade or backups | Not done | **All data is deleted on 2026-10-25** |
| 5 | Mail (Gmail) | Not done | No order, offer or password-reset emails |

## 1. Re-enable the production admin: **not done**

**Why:** the Flyway seed creates `admin@artkezai.com` with the password `Admin@123`, which is published in the README. In production, `SeedAccountGuard` replaces that password on startup with `ADMIN_INITIAL_PASSWORD`. If that variable isn't set, it deactivates the account instead, and that's what happened. The guard only acts on *active* accounts, so adding the variable afterwards isn't enough; the account must be re-enabled once by hand.

**Steps.** Do steps 2 and 3 back to back: between them, the account is active with the public password.

1. In **Render → artkezai-backend → Environment**, add `ADMIN_INITIAL_PASSWORD` = a private password of 12+ characters. It becomes the admin login. Click **Save changes** without redeploying.
2. In **Render → artkezai-db → Connect**, copy the **External Database URL**, then run:
   ```bash
   docker exec -it artkezai_postgres psql "PASTE_EXTERNAL_DATABASE_URL_HERE" \
     -c "UPDATE users SET is_active = true WHERE email = 'admin@artkezai.com';"
   ```
   It must print `UPDATE 1`.
3. In **Render → artkezai-backend**, use **Manual Deploy → Restart service**. The log must show:
   ```
   Seed account admin@artkezai.com still had its published default password; replaced with ADMIN_INITIAL_PASSWORD.
   ```
4. **Verify:** log in on the Vercel site as `admin@artkezai.com` with the new password. The old password `Admin@123` must fail.

The demo artists (`elena@`, `james@`, `priya@artkezai.com`) are deactivated the same way. That's fine unless you want demo artist logins. In that case, set `DEMO_ARTIST_PASSWORD` (12+ characters), re-enable them with the same SQL using their emails, and restart.

## 2. Image storage (Cloudflare R2): **not done**

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

## 3. Stripe (card payments): **check the values**

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` exist in Render, but they may hold the random placeholders used to get the backend started. Click the eye icon in Render:

- `sk_test_…` and `whsec_…` → real keys. Only `STRIPE_PUBLISHABLE_KEY` is still missing (step 4 below).
- A random 64-character string → a placeholder. Do all the steps.

**Steps (test mode; no real money moves):**

1. At https://dashboard.stripe.com, keep **Test mode** on.
2. **Developers → API keys:** copy the **Publishable key** (`pk_test_…`) and the **Secret key** (`sk_test_…`).
3. **Developers → Webhooks → Add endpoint:** URL `https://artkezai-backend.onrender.com/api/payments/webhook`, event `payment_intent.succeeded`. Save, then **Reveal** the signing secret (`whsec_…`).
4. In **Render → artkezai-backend → Environment**, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `STRIPE_PUBLISHABLE_KEY`. Click **Save, rebuild, and deploy**.
5. In **Vercel → artkezai-frontend → Settings → Environment Variables**, set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_…`, then redeploy.
6. **Verify:** as a buyer, click Buy Now, choose **Pay online**, and pay with card `4242 4242 4242 4242` (any future expiry date, any CVC). The order must become **PAID** and the painting **SOLD**.

For real payments later, repeat with **Live mode** keys (`sk_live_…`, `pk_live_…`) and a live webhook.

## 4. Database: **deleted on 2026-10-25 unless upgraded**

The Render free PostgreSQL database expires 30 days after creation. Either upgrade `artkezai-db` to a paid plan (about $6/month; no expiry and automatic backups), or take regular dumps as described in `backup-restore.md`. Without one of these, all production data is lost on that date.

## 5. Mail (Gmail): **not done**

1. Turn on 2-Step Verification for the Gmail account, then create an **app password** at https://myaccount.google.com/apppasswords.
2. In Render, set `MAIL_USER` (the Gmail address), `MAIL_PASS` (the 16-character app password) and `MAIL_FROM` (the same Gmail address), then **Save, rebuild, and deploy**.

Mail is not part of the health check, so a mail problem never takes the site down.

## Render environment checklist (artkezai-backend)

| Variable | Needed for | Status on 2026-09-26 |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` = `prod` | Production config | Set |
| `DB_URL`, `DB_USER`, `DB_PASS` | Database | Set |
| `JWT_SECRET` | Login tokens (app won't start without it) | Set |
| `ALLOWED_ORIGINS`, `FRONTEND_URL` | CORS, links in emails | Set |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments (app won't start without them) | Set (check the values, item 3) |
| `ADMIN_INITIAL_PASSWORD` | Admin login | **Missing** (item 1) |
| `STRIPE_PUBLISHABLE_KEY` | Card payments | Missing (item 3) |
| `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PUBLIC_URL`, `MINIO_REGION` | Image uploads | Missing (item 2) |
| `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Email | Missing (item 5) |
| `DEMO_ARTIST_PASSWORD` | Demo artist logins | Optional; not set |

## See also

- `production-environment.md`: current production services, instance sizes and upgrade options
- `backup-restore.md`: backups, restore, and startup troubleshooting
