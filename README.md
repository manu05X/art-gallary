# Artkezai — Paintings Marketplace

A curated, paintings-only online marketplace connecting independent artists with collectors worldwide.

## Live Demo

| Layer | URL |
|---|---|
| Frontend | https://artkezai-frontend.vercel.app |
| Backend API | https://artkezai-backend.onrender.com/api |
| Health Check | https://artkezai-backend.onrender.com/actuator/health |

**Demo credentials:**
```
Admin:   admin@artkezai.com  / Admin@123
Artist:  elena@artkezai.com  / Artist@123
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Query |
| Backend | Spring Boot 3.2, Java 17, Spring Security 6, JWT |
| Database | PostgreSQL (Render free tier) + Flyway migrations |
| Storage | MinIO (local) / disabled on free tier |
| Payments | Stripe (test mode) |
| Email | MailHog (local) / Gmail SMTP (prod) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Project Structure

```
artkezai/
├── docker-compose.yml        ← All local services (Postgres, MinIO, MailHog, Redis)
├── render.yaml               ← Render deployment blueprint
├── artkezai-backend/         ← Spring Boot API (port 8080)
│   ├── Dockerfile
│   └── src/main/resources/db/migration/   ← Flyway migrations V1–V8
└── artkezai-frontend/        ← Next.js App (port 3000)
    └── vercel.json
```

---

## Local Development

### Prerequisites
- Docker Desktop
- Java 17+
- Node.js 18+

### Step 1 — Start local services

```bash
docker-compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| PostgreSQL | localhost:5432 | artkezai_user / artkezai_pass |
| MinIO API | http://localhost:9000 | minioadmin / minioadmin123 |
| MinIO UI | http://localhost:9001 | minioadmin / minioadmin123 |
| MailHog UI | http://localhost:8025 | (no login) |

### Step 2 — Run the backend

```bash
cd artkezai-backend
mvn spring-boot:run
# Starts at http://localhost:8080
```

Flyway runs automatically and creates all tables + seeds demo data on first start.

### Step 3 — Run the frontend

```bash
cd artkezai-frontend
npm install
npm run dev
# Starts at http://localhost:3000
```

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@artkezai.com | Admin@123 |
| Artist | elena@artkezai.com | Artist@123 |
| Artist | james@artkezai.com | Artist@123 |
| Artist | priya@artkezai.com | Artist@123 |

---

## API Endpoints (sample)

```
GET  /api/paintings              List all approved paintings
GET  /api/paintings/slug/:slug   Painting detail
GET  /api/artists                List all artists
POST /api/auth/login             Login
POST /api/auth/register          Register
POST /api/auth/forgot-password   Request password reset
POST /api/auth/reset-password    Reset password with token
```

---

## Deployment

**Backend → Render**
- Docker web service (free tier)
- PostgreSQL free tier database
- Auto-deploys on push to `main`

**Frontend → Vercel**
- Next.js auto-detected
- Set `NEXT_PUBLIC_API_URL=https://artkezai-backend.onrender.com/api`
- Auto-deploys on push to `main`

### Required Render environment variables

| Key | Value |
|---|---|
| DB_URL | jdbc:postgresql://\<host\>/artkezai_db |
| DB_USER | (from Render DB) |
| DB_PASS | (from Render DB) |
| JWT_SECRET | (auto-generated) |
| ALLOWED_ORIGINS | https://artkezai-frontend.vercel.app |
| FRONTEND_URL | https://artkezai-frontend.vercel.app |
| SPRING_PROFILES_ACTIVE | prod |

---

## Troubleshooting

**Port already in use:**
```bash
lsof -i :8080
lsof -i :3000
```

**Flyway migration error:**
```bash
mvn flyway:info
```

**Database connection failed:**
```bash
docker-compose logs postgres
```
