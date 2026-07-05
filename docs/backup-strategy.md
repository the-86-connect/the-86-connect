# Backup Strategy — 86 Connect

## Overview

This document outlines the backup approach for the 86 Connect platform, covering the PostgreSQL database (on Render) and Cloudinary/R2 file storage.

---

## 1. Database (PostgreSQL on Render)

### Automated Backups (Built-in)
- **Provider:** Render's managed PostgreSQL includes automatic daily backups
- **Retention:** 7 days
- **Restoration:** Via Render dashboard → Database → Backups → Restore
- **Cost:** Included in Render PostgreSQL plan

### Manual Backups (Script)
Run `scripts/backup-db.sh` (or the PowerShell equivalent) to create a local dump:

```bash
# Using pg_dump (requires PostgreSQL client tools)
pg_dump $DATABASE_URL > backups/db-$(date +%Y%m%d).sql
```

```powershell
# PowerShell equivalent
$env:DATABASE_URL = "your-connection-string"
$timestamp = Get-Date -Format "yyyyMMdd"
pg_dump $env:DATABASE_URL > "backups\db-$timestamp.sql"
```

### GitHub Action (Automated Daily Backup to Artifact)
```yaml
# .github/workflows/backup-db.yml
name: Daily DB Backup
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch: {}   # Manual trigger
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - run: pg_dump "${{ secrets.DATABASE_URL }}" > db-backup.sql
      - uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_id }}
          path: db-backup.sql
          retention-days: 30
```

---

## 2. File Storage (Cloudinary + Cloudflare R2)

### Cloudinary (Images)
- Cloudinary does **NOT** provide automatic backups by default
- **Option A (Recommended):** Enable Cloudinary's [Backup add-on](https://cloudinary.com/documentation/backups_and_version_management) (paid) — automatically backs up all assets to S3
- **Option B (Manual):** Use the Cloudinary Admin API to list and download all assets:
  ```bash
  # List all assets in the 86connects folder
  curl "https://$API_KEY:$API_SECRET@api.cloudinary.com/v1_1/$CLOUD_NAME/resources/image?prefix=86connects" | jq '.resources[].secure_url'
  ```
- **Option C (Accept risk):** Files are user uploads (IDs, passports, product photos). Can be re-requested from users if lost. Low frequency, acceptable for early stage.

### Cloudflare R2 (Non-image files: PDFs, DOCs)
- R2 has built-in durability (99.999999999% — 11 nines)
- No additional backup needed for R2 — data is replicated across multiple facilities

---

## 3. Recommended Backup Schedule

| What | Frequency | Retention | Storage Location | Automated? |
|------|-----------|-----------|-----------------|------------|
| DB dump (Render) | Daily | 7 days | Render | Yes (built-in) |
| DB dump (GitHub Action) | Daily | 30 days | GitHub Artifacts | Yes (cron) |
| DB dump (manual) | Weekly | 4 weeks | Local machine / NAS | No (manual) |
| Cloudinary files | Monthly | 3 months | Local NAS / B2 | No (manual script) |
| Full git snapshot | Before major deploys | Permanent | GitHub repo | Yes (git push) |

---

## 4. Restoration Procedure

### Database Restore (from Render backup)
1. Go to Render Dashboard → PostgreSQL database
2. Click "Backups" tab
3. Select the backup date → Click "Restore"
4. Wait for restoration to complete (5-30 minutes depending on size)

### Database Restore (from manual dump)
```bash
# Restore from SQL dump
psql $DATABASE_URL < backups/db-20260115.sql
```

### Cloudinary Restore
- If using Backup add-on: restore via Cloudinary dashboard
- If using manual downloads: re-upload files via Cloudinary upload API

---

## 5. Disaster Recovery Plan

### Scenario: Database corruption
1. Immediately stop the backend server (to prevent further writes)
2. Identify the last good backup (Render dashboard or local dump)
3. Restore from backup
4. Restart backend server
5. Verify data integrity (check recent submissions, user counts)

### Scenario: Cloudinary data loss
1. Check if Backup add-on is enabled → restore from dashboard
2. If no backup: identify affected submissions (those with broken attachment URLs)
3. Contact users to re-upload their files
4. Update attachment records in database

### Scenario: Complete server failure (Render)
1. Redeploy backend from GitHub (`main` branch)
2. Restore database from Render backup
3. Update DNS if IP changed
4. Verify all endpoints work

---

## 6. Best Practices

- **Never commit `.env` files** — they contain database credentials
- **Rotate database passwords** every 90 days
- **Test backups quarterly** — restore to a test database and verify
- **Monitor backup jobs** — set up alerts for failed GitHub Actions
- **Keep offsite copies** — don't rely solely on Render for backups
- **Document restoration** — keep runbooks for common scenarios
