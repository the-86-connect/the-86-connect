# 86 Connects — Full-Stack Implementation Plan

> **Built phase by phase.** Each phase produces a working, testable increment.
> Start at Phase 1 and work forward. Stop after any phase to validate.

---

## Phase Overview

| Phase | Name | What Gets Built | Skills Used |
|-------|------|----------------|-------------|
| **1** | Project Scaffolding | Next.js + Express + Prisma skeleton | `backend-api`, `routing` |
| **2** | Design System | Colors, typography, layout, nav | `ui-ux-pro-max`, `gral-frontend-design`, `ui-components` |
| **3** | Public Pages (Static) | Hero, Study, Sourcing, About, Contact sections | `ui-ux-pro-max`, `ui-components`, `routing` |
| **4** | Backend API + Database | Prisma schema, migrations, 7 API endpoints | `backend-api`, `admin-auth` |
| **5** | Forms (Interactive) | 3 forms with validation + submission | `ui-ux-pro-max`, `contact-form`, `backend-api`, `ui-components` |
| **6** | Admin Auth + Dashboard | Login, JWT, dashboard table, sorting/filtering | `ui-ux-pro-max`, `admin-auth`, `routing`, `backend-api`, `ui-components` |
| **7** | SEO + Performance | Metadata, OG, JSON-LD, sitemap, images | `seo`, `ui-components` |
| **8** | Production Deployment | Vercel frontend + Render backend/Docker | `docker`, `backend-api`, `seo` |
| **9** | Testing + Polish | Cross-browser, mobile, load test, audit | `frontend-code-review`, `gral-frontend-design`, `agentation` |
| **10** | Legal + Monitoring | Privacy, analytics, uptime, backups | `seo`, _(production-checklist.md)_ |

---

## Phase 1: Project Scaffolding

**Goal:** Two runnable empty projects talking to each other.

### Tasks

```
[ ] 1.1 Initialize Next.js frontend
    - npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
    - cd frontend && npx shadcn@latest init
    - Install: react-hook-form, zod, @hookform/resolvers, sonner, lucide-react

[ ] 1.2 Initialize Express backend
    - mkdir backend && cd backend && npm init -y
    - Install: express, cors, helmet, jsonwebtoken, cookie-parser, dotenv
    - Install dev: typescript, tsx, prisma, @types/express, @types/cors, @types/jsonwebtoken
    - Create tsconfig.json
    - Create backend/src/index.ts (health check endpoint)

[ ] 1.3 Setup Prisma (dual schema)
    - Create prisma/schema.prisma (PostgreSQL — production)
    - Create prisma/schema.dev.prisma (SQLite — local dev)
    - Add npm scripts: db:migrate:dev, db:studio:dev, db:migrate:prod
    - Run: npm run db:migrate:dev (creates dev.db)
    - Run: npx prisma generate

[ ] 1.4 Configure CORS
    - Frontend env: NEXT_PUBLIC_API_URL=http://localhost:3001
    - Backend env: CORS_ORIGIN=http://localhost:3000

[ ] 1.5 Verify
    - Start backend: cd backend && npm run dev → localhost:3001/health returns 200
    - Start frontend: cd frontend && npm run dev → localhost:3000 loads
    - Frontend can fetch from backend (test with useEffect)
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `backend-api` | Backend project setup, Prisma, Express patterns |
| `routing` | Next.js App Router structure |

### Full Docs to Read

- `skills/backend-api.md` — Prisma dual schema setup, Express patterns
- `skills/routing.md` — Next.js App Router structure

### Files Created

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── .env.local
├── package.json
└── tailwind.config.ts

backend/
├── src/
│   └── index.ts
├── prisma/
│   ├── schema.prisma          (PostgreSQL)
│   ├── schema.dev.prisma      (SQLite)
│   └── dev.db                  (auto-created)
├── .env
├── tsconfig.json
└── package.json
```

---

## Phase 2: Design System

**Goal:** Complete visual identity — colors, fonts, spacing, nav bar.

### Tasks

