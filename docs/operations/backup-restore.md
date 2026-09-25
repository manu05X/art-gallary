# Backup and restore

Artkezai keeps state in two places. Both must be backed up together, because image rows in the database point at objects in storage.

| Data | Where | What's in it |
|---|---|---|
| PostgreSQL `artkezai` database | Docker `artkezai_postgres` locally; Render PostgreSQL in production | Users, paintings, offers, orders, payments, messages, audit log, content pages |
| Object storage bucket (`MINIO_BUCKET`, default `artkezai-paintings`) | Docker `artkezai_minio` locally; the S3-compatible service behind `MINIO_ENDPOINT` in production | Painting images and artist photos |

Redis holds only rate-limit counters and needs no backup. Secrets (`JWT_SECRET`, Stripe keys, database and storage credentials) are not in either store. Keep them in the hosting provider's environment settings and a password manager.

## Production

### Database

Render PostgreSQL takes automatic daily backups on paid plans. Point-in-time recovery depends on the plan, and the free plan has no backups. Take your own logical dump as well, so you have a copy you control:

```bash
# External connection string from the Render dashboard (Database → Connect)
export DATABASE_URL='postgresql://artkezai_user:…@….render.com/artkezai'

pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges \
  --file="artkezai-$(date +%Y%m%d-%H%M).dump"
```

Use a `pg_dump` whose major version is the same as the server's or newer (PostgreSQL 15). Store dumps off the host, for example in a separate private bucket with versioning turned on. Keep at least 7 daily and 4 weekly copies.

### Images

Mirror the bucket with the MinIO client (`mc`). This works against MinIO, S3 and R2:

```bash
mc alias set prod "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"
mc alias set backup https://<backup-endpoint> <key> <secret>

# Copies new and changed objects. Deleted images stay in the backup.
mc mirror --overwrite prod/artkezai-paintings backup/artkezai-paintings-backup
```

Take the image mirror *after* the database dump. Every image the dump refers to is then present in the mirror.

### Schedule

Run both steps daily, for example from a GitHub Actions scheduled workflow or a Render cron job, using credentials that can only read production and write to the backup location.

## Restore

1. **Stop writes.** Scale the backend to zero, or put the site in maintenance mode, so nothing changes during the restore.
2. **Restore the database** into an empty database:
   ```bash
   createdb "$TARGET_DATABASE_URL"   # or create it in the Render dashboard
   pg_restore --no-owner --no-privileges --dbname="$TARGET_DATABASE_URL" artkezai-YYYYMMDD-HHMM.dump
   ```
   Flyway history (`flyway_schema_history`) is part of the dump. On the next start the backend applies only migrations newer than the backup.
3. **Restore images**:
   ```bash
   mc mirror --overwrite backup/artkezai-paintings-backup prod/artkezai-paintings
   ```
4. **Point the backend at the restored database.** On Render, link it through `render.yaml`, where `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASS` come `fromDatabase`, and make sure no manual `DB_URL` is set. Then start the backend and check `GET /actuator/health`.
5. **Verify**: sign in as an admin, open the gallery and a painting detail page (images load), and open `/admin/orders`.

## Local development

The Docker volumes (`pgdata`, `miniodata`) hold local data. Don't delete them, and don't run `docker compose down -v`, unless you mean to lose that data.

```bash
# Database
docker exec artkezai_postgres pg_dump -U artkezai_user -d artkezai --format=custom > artkezai-local.dump
docker exec -i artkezai_postgres pg_restore -U artkezai_user -d artkezai --clean --if-exists < artkezai-local.dump

# Images (uses the mc client inside the MinIO container's network)
docker run --rm -e MINIO_ROOT_PASSWORD --network container:artkezai_minio -v "$PWD/minio-backup:/backup" minio/mc \
  sh -c 'mc alias set local http://localhost:9000 minioadmin "$MINIO_ROOT_PASSWORD" && mc mirror local/artkezai-paintings /backup'
```

Set `MINIO_ROOT_PASSWORD` to the value in `docker-compose.yml` before running the image backup.

## Restore drill

Restore the latest production backup into a scratch database and bucket once a month, then run the verification step above. A backup that has never been restored is not proven to work.

## Troubleshooting: backend exits with `UnknownHostException: dpg-…`

The backend cannot resolve its database host, so Flyway fails and the app exits with status 1. `dpg-…-a` is a Render internal database hostname. Usual causes:

- **The database was deleted.** Render free PostgreSQL databases expire 30 days after creation. Check **Render → Databases**. If it is gone, create a new one with the same name (`artkezai-db`) in the **same region** as the web service, sync the blueprint, and restore the latest dump (see *Restore*).
- **Region mismatch.** Internal hostnames resolve only within one region. Recreate the database in the web service's region.
- **A stale manual `DB_URL`.** An explicit `DB_URL` in the dashboard overrides the linked `DB_HOST`/`DB_PORT`/`DB_NAME`. Delete it.
