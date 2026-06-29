# Minimum Production Checklist

**Project:** 86 Connects Official Website
**Target:** Production Readiness Review
**Last Updated:** 2026-06-23
**Phase 10 Status:** Legal pages, cookie consent, and analytics integrated. External monitoring services (Sentry, UptimeRobot, Render backups) require manual account setup.

---

## Phase 10 Deliverables (Completed)

- [x] **Privacy Policy page** (`/privacy-policy`) — 14 sections covering data collection, GDPR, CCPA, cookies, retention, user rights
- [x] **Terms of Service page** (`/terms-of-service`) — 19 sections covering eligibility, obligations, disclaimers, liability, governing law
- [x] **Cookie consent banner** — localStorage-persisted, versioned consent, Accept/Reject buttons, dismissible
- [x] **Footer legal links** — Dedicated Legal column + bottom-bar links
- [x] **Sitemap updated** — `/privacy-policy` and `/terms-of-service` added
- [x] **Vercel Analytics** — `@vercel/analytics` installed and integrated (privacy-friendly, no cookies)
- [x] **Frontend build verified** — 0 TypeScript errors, 10 routes generated

---

## External Services (Manual Setup Required)

The following require account creation and cannot be configured in code:

### Error Tracking — Sentry
1. Create account at https://sentry.io
2. Create new Next.js project
3. Get DSN from project settings
4. Install: `npm install @sentry/nextjs`
5. Run: `npx @sentry/wizard@latest -i nextjs`
6. Add `SENTRY_DSN` to Vercel env vars
7. Add `SENTRY_AUTH_TOKEN` for source maps
8. Verify test error captured

### Uptime Monitoring — UptimeRobot
1. Create account at https://uptimerobot.com
2. Add HTTP monitor for `https://86connects-backend.onrender.com/health`
3. Set check interval: 5 minutes
4. Configure alert contacts (email + SMS)
5. Optional: Create status page at status.86connects.com

### Database Backups — Render PostgreSQL
1. Render PostgreSQL includes automated daily backups on paid plans
2. Verify backups visible in Render dashboard → Database → Backups
3. Test restore: `pg_restore` from latest backup to a test database
4. Document restore procedure in incident response plan
5. Take manual backup before each deployment

---

## Pre-Deployment Questions

Answer these honestly before going live:

- [ ] **Can users break it easily?** (Input validation, edge cases, malformed data)
- [ ] **Can users abuse it?** (Spam submissions, rate limiting, brute force)
- [ ] **What happens if 1000 users join tomorrow?** (Load capacity, scaling plan)
- [ ] **What happens if database goes down?** (Fallback, error handling, recovery)
- [ ] **How will I recover data?** (Backup strategy, restore procedure)

---

## 1. Security

### Authentication & Authorization
- [ ] Admin password is strong (min 16 chars, mixed case, numbers, symbols)
- [ ] JWT secret is cryptographically random (min 32 chars)
- [ ] JWT tokens expire (24h max)
- [ ] httpOnly cookies enabled for auth tokens
- [ ] Secure flag set in production (HTTPS only)
- [ ] SameSite: 'strict' on auth cookies
- [ ] Admin login rate limited (max 5 attempts per minute)
- [ ] Account lockout after failed attempts

### API Security
- [ ] No API keys exposed in frontend code
- [ ] No secrets in `.env.local` committed to Git
- [ ] CORS configured to only allow Vercel domain
- [ ] All admin endpoints protected with auth middleware
- [ ] Input validation on all API endpoints (Zod schema)
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React escapes by default, no dangerouslySetInnerHTML)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting on contact form (max 5 submissions per IP per hour)
- [ ] Helmet.js for security headers

### Data Protection
- [ ] No sensitive data in localStorage
- [ ] No PII logged to console or error logs
- [ ] Database connection string not exposed to client
- [ ] `.env` files in `.gitignore`
- [ ] Production secrets different from development

---

## 2. Database

### Local Development (SQLite)
- [ ] `prisma/schema.dev.prisma` configured with SQLite provider
- [ ] `prisma/dev.db` in `.gitignore` (never commit database file)
- [ ] `npm run db:migrate:dev` creates SQLite database successfully
- [ ] `npm run db:studio:dev` opens Prisma Studio with local data
- [ ] Local dev environment variables set (`.env` with `DATABASE_URL="file:./dev.db"`)
- [ ] Both schemas (`schema.prisma` and `schema.dev.prisma`) kept in sync
- [ ] Seed script works for local development testing