```
[ ] 2.1 Generate design system
    - Invoke: ui-ux-pro-max → run search.py for "86 Connects" brand
    - Get: color palette, typography, styles, UX guidelines

[ ] 2.2 Configure Tailwind theme
    - Update tailwind.config.ts with brand colors, fonts
    - Set up CSS custom properties in globals.css

[ ] 2.3 Build layout shell
    - app/layout.tsx: RootLayout with metadata, html/body
    - components/layout/navbar.tsx: Sticky nav, smooth scroll links
    - components/layout/footer.tsx: Links, copyright

[ ] 2.4 Apply design polish
    - Invoke: gral-frontend-design (carattere) → typography
    - Invoke: gral-frontend-design (tinta) → color
    - Invoke: gral-frontend-design (componi) → layout/spacing

[ ] 2.5 Verify
    - Navbar is sticky, responsive, links scroll smoothly
    - Design system tokens documented for future use
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `ui-ux-pro-max` | Generate brand design system (colors, fonts, styles) |
| `gral-frontend-design` | Typography via carattere, color via tinta, layout via componi |
| `ui-components` | Navbar, footer, layout components |

### Full Docs to Read

- `skills/ui-components.md` — shadcn/ui component patterns, navbar, footer
- `.gral/commands/magistero.md` — Core design principles
- `.gral/commands/carattere.md` — Typography
- `.gral/commands/tinta.md` — Color
- `.gral/commands/componi.md` — Layout/spacing

### Files Created

```
frontend/
├── components/
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   └── ui/                    (shadcn components)
├── tailwind.config.ts         (updated)
└── app/globals.css            (updated)
```

---

## Phase 3: Public Pages (Static Content)

**Goal:** All 5 sections visible with real content, no forms yet.

### Tasks

```
[ ] 3.1 Build Hero section
    - Company name, tagline, hero image (priority loaded)
    - Service navigation cards (Study in China, Product Sourcing)
    - CTA buttons with smooth scroll targets

[ ] 3.2 Build Study in China section
    - Section title, description, service image
    - Three service offerings (Scholarship, Admissions, Guidance)
    - Placeholder for form (Phase 5)

[ ] 3.3 Build Product Sourcing section
    - Section title, description, service image
    - Three service offerings (Supplier, Procurement, Logistics)
    - Placeholder for form (Phase 5)

[ ] 3.4 Build About Us section
    - Company intro, mission, values, differentiators

[ ] 3.5 Build Contact section
    - Company info (address, email, phone)
    - Placeholder for general contact form (Phase 5)

[ ] 3.6 Smooth scroll navigation
    - Menu items: Home, Study in China, Product Sourcing, About Us, Contact (PRD §3.6)
    - Each nav link scrolls to its section
    - Active section highlighted in nav
    - Scroll behavior: smooth

[ ] 3.7 Responsive pass
    - Mobile: hamburger menu, stacked sections
    - Tablet: adjusted spacing
    - Desktop: full layout

[ ] 3.8 Verify
    - All 5 sections visible
    - Smooth scroll works from nav and CTA buttons
    - Mobile responsive
    - No console errors
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `ui-ux-pro-max` | Check design system (established in Phase 2) for section styling |
| `ui-components` | Section components, cards, responsive layout |
| `routing` | Smooth scroll, section IDs |

### Full Docs to Read

- `skills/ui-components.md` — Section components, cards, responsive patterns
- `skills/routing.md` — Smooth scroll, section navigation

### Files Created

```
frontend/
├── components/
│   ├── sections/
│   │   ├── hero.tsx
│   │   ├── study-in-china.tsx
│   │   ├── product-sourcing.tsx
│   │   ├── about-us.tsx
│   │   └── contact.tsx
│   └── ui/
│       └── service-card.tsx
├── app/page.tsx               (updated with all sections)
└── public/
    ├── hero_banner.jpg
    ├── study_in_china.jpg
    └── product_sourcing.jpg
```

---

## Phase 4: Backend API + Database

**Goal:** Database schema created, all 5 API endpoints working.

### Tasks

