# 86 Connect — Deployment Guide

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                    │
│  ┌─────────────────────┐  ┌──────────────────────────┐   │
│  │ the86connect.com   │  │ admin.the86connect.com   │   │
│  │ (main site)       │  │ (admin panel)             │   │
│  └──────────┬────────┘  └────────────┬─────────────┘   │
│             │                          │                   │
│             └────────────┬───────────────┘                   │
│                          │                               │
│              Next.js Middleware                            │
│              (subdomain routing + API proxy)                 │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              api.the86connect.com (Custom API Domain)        │
│              (CNAME to Render backend)                     │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                 Render (Backend + DB)                          │
│  Express API + Prisma ORM + PostgreSQL                    │
│  Endpoints: /api/admin, /api/contact, /api/auth, etc.   │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Vercel Setup (Frontend)

### 1.1 Project Configuration

1. Import the GitHub repository into Vercel
2. Framework Preset: **Next.js**
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Install Command: `npm ci`
6. Output Directory: `.next`

### 1.2 Domain Configuration

**Primary Domain:** `the86connect.com`

**Admin Subdomain:** `admin.the86connect.com`

Steps to add the admin subdomain:

1. Go to Vercel Project → **Settings → Domains**
2. Click **Add Domain**
3. Enter `admin.the86connect.com`
4. Click **Add**
5. Vercel will provide DNS configuration instructions
6. Add the required CNAME record in your DNS provider (Namecheap)
7. Wait for DNS propagation and SSL certificate provisioning

> **IMPORTANT**: The `DEPLOYMENT_NOT_FOUND` error means the admin subdomain is not properly added to your Vercel project. Follow the steps above exactly.

### 1.3 Environment Variables

Set these in Vercel Project → **Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `BACKEND_PROXY_URL` | `https://api.the86connect.com` | Backend API URL for proxying via middleware |
| `NEXT_PUBLIC_SITE_URL` | `https://the86connect.com` | Public site URL |
| `SENTRY_ORG` | *(your Sentry org)* | Optional — for error tracking |
| `SENTRY_PROJECT` | *(your Sentry project)* | Optional — for error tracking |
| `SENTRY_AUTH_TOKEN` | *(your Sentry token)* | Optional — for error tracking |

### 1.4 DNS Configuration (Namecheap)

Add these records in Namecheap → **Advanced DNS**.

> **Note**: The exact CNAME target value is shown in your Vercel dashboard (Settings → Domains → Configure). It may be `cname.vercel-dns.com.` or a project-specific value. Copy the exact value from Vercel.

| Type | Host | Value | Priority |
|------|------|-------|----------|
| CNAME | `www` | *(your Vercel CNAME value, from Vercel dashboard)* | — |
| CNAME | `admin` | *(your Vercel CNAME value, from Vercel dashboard)* | — |
| CNAME | `api` | *(your Render backend custom domain CNAME)* | — |
| A | `@` | Vercel IP (shown in Vercel dashboard) | — |

**Custom API domain (`api.the86connect.com`)**: Point to your Render backend via CNAME, following Render's custom domain setup instructions.

---

## 2. Render Setup (Backend)

### 2.1 Web Service Configuration

1. Import the GitHub repository into Render
2. Runtime: **Node.js**
3. Root Directory: `backend`
4. Build Command: `npm ci && npm run build`
5. Start Command: `node dist/index.js`
6. Instance Type: **Starter** (or higher for production)

### 2.2 Environment Variables

Set these in Render → **Environment**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string from Render DB |
| `JWT_SECRET` | *(long random string)* | JWT signing secret — keep it secure |
| `ADMIN_PASSWORD` | *(admin bootstrap password)* | Used when no admin users exist yet |
| `CORS_ORIGIN` | `https://the86connect.com,https://admin.the86connect.com` | Comma-separated allowed origins |
| `COOKIE_DOMAIN` | `.the86connect.com` | Cookie domain with leading dot for cross-subdomain access |
| `PORT` | `10000` | Render default port |
| `NODE_ENV` | `production` | — |
| `CLOUDINARY_CLOUD_NAME` | *(your Cloudinary cloud name)* | For file uploads |
| `CLOUDINARY_API_KEY` | *(your Cloudinary API key)* | For file uploads |
| `CLOUDINARY_API_SECRET` | *(your Cloudinary API secret)* | For file uploads |
| `CLOUDINARY_FOLDER` | `86connects` | Cloudinary upload folder |
| `RESEND_API_KEY` | *(your Resend API key)* | For email notifications |
| `NOTIFY_EMAIL` | `info@the86connect.com` | Admin notification email |

### 2.3 PostgreSQL Database

1. Create a PostgreSQL database on Render
2. Copy the `DATABASE_URL` (internal URL)
3. Add it to the backend web service environment variables
4. The backend uses `prisma db push` for schema sync (not migrations)

### 2.4 Custom API Domain

To use `api.the86connect.com` instead of the default Render URL:

1. In Render, go to your backend web service → **Settings → Custom Domains**
2. Add `api.the86connect.com`
3. Follow Render's instructions to add the CNAME record in Namecheap
4. Wait for SSL certificate provisioning
5. Update `BACKEND_PROXY_URL` in Vercel to `https://api.the86connect.com`

---

## 3. Middleware & Subdomain Routing

The admin subdomain is handled entirely by Next.js middleware (`frontend/src/middleware.ts`):