### Production (PostgreSQL on Render)
- [ ] `prisma/schema.prisma` configured with PostgreSQL provider
- [ ] `DATABASE_URL` set in Render environment (PostgreSQL connection string)
- [ ] `npm run db:migrate:prod` runs successfully on Render
- [ ] `npm run db:generate:prod` generates Prisma Client for PostgreSQL

### Backup & Recovery
- [ ] Automated daily backups enabled on Render PostgreSQL
- [ ] Backup retention period set (min 7 days)
- [ ] Backup restore procedure documented and tested
- [ ] Point-in-time recovery enabled (if available)
- [ ] Manual backup taken before each deployment
- [ ] Database export script tested: `pg_dump` works

### Performance
- [ ] Indexes created on frequently queried columns
  - [ ] `idx_submissions_created_at` (admin dashboard sorting)
  - [ ] `idx_submissions_service_interest` (filtering)
- [ ] Connection pooling enabled (Prisma)
- [ ] Query performance tested with 10,000+ rows
- [ ] Database connection limits understood (Render plan)

### Failover
- [ ] Database downtime error handling in backend
- [ ] Frontend displays friendly error when API unavailable
- [ ] Health check endpoint (`/health`) monitors DB connection
- [ ] Render database monitoring alerts configured

### Schema Sync Checklist (When Updating Features)
When you add or modify database models, complete ALL:
- [ ] Update `prisma/schema.prisma` (PostgreSQL - production)
- [ ] Update `prisma/schema.dev.prisma` (SQLite - local dev)
- [ ] Run `npm run db:migrate:dev` (local SQLite migration)
- [ ] Test locally with SQLite
- [ ] Commit both schema files
- [ ] Deploy to Render (migrations run automatically via `db:migrate:prod`)
- [ ] Verify production database schema updated
- [ ] Update this checklist if new backup/monitoring needed

---

## 3. Error Handling

### Frontend
- [ ] Global error boundary component (`error.tsx` in Next.js)
- [ ] `not-found.tsx` custom 404 page
- [ ] `loading.tsx` loading states for all async operations
- [ ] Form submission errors display user-friendly messages
- [ ] Network errors handled gracefully
- [ ] No unhandled promise rejections
- [ ] Console errors monitored in production

### Backend
- [ ] Global error handler middleware (Express)
- [ ] Try-catch on all database operations
- [ ] Consistent error response format: `{ error: string, details?: string }`
- [ ] Proper HTTP status codes (400, 401, 403, 404, 500)
- [ ] No stack traces exposed in production responses
- [ ] Error logging to console (captured by Render logs)
- [ ] Health check endpoint returns 200 when healthy

### Logging
- [ ] Error logging installed (console.log or Sentry)
- [ ] Structured log format (JSON)
- [ ] Request logging (method, path, status, duration)
- [ ] Database errors logged with context
- [ ] Auth failures logged (no passwords)
- [ ] Log retention policy set on Render

---

## 4. Performance

### Frontend Performance
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Images optimized (WebP, next/image with priority for hero)
- [ ] Lazy loading for below-the-fold images
- [ ] Code splitting (Next.js automatic)
- [ ] Bundle size analyzed (`@next/bundle-analyzer`)
- [ ] Font optimization (next/font)
- [ ] CSS minified (Tailwind purge)
- [ ] JavaScript minified (production build)

### Backend Performance
- [ ] Response time < 200ms for API endpoints
- [ ] Database queries < 100ms
- [ ] Gzip compression enabled
- [ ] Static assets cached (Cache-Control headers)
- [ ] API response caching where appropriate
- [ ] Render Web Service plan adequate for expected traffic

### Load Testing
- [ ] Load test with 100 concurrent users
- [ ] Load test with 1000 concurrent users
- [ ] Contact form submission under load
- [ ] Admin dashboard loads with 10,000 submissions
- [ ] No memory leaks under sustained load

---

## 5. Performance (Monitoring)