```
[ ] 4.1 Define Prisma schema
    - Single Submission model with all fields (PRD §8.5)
    - submission_type enum (study_inquiry, sourcing_inquiry, general_inquiry)
    - Indexes on submission_type, created_at, service_interest
    - Sync BOTH schemas: schema.prisma + schema.dev.prisma
    - Follow Schema Sync Checklist in production-checklist.md (§Database)

[ ] 4.2 Run migrations
    - npm run db:migrate:dev (SQLite local)
    - npx prisma generate
    - Verify: npx prisma studio (view empty table)

[ ] 4.3 Build API routes
    - POST /api/contact/study        → Study in China form
    - POST /api/contact/sourcing     → Product Sourcing form
    - POST /api/contact              → General contact form
    - POST /api/admin/login          → Admin authentication
    - POST /api/admin/logout         → Clear auth
    - GET  /api/admin/submissions    → All submissions (protected)
    - GET  /health                   → Health check

[ ] 4.4 Add Zod validation schemas
    - studyInquirySchema (PRD §4.2)
    - sourcingInquirySchema (PRD §4.3)
    - generalInquirySchema (PRD §4.4)
    - loginSchema (password required)

[ ] 4.5 Add middleware
    - CORS (allow frontend origin)
    - Helmet (security headers)
    - JSON body parser
    - Cookie parser
    - Auth middleware for /api/admin/* routes
    - Rate limiter on contact endpoints (5 req/min per IP)

[ ] 4.6 Add error handling
    - Global error handler middleware
    - Consistent error format: { error: string, details?: string }
    - Proper HTTP status codes
    - No stack traces in production

[ ] 4.7 Verify
    - Test all endpoints with curl/Postman
    - POST /api/contact/study → 201 + data in DB
    - POST /api/admin/login → 200 + httpOnly cookie
    - GET /api/admin/submissions → 401 without auth, 200 with auth
    - GET /health → 200
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `backend-api` | Prisma schema, API endpoints, Zod validation, middleware |
| `admin-auth` | JWT + httpOnly cookies, auth middleware |

### Full Docs to Read

- `skills/backend-api.md` — Prisma schema, Express routes, Zod validation, middleware
- `skills/admin-auth.md` — JWT auth, httpOnly cookies, auth middleware patterns

### Files Created

```
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── contact.ts
│   │   └── admin.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── validation/
│   │   └── schemas.ts         (Zod schemas)
│   └── lib/
│       └── prisma.ts          (Prisma client singleton)
├── prisma/
│   ├── schema.prisma          (updated with Submission model)
│   ├── schema.dev.prisma      (updated — in sync)
│   └── migrations/
└── .env
```

---

## Phase 5: Forms (Interactive)

**Goal:** All 3 forms submit successfully to backend.

### Tasks

```
[ ] 5.1 Build Study in China Inquiry Form
    - Fields: Full Name*, Email*, Phone, Nationality*, Education Level*, Service Type*, Field of Study, Province/City, Message*
    - React Hook Form + Zod validation
    - Loading state on submit button
    - Success toast + clear form
    - Error toast on failure
    - POST to /api/contact/study

[ ] 5.2 Build Product Sourcing Inquiry Form
    - Fields: Company Name, Full Name*, Email*, Phone*, Country*, Service Type*, Product Category, Order Quantity, Message*
    - React Hook Form + Zod validation
    - Same loading/success/error behavior
    - POST to /api/contact/sourcing

[ ] 5.3 Build General Contact Form
    - Fields: Name*, Email*, Phone, Service Interest*, Subject, Message*
    - React Hook Form + Zod validation
    - Same loading/success/error behavior
    - POST to /api/contact

[ ] 5.4 CTA pre-selection logic
    - "Study in China" CTA → scrolls to Study form, focuses first field
    - "Product Sourcing" CTA → scrolls to Sourcing form, focuses first field
    - "Contact" nav → scrolls to Contact form, default placeholder

[ ] 5.5 Prevent double submission
    - Disable submit button while request is in-flight
    - Show loading spinner on button

[ ] 5.6 Verify
    - Submit each form with valid data → success toast, data in DB
    - Submit each form with invalid data → validation errors shown
    - Submit each form with empty required fields → prevented
    - Rapid double-click submit → only one request sent
    - Network error → friendly error toast
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `ui-ux-pro-max` | Check design system for form styling tokens |
| `contact-form` | React Hook Form + Zod patterns, validation, submission |
| `ui-components` | Form styling, toast notifications, input components |
| `backend-api` | API endpoint integration |

### Full Docs to Read

- `skills/contact-form.md` — React Hook Form + Zod, form validation, submission patterns
- `skills/backend-api.md` — API endpoint patterns for form submission
- `skills/ui-components.md` — Form input, select, toast components

### Files Created

```
frontend/
├── components/
│   ├── forms/
│   │   ├── study-inquiry-form.tsx
│   │   ├── sourcing-inquiry-form.tsx
│   │   └── general-contact-form.tsx
│   └── ui/
│       └── toast.tsx           (sonner setup)
├── app/page.tsx                (updated: forms integrated)
└── lib/
    └── api.ts                  (fetch helper for API calls)
```

