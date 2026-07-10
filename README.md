<div align="center">
  <br>
  <h1>86Connect</h1>
  <p><em>Bridging the World to China</em></p>
  <br>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19">
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript" alt="TypeScript 6">
    <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express 4">
    <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma 6">
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind 4">
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker" alt="Docker">
  </p>
  <br>
</div>

---

## Overview

**86 Connect** is a full-service digital platform providing two core services:

- **Study in China** — End-to-end assistance for international students: scholarship applications, university admissions, visa guidance, and pre-departure support
- **Product Sourcing from China** — Complete procurement solutions: supplier finding, quality control, logistics coordination, and trade consulting

The platform includes a public-facing website, user authentication, consultation booking, application tracking, real-time notifications, a comprehensive admin dashboard, and full SEO optimization.

> **Live:** [the86connect.com](https://www.the86connect.com) · **API:** [api.the86connect.com](https://api.the86connect.com)

---

## Tech Stack

| Layer | Technology | Development | Production |
|-------|-----------|-------------|------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript 6 | `localhost:3000` | Vercel |
| **Backend** | Express 4 + TypeScript 6 + Prisma 6 | `localhost:3001` | Render (Docker) |
| **Database** | Prisma ORM (dual-schema) | SQLite (`dev.db`) | PostgreSQL |
| **UI** | shadcn/ui + Tailwind CSS 4 | — | — |
| **Forms** | React Hook Form + Zod | — | — |
| **Storage** | Cloudinary + Cloudflare R2 | — | Production only |
| **Email** | Resend | — | Production only |
| **Monitoring** | Sentry (client, server, edge) | — | Production only |
| **Analytics** | Vercel Analytics | — | Production only |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Vercel CDN                     │
│  ┌────────────────────────────────────────────┐  │
│  │         Next.js 16 (App Router)             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Public   │  │  Admin   │  │   API    │  │  │
│  │  │  Pages    │  │  Panel   │  │  Proxy   │  │  │
│  │  └──────────┘  └──────────┘  └────┬─────┘  │  │
│  └────────────────────────────────────┼────────┘  │
└───────────────────────────────────────┼───────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │       Render (Docker)        │
                         │  ┌────────────────────────┐  │
                         │  │   Express 4 + Prisma 6  │  │
                         │  │   • Auth (JWT + bcrypt) │  │
                         │  │   • CSRF Protection     │  │
                         │  │   • Rate Limiting       │  │
                         │  │   • File Uploads        │  │
                         │  │   • Email Notifications │  │
                         │  └───────────┬────────────┘  │
                         └──────────────┼───────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │    Render PostgreSQL         │
                         │    + Cloudinary (images)     │
                         │    + Cloudflare R2 (files)   │
                         │    + Resend (email)          │
                         └─────────────────────────────┘
```

---

## Pages & Routes

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, stats, services overview, video gallery, testimonials, contact |
| `/study-in-china` | Full study landing page: universities, scholarships, fees, process, FAQ, application form |
| `/product-sourcing` | Full sourcing landing page: services, models, costs, process, FAQ, inquiry form |
| `/about` | Company mission, values, team, and differentiators |
| `/resources` | Blog posts with pagination (8 per page) |
| `/resources/[slug]` | Individual blog post with TipTap rich content |
| `/faq` | Comprehensive FAQ covering study and sourcing topics |
| `/privacy-policy` | GDPR & CCPA compliant privacy policy |
| `/terms-of-service` | Terms of service agreement |
| `/security-policy` | Security practices disclosure |
| `/login` | User login page |
| `/signup` | User registration |
| `/account` | User dashboard: submissions, consultations, profile, data export, account deletion |
| `/study-in-china/track-application` | Track study application by reference ID |
| `/product-sourcing/track-quote` | Track sourcing quote by reference ID |

### Admin Pages

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard: overview, submissions, consultations, users, blog posts, videos, availability, settings |

### API Routes (proxied through Next.js middleware)

| Endpoint | Description |
|----------|-------------|
| `/api/contact` | General contact form submission |
| `/api/study-application` | Study application submission |
| `/api/sourcing-inquiry` | Product sourcing inquiry |
| `/api/consultation` | Consultation booking |
| `/api/upload` | File upload (Cloudinary) |
| `/api/tracking` | Application tracking by reference code |
| `/api/auth/*` | User authentication (login, register, password reset) |
| `/api/admin/*` | Admin CRUD operations |
| `/api/videos` | YouTube video management |
| `/api/blog` | Blog post management |
| `/api/availability` | Consultation slot availability |
| `/health` | Health check endpoint |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **npm** ≥ 10
- **Git**

### Local Development

```bash
# Clone the repository
git clone https://github.com/the-86-connect/the-86-connect.git
cd the-86-connect

# ── Backend ──────────────────────────────────────
cd backend

# Install dependencies
npm install

# Configure environment (see .env.example)
cp .env.example .env
# Edit .env with your local settings

# Generate Prisma client for SQLite
npm run db:migrate:dev

# Start dev server
npm run dev
# → http://localhost:3001
# → Health check: http://localhost:3001/health

# ── Frontend ─────────────────────────────────────
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000
```

### Environment Variables

#### Backend (`backend/.env`)

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET=your_jwt_secret_here
ADMIN_PASSWORD=your_admin_password_here

# Server
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development

# Cloudinary (file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=86connects

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
NOTIFY_EMAIL=info@the86connect.com
FROM_EMAIL=info@the86connect.com
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_PROXY_URL=http://localhost:3001
```

---

## Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Start compiled server |
| `npm run start:prod` | Production start (db push + node) |
| `npm run db:migrate:dev` | Run SQLite migrations |
| `npm run db:reset:dev` | Reset SQLite database |
| `npm run db:studio:dev` | Open Prisma Studio |
| `npm run db:seed:availability` | Seed availability slots |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Security

- **Helmet** with Content Security Policy (CSP)
- **CORS** with dynamic origin validation
- **CSRF** double-submit cookie pattern
- **Rate limiting** — 6 tiers: API (100/15min), Login (4/2min), Admin (3/2min), Upload (20/15min), Form (3/3min), Register (3/5min)
- **JWT** authentication with httpOnly, secure, sameSite cookies
- **bcrypt** password hashing for admin accounts
- **Brute force protection** — in-memory + database login tracking with automatic lockout
- **Bot detection** on form endpoints
- **Request timeout** — 30s on all routes
- **JSON body limit** — 100kb
- **Structured request logging** — JSON format for production debugging
- **Graceful shutdown** — SIGTERM handling with Prisma disconnect
- **Database connection retry** — 3 attempts with 5s delay at startup
- **Soft delete** — 7-day grace period with automatic purge
- **GDPR compliance** — data export, account deletion, privacy policy

---

## Deployment

### Backend (Render)

1. Push to `main` branch
2. Render auto-deploys via Dockerfile
3. Health check monitors `/health` every 30s
4. PostgreSQL connection pool: `?connection_limit=20&pool_timeout=10`

### Frontend (Vercel)

1. Push to `main` branch
2. Vercel auto-deploys from GitHub
3. Edge CDN serves static assets globally

---

## License

```
Copyright © 2025–2026 86 Connect. All rights reserved.

This software and associated documentation files (the "Software") are proprietary
and confidential. Unauthorized copying, modification, distribution, or use of
this Software, via any medium, is strictly prohibited.

The Software is provided "as is", without warranty of any kind, express or
implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the
authors or copyright holders be liable for any claim, damages or other
liability, whether in an action of contract, tort or otherwise, arising from,
out of or in connection with the Software or the use or other dealings in
the Software.

This is NOT open source software. All rights are reserved by 86 Connect.
No license is granted for any purpose without explicit written permission.
```

---

<div align="center">
  <br>
  <p>
    <strong>86 Connect</strong> — Bridging the World to China
  </p>
  <p>
    <a href="https://www.the86connect.com">Website</a> ·
    <a href="mailto:info@the86connect.com">Email</a>
  </p>
  <br>
</div>