### Uptime Monitoring
- [ ] Uptime monitoring configured (UptimeRobot, BetterUptime, or Render monitoring) — see External Services §UptimeRobot
- [ ] Health check endpoint monitored (`/health`) — endpoint ready, monitor setup pending
- [ ] Alerts configured for downtime (email/SMS)
- [ ] Status page created (optional: statuspage.io)

### Application Monitoring
- [x] Analytics installed (Google Analytics, Plausible, or Vercel Analytics) — Vercel Analytics integrated
- [ ] Error tracking installed (Sentry or LogRocket) — see External Services §Sentry
- [ ] Performance monitoring (Vercel Web Vitals) — available via Vercel Analytics dashboard
- [ ] API response time monitoring
- [ ] Database connection pool monitoring

### Business Metrics
- [ ] Contact form submission tracking
- [ ] Conversion tracking (CTA clicks → form submissions)
- [ ] Page view tracking per section
- [ ] Admin dashboard usage tracking
- [ ] Error rate alerting (> 1% of requests)

---

## 6. Legal Pages

### Required Pages
- [x] Privacy Policy page (`/privacy-policy`)
- [x] Terms of Service page (`/terms-of-service`)
- [x] Cookie Policy page (if using analytics cookies) — covered by Privacy Policy §7 + Cookie Consent banner
- [x] Links to legal pages in footer

### Privacy Policy Content
- [x] What data is collected (name, email, phone, message)
- [x] How data is used (responding to inquiries)
- [x] Data storage location (Render PostgreSQL)
- [x] Data retention period
- [x] User rights (access, deletion, modification)
- [x] Contact information for privacy concerns
- [x] Cookie usage disclosure
- [x] Third-party services used (analytics, hosting)
- [x] Last updated date

### Compliance
- [x] GDPR compliance (EU users) — §9 of Privacy Policy
- [x] CCPA compliance (California users) — §10 of Privacy Policy
- [x] Cookie consent banner (if applicable)
- [ ] Data Processing Agreement with Render — obtain from Render
- [x] Privacy policy accessible without scrolling (footer link)

---

## 7. Monitoring

### Infrastructure Monitoring
- [ ] Render Web Service logs accessible
- [ ] Render database logs accessible
- [ ] Vercel deployment logs accessible
- [ ] Vercel function logs accessible (if using API routes)
- [ ] Log aggregation configured (optional: Logtail, Papertrail)

### Alerting
- [ ] Downtime alerts (email + SMS)
- [ ] High error rate alerts (> 1% of requests)
- [ ] Database connection failure alerts
- [ ] Disk space alerts (database)
- [ ] Memory usage alerts (backend)
- [ ] SSL certificate expiration alerts

### Dashboards
- [ ] Uptime dashboard
- [ ] Error rate dashboard
- [ ] Response time dashboard
- [ ] Submission count dashboard
- [ ] Traffic dashboard (analytics)

---

## 8. Testing

### Manual Testing
- [ ] All acceptance criteria from PRD §6 tested
- [ ] Contact form submission works end-to-end
- [ ] Admin login works
- [ ] Admin dashboard displays submissions
- [ ] Logout works
- [ ] CTA buttons pre-select service in contact form
- [ ] Smooth scroll navigation works
- [ ] Mobile responsive on iOS (Safari)
- [ ] Mobile responsive on Android (Chrome)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Automated Testing
- [ ] Unit tests for validation schemas (Zod)
- [ ] Unit tests for API endpoints
- [ ] Integration tests for database operations
- [ ] E2E test for contact form submission
- [ ] E2E test for admin login flow
- [ ] E2E test for admin dashboard
- [ ] Test coverage > 70%

### Security Testing
- [ ] OWASP Top 10 review
- [ ] SQL injection test
- [ ] XSS test
- [ ] CSRF test
- [ ] Brute force login test
- [ ] Rate limiting verified
- [ ] Security headers verified (securityheaders.com)

---

## 9. Infrastructure

### Domain & SSL
- [ ] Custom domain connected (Vercel)
- [ ] HTTPS enabled (Vercel automatic SSL)
- [ ] SSL certificate valid and not expiring soon
- [ ] WWW redirect configured (or non-WWW redirect)
- [ ] DNS records configured (A, CNAME, MX if email)
- [ ] Domain registered for > 1 year