---

## Phase 6: Admin Auth + Dashboard

**Goal:** Admin can log in and view all submissions.

### Tasks

```
[ ] 6.1 Build Admin Login page (/admin/login)
    - Password input + Login button
    - Form validation: password required
    - POST to /api/admin/login
    - On success: redirect to /admin
    - On failure: error message
    - Loading state on button

[ ] 6.2 Setup AuthProvider context
    - AuthContext with user state, login, logout, isAuthenticated
    - Wrap app in AuthProvider (layout.tsx)
    - Check auth on mount (verify cookie)

[ ] 6.3 Build Admin Dashboard (/admin)
    - Submissions table with columns:
      - Submission Type, Name, Email, Phone, Service, Message, Date
    - Sort by any column (asc/desc toggle)
    - Filter by submission type (All, Study, Sourcing, General)
    - Loading state while fetching
    - Empty state: "No submissions yet"
    - Error state: "Failed to load submissions"

[ ] 6.4 Add route protection
    - Middleware: redirect /admin → /admin/login if not authenticated
    - Protected route component

[ ] 6.5 Add logout
    - Logout button in dashboard
    - POST to /api/admin/logout
    - Clear auth state, redirect to home
    - Handle edge case: double-click logout

[ ] 6.6 Verify
    - Visit /admin without auth → redirected to /admin/login
    - Login with correct password → dashboard loads
    - Login with wrong password → error shown
    - Dashboard shows all submissions from Phase 5
    - Sort by Name → table reorders
    - Filter by "Study Inquiry" → only study submissions shown
    - Logout → redirected to home, /admin inaccessible
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `ui-ux-pro-max` | Check design system for admin UI styling |
| `admin-auth` | JWT auth, AuthProvider, useAuth hook, ProtectedRoute |
| `routing` | Route protection, middleware, redirects |
| `ui-components` | Table, filter, sort components, loading/empty/error states |
| `backend-api` | Auth endpoints, submissions API |

### Full Docs to Read

- `skills/admin-auth.md` — JWT auth, AuthProvider, useAuth hook, ProtectedRoute
- `skills/backend-api.md` — Auth endpoints, submissions API
- `skills/routing.md` — Route protection, middleware
- `skills/ui-components.md` — Table, filter, sort components

### Files Created

```
frontend/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── layout.tsx             (updated: AuthProvider)
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx
│   │   ├── protected-route.tsx
│   │   └── login-form.tsx
│   └── admin/
│       ├── submissions-table.tsx
│       ├── submissions-filter.tsx
│       └── dashboard-header.tsx
├── middleware.ts
└── hooks/
    └── useAuth.ts
```

---

## Phase 7: SEO + Performance

**Goal:** Lighthouse score > 90, full SEO metadata.

### Tasks

```
[ ] 7.1 Root metadata (app/layout.tsx)
    - Title template: "%s | 86 Connects"
    - Default title, description, keywords
    - Open Graph (site_name, image 1200x630)
    - Twitter Card (summary_large_image)
    - Canonical URL, robots
    - Google verification code

[ ] 7.2 Page metadata (app/page.tsx)
    - Page-specific title + description

[ ] 7.3 Structured data (JSON-LD)
    - Organization schema
    - Service schema (ItemList with Study + Sourcing services)
    - BreadcrumbList schema

[ ] 7.4 Sitemap + Robots
    - app/sitemap.ts → dynamic sitemap with all sections
    - app/robots.ts → allow /, disallow /admin/, /api/

[ ] 7.5 Image optimization
    - All images use next/image
    - Alt text on every image (descriptive, includes keywords)
    - Priority on hero image
    - Width/height on all images (prevents CLS)
    - Lazy loading for below-fold images

[ ] 7.6 Heading hierarchy audit
    - Only ONE h1 per page
    - No skipped levels (h1 → h2 → h3)
    - Keywords in headings naturally

[ ] 7.7 Performance pass
    - next/font for font optimization
    - Analyze bundle size
    - Remove unused CSS/JS
    - Verify Core Web Vitals (LCP, FID, CLS)

[ ] 7.8 Verify
    - Run Lighthouse in Chrome DevTools
    - Performance > 90
    - Accessibility > 90
    - Best Practices > 90
    - SEO > 90
    - Run: bash rules/check.sh (seo-meta-tags, seo-headings, seo-images)
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `seo` | Metadata, Open Graph, JSON-LD, sitemap, robots, headings, alt text |
| `ui-components` | Image optimization, heading hierarchy |

