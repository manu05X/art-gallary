# Artkezai — Paintings Marketplace

A curated, paintings-only online marketplace. Built with Next.js 14 + Spring Boot 3 + PostgreSQL.

---

## Prerequisites (all installed ✅)

- Docker Desktop
- Java 17+
- Node.js 18+
- IntelliJ IDEA

---

## Project Structure

```
artkezai/
├── docker-compose.yml        ← All local services
├── artkezai-backend/         ← Spring Boot API (port 8080)
└── artkezai-frontend/        ← Next.js App (port 3000)
```

---

## Step 1 — Start Local Services (Docker)

Open Terminal in the `artkezai/` root folder:

```bash
docker-compose up -d
```

This starts:
| Service     | URL                          | Credentials         |
|-------------|------------------------------|---------------------|
| PostgreSQL  | localhost:5432               | artkezai_user / artkezai_pass |
| MinIO API   | http://localhost:9000        | minioadmin / minioadmin123 |
| MinIO UI    | http://localhost:9001        | minioadmin / minioadmin123 |
| MailHog UI  | http://localhost:8025        | (no login needed)   |
| Redis       | localhost:6379               | —                   |

Verify all are running:
```bash
docker-compose ps
```

---

## Step 2 — Run the Backend (Spring Boot)

### Option A: IntelliJ IDEA (Recommended)
1. Open IntelliJ → **File → Open** → select `artkezai/artkezai-backend/`
2. Wait for Maven to download dependencies (first time: ~3 minutes)
3. Open `src/main/java/com/artkezai/ArtkezaiApplication.java`
4. Click the ▶️ Run button
5. Backend starts at: **http://localhost:8080**

### Option B: Terminal
```bash
cd artkezai-backend
./mvnw spring-boot:run
```

First run: Flyway will automatically create all database tables and seed reference data.

**Verify:**
```bash
curl http://localhost:8080/api/categories
# Should return list of painting categories
```

---

## Step 3 — Run the Frontend (Next.js)

```bash
cd artkezai-frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:3000**

---

## Step 4 — Configure Stripe (for payments)

1. Create a free account at https://stripe.com
2. Go to Developers → API Keys → copy your **Test Secret Key**
3. Open `artkezai-backend/src/main/resources/application.yml`
4. Replace `sk_test_REPLACE_WITH_YOUR_TEST_KEY` with your key
5. Copy your **Publishable Key** into `artkezai-frontend/.env.local`
6. For webhooks (local testing): install Stripe CLI
   ```bash
   brew install stripe/stripe-cli/stripe
   stripe login
   stripe listen --forward-to localhost:8080/api/payments/webhook
   ```

---

## Default Admin Login

```
Email:    admin@artkezai.com
Password: Admin@123
```
⚠️ Change this password immediately after first login.

---

## Useful URLs During Development

| URL                          | Purpose                        |
|------------------------------|--------------------------------|
| http://localhost:3000        | Artkezai website               |
| http://localhost:8080/api    | Spring Boot REST API           |
| http://localhost:9001        | MinIO image storage console    |
| http://localhost:8025        | MailHog — view sent emails     |

---

## Development Flow (follow the 8-week roadmap)

**Week 1–2 (Foundation — already scaffolded):**
- [x] Docker Compose setup
- [x] Spring Boot project with all modules
- [x] Database migrations (V1–V6)
- [x] JWT auth system
- [x] Next.js with all pages scaffolded

**Week 3 (Gallery + Moderation):**
- [ ] Wire gallery filters to real database
- [ ] Test artist painting submission flow
- [ ] Test admin moderation queue

**Week 4 (Offers):**
- [ ] Test Make Offer flow end-to-end
- [ ] Test admin counter-offer
- [ ] Verify order creation on acceptance

**Week 5 (Payments):**
- [ ] Configure Stripe test keys
- [ ] Test Buy Now checkout
- [ ] Test bank transfer workflow

**Week 6 (Messaging):**
- [ ] Test message thread creation
- [ ] Verify admin inbox

**Week 7–8 (Polish):**
- [ ] Content pages
- [ ] Mobile responsiveness
- [ ] All 10 acceptance tests pass

---

## Stopping Services

```bash
# Stop Docker services
docker-compose down

# Stop but keep data
docker-compose stop
```

---

## Troubleshooting

**Port already in use:**
```bash
lsof -i :5432   # Find what's using PostgreSQL port
lsof -i :8080   # Find what's using backend port
```

**Database connection failed:**
```bash
docker-compose logs postgres   # Check PostgreSQL logs
```

**MinIO bucket not created:**
```bash
docker-compose restart minio-setup
```

**Flyway migration error:**
```bash
# Check migration status
./mvnw flyway:info
```
