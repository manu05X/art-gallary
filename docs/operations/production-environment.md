# Production environment

The current production deployment: what it runs on and its limits. Last updated 2026-09-26.

## Services

| Service | Host | Plan | Region | URL |
|---|---|---|---|---|
| Backend (`artkezai-backend`, Docker) | Render | Free | Singapore | https://artkezai-backend.onrender.com |
| Database (`artkezai-db`, PostgreSQL 18) | Render | Free | Singapore | internal only |
| Frontend (Next.js) | Vercel | — | — | https://artkezai-frontend.vercel.app |
| Image storage | Not configured yet | — | — | see `PENDING-SETUP.md` |

The backend deploys automatically on every commit to `main` and runs with `SPRING_PROFILES_ACTIVE=prod`.

## Backend instance size (Render Free)

| Resource | Limit | Measured / notes |
|---|---|---|
| Memory (RAM) | 512 MB | About 307 MB after startup with the tuned JVM flags in `artkezai-backend/Dockerfile` (heap capped at 50% = 256 MB) |
| CPU | 0.1 vCPU | Startup takes about 1–4 minutes |
| Disk | Temporary only | Files written by the app are lost on every restart or deploy, so images must go to object storage |
| Instances | 1 | No redundancy: if the instance goes down, the site is down until Render replaces it |
| Sleep | After 15 minutes without traffic | The first request after sleeping waits for a cold start of 50+ seconds |
| Health check | `/actuator/health` | Includes the database; mail is deliberately excluded |

**App artifact:** the backend jar is about 84 MB, running on the `eclipse-temurin:17-jre-alpine` image as the non-root user `app`.

## Database size (Render Free PostgreSQL)

| Item | Value |
|---|---|
| Version | PostgreSQL 18 |
| Storage | About 1 GB |
| Region | Singapore (must match the backend: internal hostnames only resolve within one region) |
| Expiry | **Deleted on 2026-10-25** unless upgraded to a paid plan |
| Backups | None on the free plan; see `backup-restore.md` |

## When to upgrade

| Upgrade | Approx. cost | Gain | When |
|---|---|---|---|
| Database → paid plan | ~$6/month | No expiry; automatic backups | **Before 2026-10-25** |
| Backend → Starter | ~$7/month | Same 512 MB RAM, 0.5 CPU, never sleeps (no cold starts) | Once real users arrive |
| Backend → 2+ instances | Per instance | Stays up during instance failures | Needs a paid plan and a shared (Redis) rate limiter first |

Prices are approximate; check https://render.com/pricing before upgrading.

## Related

- `PENDING-SETUP.md`: manual setup still to do (R2 image storage, Stripe, mail, database)
- `backup-restore.md`: backups, restore, and troubleshooting startup failures