### Full Docs to Read

- `skills/seo.md` — Next.js Metadata API, JSON-LD, sitemap, robots, image SEO
- `skills/ui-components.md` — Image optimization, heading patterns

### Files Created/Updated

```
frontend/
├── app/
│   ├── layout.tsx             (updated: full metadata)
│   ├── page.tsx               (updated: page metadata)
│   ├── sitemap.ts
│   ├── robots.ts
│   └── not-found.tsx
├── components/
│   └── structured-data.tsx    (JSON-LD schemas)
└── public/
    └── og-image.jpg           (1200x630)
```

---

## Phase 8: Production Deployment

**Goal:** App live on Vercel + Render with real domain.

### Tasks

```
[ ] 8.1 Prepare frontend for Vercel
    - Set NEXT_PUBLIC_API_URL to Render backend URL
    - Build: npm run build (verify no errors)
    - Deploy to Vercel (connect Git repo)
    - Configure env vars in Vercel dashboard

[ ] 8.2 Prepare backend for Render
    - Create Dockerfile (multi-stage, node:20-alpine)
    - Create .dockerignore
    - Create render.yaml (optional, IaC)
    - Test: docker build -t connect86-backend ./backend
    - Test: docker run -p 3001:3001 connect86-backend

[ ] 8.3 Setup Render PostgreSQL
    - Create PostgreSQL database on Render
    - Get internal connection string
    - Set DATABASE_URL in Render backend env

[ ] 8.4 Deploy backend to Render
    - Connect Git repo → Render Web Service
    - Runtime: Docker, path: ./backend
    - Set all env vars: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, CORS_ORIGIN, NODE_ENV, PORT
    - Run migrations: npm run db:migrate:prod
    - Verify: /health returns 200

[ ] 8.5 Domain + HTTPS
    - Connect custom domain in Vercel
    - HTTPS auto-enabled (Vercel)
    - Update CORS_ORIGIN in Render to production domain
    - WWW redirect configured

[ ] 8.6 Verify
    - Production URL loads
    - HTTPS works (green padlock)
    - Contact form submits → data in production DB
    - Admin login works → dashboard shows data
    - All pages load without errors
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `docker` | Dockerfile, docker-compose, Render deployment |
| `backend-api` | Production environment, Prisma migrations |
| `seo` | Final SEO check before go-live |

### Full Docs to Read

- `skills/docker.md` — Dockerfile, docker-compose, Render deployment, render.yaml
- `skills/backend-api.md` — Production environment, Prisma migrations
- `skills/seo.md` — Final SEO verification

### Files Created

```
backend/
├── Dockerfile
├── .dockerignore
└── render.yaml               (optional)

Root:
└── docker-compose.yml        (optional, for local Docker dev)
```

---

## Phase 9: Testing + Polish

**Goal:** Verified across all browsers/devices, audited and polished.

### Tasks

```
[ ] 9.1 Cross-browser testing
    - Chrome: all features work
    - Firefox: all features work
    - Safari: all features work
    - Edge: all features work

[ ] 9.2 Mobile responsive testing
    - iOS Safari: forms, nav, smooth scroll
    - Android Chrome: forms, nav, smooth scroll
    - Tablet: layout adjusts correctly
    - Touch targets: buttons > 44px, no overlap

[ ] 9.3 Form edge cases
    - Very long names (100+ chars) → handled
    - Special characters in names → handled
    - Emoji in messages → handled
    - Rapid tab switching → no data loss
    - Browser back/forward → form state preserved

[ ] 9.4 Admin edge cases
    - Session expiry during use → redirected to login
    - Multiple tabs open → sync auth state
    - No submissions → empty state shown
    - 1000+ submissions → table performs well
    - Sort by date → newest/oldest works

[ ] 9.5 Code quality audit
    - Invoke: frontend-code-review
    - Run: bash rules/check.sh
    - Fix all warnings
    - Remove console.log statements
    - Remove unused imports

[ ] 9.6 UI polish
    - Invoke: gral-frontend-design (scrutinio) → audit
    - Invoke: gral-frontend-design (lucida) → final polish
    - Invoke: agentation → collect UI feedback if needed
    - Fix spacing inconsistencies
    - Fix color contrast issues
    - Fix animation jank