- **API proxy**: All `/api/*` and `/health` requests are rewritten to the backend
- **Admin subdomain**: `admin.the86connect.com` is rewritten to `/admin/*` path
- **Main domain**: `the86connect.com` serves the main site normally

### How It Works

1. Request comes in to `admin.the86connect.com/some-page`
2. Middleware detects the admin subdomain from the `Host` header
3. Middleware rewrites the path to `/admin/some-page`
4. Next.js serves the admin page from `app/admin/some-page`
5. API calls to `/api/admin/*` are proxied to the Render backend

### No Separate Deployment Needed

Both `the86connect.com` and `admin.the86connect.com` are served by the **same Vercel deployment**. This is achieved through subdomain rewriting in middleware, not separate deployments.

---

## 4. Cookie Configuration

Auth cookies are configured for cross-subdomain access:

| Cookie | httpOnly | Secure | SameSite | Domain | Path | Max-Age |
|--------|----------|--------|----------|--------|------|---------|
| `admin_token` | ✅ Yes | ✅ Production | `lax` | `.the86connect.com` | `/` | 24h |
| `user_token` | ✅ Yes | ✅ Production | `lax` | `.the86connect.com` | `/` | 7d |
| `csrf_token` | ❌ No | ✅ Production | `lax` | `.the86connect.com` | `/` | 24h |

> **Key**: The leading dot in `.the86connect.com` makes cookies accessible on both `the86connect.com` and `admin.the86connect.com`.

---

## 5. Troubleshooting

### 5.1 `DEPLOYMENT_NOT_FOUND` on admin subdomain

**Cause**: The admin subdomain is not added to the Vercel project.

**Fix**:
1. Go to Vercel → Project → Settings → Domains
2. Add `admin.the86connect.com`
3. Add the CNAME record in your DNS provider
4. Wait for DNS propagation (can take 5-30 minutes)

### 5.2 404 on `/api/*` requests

**Cause**: API proxy misconfiguration.

**Check**:
1. `BACKEND_PROXY_URL` env var is set in Vercel
2. `middleware.ts` is present at `frontend/src/middleware.ts`
3. The middleware matcher includes `/api/*` routes
4. No duplicate rewrites in `vercel.json`

### 5.3 CORS errors on admin subdomain

**Cause**: CORS origin not whitelisted.

**Fix**:
1. Ensure `CORS_ORIGIN` on Render includes both domains:
   ```
   CORS_ORIGIN=https://the86connect.com,https://admin.the86connect.com
   ```
2. Redeploy the backend

### 5.4 CSRF token validation fails on admin subdomain

**Cause**: CSRF cookie domain not set.

**Fix**:
1. Ensure `COOKIE_DOMAIN` is set to `.the86connect.com` on Render
2. The CSRF cookie uses the same domain pattern as auth cookies
3. Clear browser cookies and retry

### 5.5 Admin login works but dashboard redirects to login

**Cause**: Cookie not being sent or JWT validation failing.

**Debug steps**:
1. Open DevTools → Application → Cookies
2. Check if `admin_token` cookie exists
3. Check cookie domain is `.the86connect.com`
4. Check cookie is `Secure` (only sent over HTTPS)
5. Check Network tab for 401 responses on API calls

### 5.6 Cookie not shared between subdomains

**Cause**: Cookie domain missing leading dot.

**Fix**:
- Wrong: `the86connect.com` (exact match only)
- Correct: `.the86connect.com` (includes all subdomains)

---

## 6. Environment Variable Reference

### Frontend (Vercel)

```env
# Backend API URL for proxying via middleware
# Use your custom API domain: https://api.the86connect.com
BACKEND_PROXY_URL=https://api.the86connect.com

# Public site URL
NEXT_PUBLIC_SITE_URL=https://the86connect.com

# Sentry (optional)
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

### Backend (Render)

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-jwt-secret-here
ADMIN_PASSWORD=bootstrap-admin-password
COOKIE_DOMAIN=.the86connect.com

# CORS (comma-separated)
CORS_ORIGIN=https://the86connect.com,https://admin.the86connect.com

# Server
PORT=10000
NODE_ENV=production

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=86connects

# Email (Resend)
RESEND_API_KEY=
NOTIFY_EMAIL=info@the86connect.com
```

---

## 7. Deployment Checklist

- [ ] Vercel project created with `frontend` as root directory
- [ ] `the86connect.com` added as primary domain
- [ ] `admin.the86connect.com` added as subdomain in Vercel
- [ ] DNS records configured in Namecheap (CNAME for www, admin, api)
- [ ] SSL certificates provisioned for all domains
- [ ] `BACKEND_PROXY_URL` set to `https://api.the86connect.com` in Vercel
- [ ] Render backend web service created
- [ ] Render PostgreSQL database created
- [ ] `api.the86connect.com` custom domain added to Render backend
- [ ] `DATABASE_URL` set in backend env vars
- [ ] `JWT_SECRET` set in backend env vars
- [ ] `CORS_ORIGIN` includes both frontend domains
- [ ] `COOKIE_DOMAIN` set to `.the86connect.com`
- [ ] Cloudinary credentials configured
- [ ] Resend API key configured
- [ ] Frontend deployment succeeds
- [ ] Backend deployment succeeds
- [ ] `/health` endpoint returns 200
- [ ] Admin login works on main domain (`/admin/login`)
- [ ] Admin login works on admin subdomain (`admin.the86connect.com/login`)
- [ ] Cookie persists across both domains