### Environment Configuration
- [ ] **Frontend (Vercel)**:
  - [ ] `NEXT_PUBLIC_API_URL` set to Render backend URL
  - [ ] `NEXT_PUBLIC_GA_ID` set (if using Google Analytics)
  - [ ] Production environment selected
  - [ ] Preview deployments enabled
- [ ] **Backend (Render - Production)**:
  - [ ] `DATABASE_URL` set to Render PostgreSQL internal URL
  - [ ] `JWT_SECRET` set (cryptographically random)
  - [ ] `ADMIN_PASSWORD` set (strong password)
  - [ ] `CORS_ORIGIN` set to Vercel domain
  - [ ] `NODE_ENV` set to `production`
  - [ ] `PORT` set correctly
- [ ] **Backend (Local Dev - SQLite)**:
  - [ ] `.env` file created (not committed)
  - [ ] `DATABASE_URL="file:./dev.db"` for SQLite
  - [ ] `JWT_SECRET` set (local dev value)
  - [ ] `ADMIN_PASSWORD` set (local dev value)
  - [ ] `CORS_ORIGIN=http://localhost:3000`
  - [ ] `NODE_ENV=development`
- [ ] **Gitignore**:
  - [ ] `.env` in `.gitignore`
  - [ ] `prisma/dev.db` in `.gitignore`
  - [ ] `prisma/dev.db-journal` in `.gitignore`

### Deployment
- [ ] Auto-deploy from Git configured (Vercel + Render)
- [ ] Production branch protected (main/master)
- [ ] Deployment rollback plan documented
- [ ] Database migrations run before app deployment
- [ ] Health check passes after deployment
- [ ] Smoke test after deployment

### Docker (Backend)
- [ ] Dockerfile builds successfully
- [ ] Docker image size reasonable (< 500MB)
- [ ] Container starts and responds to health check
- [ ] Environment variables passed correctly
- [ ] Volume mounts for logs (if needed)
- [ ] Container restart policy set (`unless-stopped`)

### Backup Infrastructure
- [ ] Database backups automated (Render)
- [ ] Code repository backed up (GitHub)
- [ ] Environment variables documented (securely)
- [ ] Deployment configuration documented
- [ ] Disaster recovery plan documented

---

## Final Go-Live Checklist

Complete ALL items below before announcing launch:

- [ ] All security checklist items passed
- [ ] All database backup items configured
- [ ] Error handling tested with intentional failures
- [ ] Lighthouse score > 90
- [ ] Load test passed (1000 users)
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Monitoring and alerts active
- [ ] All tests passing
- [ ] Domain and HTTPS working
- [ ] All environment variables set
- [ ] Smoke test passed in production
- [ ] Team notified of launch
- [ ] Rollback plan ready

---

## Post-Launch (First 48 Hours)

- [ ] Monitor error rates hourly
- [ ] Monitor response times
- [ ] Check database performance
- [ ] Verify backups running
- [ ] Test contact form submission
- [ ] Test admin login
- [ ] Review analytics data
- [ ] Address any user-reported issues
- [ ] Document any incidents

---

## Emergency Contacts

| Service | Contact | URL |
|---------|---------|-----|
| Vercel Support | - | https://vercel.com/support |
| Render Support | - | https://render.com/support |
| Domain Registrar | - | - |
| Database Admin | - | - |

---

## Incident Response Plan

### If Database Goes Down:
1. Check Render dashboard for database status
2. Backend will return 500 errors → Frontend shows error toast
3. Contact Render support if issue persists
4. Restore from backup if data corruption: `pg_restore` from latest backup
5. Notify users via status page

### If Backend Goes Down:
1. Check Render Web Service logs
2. Render auto-restarts on crash
3. If persistent, redeploy from Git
4. Frontend shows error messages for API failures
5. Public pages still work (static content)

### If Frontend Goes Down:
1. Check Vercel deployment status
2. Redeploy from Git if needed
3. Rollback to previous deployment if issue persists
4. Vercel auto-rolls back on build failure

### Data Recovery Procedure:
1. Identify backup point (Render dashboard → Database → Backups)
2. Create new database from backup
3. Update `DATABASE_URL` in Render backend
4. Restart backend service
5. Verify data integrity
6. Test application functionality