[ ] 9.7 Verify
    - All acceptance criteria (PRD §6) pass
    - All rules/check.sh checks pass
    - No console errors in any browser
    - Mobile experience is smooth
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `frontend-code-review` | Code quality checklist, PR review |
| `gral-frontend-design` | scrutinio (audit), lucida (polish) |
| `agentation` | Visual UI feedback collection (optional) |

### Full Docs to Read

- `.gral/commands/scrutinio.md` — UI audit checklist
- `.gral/commands/lucida.md` — Final polish guidelines

---

## Phase 10: Legal + Monitoring

**Goal:** Production-ready — legal pages, analytics, monitoring, backups.

### Tasks

```
[ ] 10.1 Legal pages
    - Privacy Policy page (/privacy-policy)
    - Terms of Service page (/terms-of-service)
    - Footer links to both pages
    - Cookie consent banner (if using analytics)

[ ] 10.2 Analytics setup
    - Google Analytics or Vercel Analytics
    - Track page views, form submissions, CTA clicks
    - Verify data flowing

[ ] 10.3 Error tracking
    - Sentry or LogRocket setup
    - Verify errors captured
    - Alert threshold: > 1% error rate

[ ] 10.4 Uptime monitoring
    - UptimeRobot or BetterUptime on /health
    - Alert on downtime (email + SMS)
    - Status page (optional)

[ ] 10.5 Database backup verification
    - Verify Render automated backups enabled
    - Test restore procedure
    - Document recovery steps

[ ] 10.6 Production checklist review
    - Go through production-checklist.md
    - Check all boxes
    - Fix any gaps

[ ] 10.7 Verify
    - Privacy Policy accessible from footer
    - Analytics tracking events
    - Error tracking captures test error
    - Uptime monitor pings /health successfully
    - Backup restore tested
```

### Skills to Invoke

| Skill | Why |
|-------|-----|
| `seo` | Metadata for legal pages (title, description, robots) |
| `ui-components` | Legal page layout, footer links |

### Full Docs to Read

- `skills/seo.md` — Page metadata for legal pages
- `production-checklist.md` — Full production checklist (security, database, legal, monitoring)

### Reference

- `production-checklist.md` — Full checklist (security, database, legal, monitoring, infrastructure)

### Files Created

```
frontend/
├── app/
│   ├── privacy-policy/
│   │   └── page.tsx
│   └── terms-of-service/
│       └── page.tsx
└── components/
    └── cookie-consent.tsx
```

---

## Quick Reference

### How to Execute Each Phase

1. **Read essential files** (build-workflow.md Step 0):
   - `.trae/skills/INDEX.md` — Know all 13 skills
   - `prd.md` — Understand requirements
   - `production-checklist.md` — Know production requirements
2. **Invoke the skills** listed in the phase (never skip `ui-ux-pro-max` for UI work)
3. **Read the full skill docs** in `skills/*.md` for code examples (Rule C)
4. **Build the code** following skill patterns
5. **Run `bash rules/check.sh`** to validate against all rules
6. **Manually test** the phase verify steps
7. **Move to next phase**

### Phase Dependencies

```
Phase 1 (Scaffolding)
  └→ Phase 2 (Design System)
       └→ Phase 3 (Public Pages)
            ├→ Phase 4 (Backend API)
            │    └→ Phase 5 (Forms)
            │         └→ Phase 6 (Admin)
            │              └→ Phase 7 (SEO)
            │                   └→ Phase 8 (Deploy)
            │                        └→ Phase 9 (Test)
            │                             └→ Phase 10 (Legal)
```

### Tech Stack Summary

| Layer | Technology | Local | Production |
|-------|-----------|-------|------------|
| Frontend | Next.js 14+ (App Router) + TypeScript | localhost:3000 | Vercel |
| Backend | Express + TypeScript | localhost:3001 | Render (Docker) |
| Database | Prisma ORM | SQLite (dev.db) | PostgreSQL (Render) |
| UI | Tailwind CSS + shadcn/ui | - | - |
| Forms | React Hook Form + Zod | - | - |
| Auth | JWT + httpOnly cookies | - | - |

### Key Files Reference

| File | Purpose |
|------|---------|
| `prd.md` | Full requirements |
| `production-checklist.md` | Go-live checklist |
| `.trae/skills/INDEX.md` | All 13 skills |
| `skills/*.md` | Full skill documentation |
| `rules/check.sh` | Code quality validation |