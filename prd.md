# 86 Connect — Product Requirements Document

## 1. Application Overview

**Application Name:** 86 Connect

**Tagline:** Bridging the World to China

**Domain:** [the86connect.com](https://the86connect.com)

**Description:** A full-service digital platform providing two core services: **Study in China** assistance and **Product Sourcing from China**. The platform serves as a comprehensive gateway for international clients seeking educational opportunities or business procurement solutions in China. It includes a sophisticated admin dashboard, user authentication, consultation booking, real-time notifications, and full SEO optimization.

---

## 2. Technology Stack

| Layer | Technology | Local Dev | Production |
|-------|-----------|-----------|------------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript 6 | localhost:3000 | Vercel |
| Backend | Express + TypeScript 6 + Prisma ORM | localhost:3001 | Render (Docker) |
| Database | Prisma ORM (dual-schema) | SQLite (`dev.db`) | PostgreSQL (Render) |
| UI Components | shadcn/ui + Tailwind CSS 4 | — | — |
| Form Validation | React Hook Form + Zod | — | — |
| File Storage | Cloudinary + Cloudflare R2 | — | Production |
| Email | Resend (with console fallback) | — | Production |
| Monitoring | Sentry (client, server, edge) + Vercel Analytics | — | Production |
| Containerization | Docker + Docker Compose | Optional | Render |

---

## 3. Public Pages & Routes

### 3.1 Homepage (`/`)
Single-page application with smooth-scroll sections:
- **Hero Section** — Full-viewport hero with gradient/dark background, responsive image overlays (hero-banner-pc.jpg / hero-banner-phone.jpg), dual CTA cards ("Study in China" and "Source Products"), trust badges (Verified Partners, Scholarship Experts, 30+ Countries)
- **By The Numbers Section** — Animated statistics counters
- **Study in China Overview** — Service overview section
- **Product Sourcing Overview** — Service overview section
- **Video Gallery** — Embedded YouTube video gallery (shown if videos exist)
- **Testimonials** — Client success stories
- **About Us Section** — About page (`/about`) with company mission, values, team, and differentiators. Dedicated page with full metadata and OG images.
- **Contact Section** — General contact form + company info

### 3.2 Study in China (`/study-in-china`)
Comprehensive dedicated landing page with sticky sub-navigation:
- **Hero** — Tagline, dual CTAs (Start Application, View Universities), campus image collage (Tsinghua, campus life, modern facilities)
- **Overview** — Metrics (500+ Students, 98% Acceptance, 30+ Countries, 200+ Partner universities), 4-step process flow
- **Services** — 3 service cards: Scholarship Applications (98% success), University Admissions (200+ partners), Study Abroad Guidance (24/7 support)
- **Fees & Pricing** — 3 tiers: Application Fee ($750), Service/Project Fee ($2,500-$3,500 paid after admission), Supplementary Services ($1,500 optional)
- **Universities** — 12 partner universities in two tiers (Top-Tier: ZJU, SJTU, Fudan, Nanjing, Wuhan, Tongji; Mid-Tier: ECNU, BLCU, UIBE, Nanjing Medical, Jiangsu, ZJNU) with images, locations, programs
- **Scholarships** — 5 types (A: Full+Stipend to E: First-Year), CSCA entrance exam info
- **Video Gallery** — Filtered for study page
- **Testimonials** — Study-specific client stories
- **Requirements & Process** — Document checklist (10 items) + 9-step application timeline
- **Living in China** — 5 info cards (Cost, Economy, Work, Safety, Language)
- **FAQ** — Study-focused accordion
- **Apply** — Embedded study application form

### 3.3 Product Sourcing (`/product-sourcing`)
Comprehensive dedicated landing page with sticky sub-navigation:
- **Hero** — Tagline, dual CTAs, Track Quote link, image collage (factory, port, QC)
- **Overview** — Metrics (50K+ suppliers, 150+ Countries, $50M+ Trade volume, 24/7 Tracking) + 8 product categories
- **Services** — 3 cards: Supplier Finding, Procurement Assistance, Logistics Support
- **Service Models** — Partial-Service (for clients with existing suppliers) and Full-Service (complete project management)
- **Process** — 4-step: Requirements → Sourcing → Production & QC → Shipping
- **Costs** — 4 cost info cards (CBM, Flat-Rate Shipping, Warehouse, Revenue Model) + Value Proposition grid
- **PDF Download** — Company Profile PDF
- **Video Gallery** — Filtered for sourcing page
- **Testimonials** — Sourcing-specific stories
- **FAQ** — Sourcing-focused accordion
- **Inquire** — Embedded sourcing inquiry form

### 3.4 FAQ (`/faq`)
Full FAQ page with all sections:
- Study in China General
- Study in China Admissions
- Product Sourcing General
- Product Sourcing Process

### 3.5 Resources (`/resources`, `/resources/[slug]`)
Blog/resource listing with pagination (8 posts per page) and individual article pages with TipTap rich content. Homepage shows 3 most recent articles.

### 3.6 About (`/about`)
Dedicated about page with company mission, values, team, and competitive differentiators. Full metadata and Open Graph image for social sharing.

### 3.7 Application Tracking (`/study-in-china/track-application`)
User enters reference code + email to view 6-stage application timeline.

### 3.8 Quote Tracking (`/product-sourcing/track-quote`)
User enters reference code + email to view 6-stage sourcing timeline.

### 3.9 Consultation Booking (`/book-consultation`)
Slot-based booking page with timezone-aware calendar.

### 3.10 Legal Pages
- Privacy Policy (`/privacy-policy`)
- Terms of Service (`/terms-of-service`)
- Security Policy (`/security-policy`)

---

## 4. User Authentication (Client-Facing)

### 4.1 Registration (`/signup`)
- Email, name, password, optional phone
- Reclaims auto-created accounts (users created via form submission without password)
- Rate-limited: 3 registrations per 5 minutes per IP

### 4.2 Login (`/login`)
- Email + password login
- Rate-limited: 4 failed attempts per 2 minutes
- Brute-force protection: `LoginAttempt` table tracks IP + email, locks for 15 minutes after 5 failures
- Soft-deleted accounts are blocked

### 4.3 Password Management
- **Set Password** (`/set-password`) — Auto-created users set their first password via JWT token
- **Forgot Password** (`/forgot-password`) — Email-based reset link (1-hour expiry), generic success to prevent enumeration
- **Reset Password** (`/reset-password`) — Hashed URL fragment pattern, JWT verification, auto-login after reset
- **Change Password** — `PATCH /api/auth/password` — Requires current + new password (min 8 chars)

### 4.4 User Account (`/account`)
- View profile (name, email, phone)
- View all submissions with status and reference codes
- View all consultation bookings with status
- Unread notification count badge

### 4.5 Notifications
- In-app notifications for submission status changes and consultation updates
- Read/unread management
- Pollable unread count endpoint

### 4.6 GDPR Compliance
- **Export** — `GET /api/auth/export` — All user data as structured JSON
- **Delete** — `DELETE /api/auth/account` — Soft delete with 7-day grace period

---

## 5. Admin Panel

### 5.1 Authentication
- **Login** (`/admin/login`) — Password-only authentication
- **JWT Sessions** — httpOnly cookies with `.the86connect.com` domain for cross-subdomain access
- **Session Management** — Max 4 concurrent admin sessions per user, device tracking (IP, user-agent, device name)
- **Subdomain Routing** — `admin.the86connect.com` rewrites to `/admin/*` via middleware
- **Bootstrapping** — Falls back to `ADMIN_PASSWORD` env var when no `AdminUser` exists in DB
- **Role-Based Access** — `admin` vs `superadmin` roles

### 5.2 Dashboard Tabs (8 total)

**Overview** — Count cards (Total submissions, Unread, Study, Sourcing, Users, Videos), activity stats, recent submissions, status distribution, data maintenance (soft-delete purge controls)

**Submissions** — Paginated table with filters (Service, Status, Read/Unread, Date range, Search), bulk actions (mark read, delete, update status), CSV export, DOCX export with watermark and Cloudinary image links, attachment download proxy, 6-stage status pipelines:
- Study: `submitted` → `under_review` → `matched` → `verified` → `decision` → `visa`
- Sourcing: `received` → `sourcing` → `quotes` → `sample` → `confirmed` → `shipping`

**Submission Notes** — Internal admin notes on each submission (create, read, delete)

**Consultations** — Paginated list with filters, status management (pending/confirmed/rescheduled/completed/cancelled), bulk operations, CSV export

**Users** — View all registered users with submission counts, stats, create/edit/delete/reset-password

**Sessions** — View/revoke active admin sessions, logout everywhere except current device

**Availability** — Full CRUD for consultation time slots, bulk creation (date range + time range + days of week), status filtering, admin slot booking for clients, calendar view

**Blog Posts** — Full CRUD for blog articles with TipTap rich text editor, categories, SEO metadata (title, description, keywords), image upload, publish/unpublish toggle, date management

**Videos** — CRUD for YouTube videos, page assignment (study/sourcing), reorder, YouTube URL auto-parsing

### 5.3 Real-Time Updates (SSE)
Authenticated Server-Sent Events stream broadcasting: new submissions, status changes, new consultations, new bookings, deletions — all delivered in real-time to the admin dashboard.

---

## 6. Forms & Submissions

### 6.1 Study Application Form
**Fields:** First name, Last name, Email, Phone, Country, Target University, Program Level (Bachelor/Master/PhD), Field of Study, Start Year, Scholarship Interest, Budget Range, English Proficiency, Message
**Files:** Up to 15 attachments (images, PDFs, DOC/XLS), 10MB each
**Features:** Auto-creates user account, generates reference code (STU-XXXXXX), 3-stage rate limiting, bot protection

### 6.2 Sourcing Inquiry Form
**Fields:** Name, Email, Phone, Company, Country, Product Category, Product Name, Product Description, Target Quantity, Target Price, Product Links, Timeline, Shipping Terms, Destination Port, Message
**Files:** Up to 15 attachments
**Features:** Auto-creates user account, generates reference code (SOU-XXXXXX), rate limiting, bot protection

### 6.3 Contact / General Inquiry Form
**Fields:** Name, Email, Phone (optional), Service Interest (Study/Sourcing/General), Message
**Features:** CTA pre-selection, generates reference code, rate limiting

### 6.4 Shared Form Features
- Zod validation (frontend + server-side)
- React Hook Form integration
- File uploads to Cloudinary / Cloudflare R2
- Auto-save for partially completed forms
- Submission throttling
- Cooldown messages after excessive submissions
- Admin email notification on every new submission
- Real-time SSE broadcast to admin dashboard
- Status history tracking (JSON array with timestamps)
- Email + in-app notification on status changes

---

## 7. Consultation Booking System

### 7.1 Booking Flow
1. User navigates to `/book-consultation`
2. Selects date (tomorrow through 3 months out)
3. Chooses time slot (China Standard Time, displayed in user's local timezone)
4. Fills name, email, phone, service interest, optional message
5. Confirms booking (double-booking prevented via database transactions)
6. Receives confirmation with WhatsApp chat link

### 7.2 Availability Management
- Admin creates slots: single or bulk (date range + time range + day filtering)
- Slot statuses: available, booked, blocked
- Automatic cleanup of past slots (every hour)
- User cancellation frees the slot
- Admin can book for clients

### 7.3 Notifications
- Email to user: booking confirmation, status changes, cancellation
- Email to admin: new booking, cancellations
- In-app notification for linked users

---

## 8. File Storage & Attachments

- **Primary:** Cloudinary (images, documents)
- **Secondary:** Cloudflare R2 (S3-compatible)
- **Upload:** Multi-file (up to 15), single-file legacy, 10MB max per file
- **Supported MIME types:** JPEG, PNG, GIF, WebP, BMP, SVG, HEIC, HEIF, AVIF, TIFF, PDF, DOC, DOCX, XLS, XLSX, TXT
- **Admin access:** Downloads proxied through backend for security
- **Cleanup:** Files deleted when submissions are deleted, orphan cleanup via cascade

---

## 9. Video Gallery

- YouTube videos managed via admin panel
- Assigned to "study" or "sourcing" page
- Embedded as YouTube iframes with thumbnails
- Supports all YouTube URL formats (watch, share, embed, shorts)
- Video ordering via reorder endpoint

---

## 10. Email Notifications

All emails sent via Resend (with console fallback for development). Types:

| Notification | Trigger | Recipient |
|-------------|---------|-----------|
| New Submission | Any form submitted | Admin |
| Status Change | Admin updates submission status | User |
| New Consultation | User books consultation | Admin |
| Booking Confirmation | User books consultation | User |
| Consultation Update | Admin updates booking | User |
| Booking Cancellation | User cancels booking | User + Admin |
| Password Reset | User requests reset | User |

---

## 11. SEO & Structured Data

### 11.1 Meta Tags
- Per-page Open Graph and Twitter Cards (1200×630 images)
- 20+ keywords for "Study in China" and "Product Sourcing from China"
- Canonical URLs and alternate language links (en, zh)
- Geo tags (Beijing coordinates, region)
- Search engine verification (Google, Yandex, Baidu, Bing)

### 11.2 Structured Data (JSON-LD)
Six schema types embedded as JSON-LD:
1. **Organization** — Logo, address (Beijing Chaoyang), founding date (2023-11-23), social profiles
2. **WebSite** — SearchAction, languages
3. **ProfessionalService (LocalBusiness)** — Geo coordinates, opening hours, price range
4. **ItemList (Services)** — Two Service objects
5. **FAQPage** — 5 Q&A pairs
6. **BreadcrumbList** — Site hierarchy

### 11.3 Other SEO Artifacts
- Dynamic `robots.txt` generation
- Dynamic `sitemap.xml` generation
- Multiple favicon sizes, apple-icon
- Custom Open Graph image

---

## 12. Security

### 12.1 CSRF Protection
Double-submit cookie pattern on all non-GET/HEAD/OPTIONS requests.

### 12.2 Rate Limiting (6 tiers)
| Tier | Limit | Window |
|------|-------|--------|
| General API | 100 | 15 min |
| Login | 4 | 2 min |
| Admin Login | 3 | 2 min |
| Registration | 3 | 5 min |
| File Uploads | 20 | 15 min |
| Form Submissions | 3 | 3 min |

Submission cooldown: 4 minutes after exceeding 3 submissions in 3 minutes.

### 12.3 Other Security Measures
- Helmet security headers with Content Security Policy (CSP)
- CORS with dynamic origin validation + credentials
- httpOnly cookies with Secure, SameSite, Domain scoping
- Bot protection via honeypot fields
- Brute-force protection (LoginAttempt tracking, in-memory + database)
- Non-root Docker user
- Content compression with SSE stream exclusion
- Request timeout (30s on all routes)
- JSON body limit (100kb)
- Structured JSON request logging (method, path, status, duration, IP)
- Database connection retry at startup (3 attempts, 5s delay)
- Graceful shutdown with SIGTERM handling (9s timeout)
- PostgreSQL connection pool: 20 max connections, 10s timeout
- Prisma transaction timeouts: 10s max wait, 20s max duration
- In-memory tracker Maps capped at 10,000 entries (prevents memory leaks)
- React ErrorBoundary component with fallback UI and Sentry integration

---

## 13. UI/UX Components

### 13.1 Layout Components
- **Navbar** — Responsive (desktop/tablet/mobile), scroll-aware (transparent → white), active section tracking, mobile bottom tab bar (6 tabs), mobile slide-down menu with keyboard escape
- **Page Navbar** — Sticky sub-navigation for landing pages with anchor links
- **Footer** — Dual logos, quick links, contact info, back-to-top, developer credit
- **Admin Sidebar** — Collapsible, tab-navigated, glass morphism design
- **Cookie Consent** — EU-compliant banner
- **WhatsApp Button** — Floating CTA with +86 176 1153 3296
- **Booking Popup** — Consultation booking CTA
- **Navigation Progress** — Top page loading bar
- **Scroll Arrow** — Scroll-to-top button

### 13.2 UI Components (30+ shadcn/ui + custom)
Button, Input, Textarea, Label, Form, Toaster (Sonner), Confirm Dialog, Skeleton, ImageWithSkeleton, Calendar (booking + admin), Date Picker (horizontal scrollable), Time Slots (selection grid), ErrorBoundary, AnimatedCounter, FileUpload, Accordion, Tabs, Card, Badge, Avatar, Dropdown Menu, Dialog, Sheet, Table, Pagination, SearchInput, Select, RadioGroup, Checkbox, Switch, Slider, Progress

### 13.3 Design Tokens
- **Fonts:** Nunito (400-900, body), DM Sans (400-700, display)
- **Colors:** Primary Red (#DC2626), dark backgrounds (#0b0f1a → black), white cards
- **Styling:** Tailwind CSS 4, responsive breakpoints, glass morphism effects

---

## 14. Infrastructure

### 14.1 Deployment Architecture
```
Vercel (Frontend) ──→ api.the86connect.com (Custom Domain) ──→ Render (Backend+Docker) ──→ Render PostgreSQL
       │                                                                               
       ├── the86connect.com (main site)                                               
       └── admin.the86connect.com (admin panel, via middleware rewrite)               
```

### 14.2 Docker
- Multi-stage Dockerfile (deps → build → production)
- Non-root user, health check via wget
- Docker Compose for local production testing (PostgreSQL + Backend)
- Render Blueprint (`render.yaml`) for infrastructure-as-code

### 14.3 CI/CD
- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Vercel auto-deploy from Git
- Render auto-deploy from Git (Docker)

### 14.4 Scheduled Tasks
- Past availability slot cleanup (every hour)
- Soft-delete purge (every 6 hours, 7-day grace)
- Login attempt cleanup
- Submission tracker cleanup
- Database connection retry at startup (3 attempts, 5s delay)

---

## 15. Database Models (11 total)

| Model | Purpose |
|-------|---------|
| `User` | Client-facing user accounts with password hashing |
| `Submission` | All form submissions (contact, study, sourcing) with status history |
| `SubmissionNote` | Admin internal notes on submissions |
| `Attachment` | Files linked to submissions (Cloudinary/R2) |
| `Consultation` | Consultation booking records |
| `AvailabilitySlot` | Bookable time slots |
| `Video` | YouTube video entries |
| `BlogPost` | Blog articles with TipTap rich content, categories, SEO metadata |
| `Notification` | In-app user notifications |
| `LoginAttempt` | Brute-force protection tracking |
| `AdminUser` | Admin user accounts with roles |

---

## 16. Business Rules

### 16.1 Reference Codes
- Study applications: `STU-XXXXXX`
- Sourcing inquiries: `SOU-XXXXXX`
- Unique constraint with auto-retry on collision

### 16.2 Soft Delete Policy
- Users, Submissions, Consultations: soft delete with `deletedAt` timestamp
- Auto-purged after 7 days
- Cascade: soft-deleting a user soft-deletes their submissions and consultations

### 16.3 Email Sending
- Fire-and-forget (errors logged, not blocking responses)
- Console fallback when Resend API key not configured

---

## 17. Environment Variables

### Frontend (Vercel)
| Variable | Purpose |
|----------|---------|
| `BACKEND_PROXY_URL` | Backend API URL for middleware proxying |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `SENTRY_ORG` | Sentry organization |
| `SENTRY_PROJECT` | Sentry project |
| `SENTRY_AUTH_TOKEN` | Sentry auth token |

### Backend (Render)
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string with pool params (`?connection_limit=20&pool_timeout=10`) |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_PASSWORD` | Bootstrap admin password |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `COOKIE_DOMAIN` | Cookie domain for cross-subdomain access |
| `PORT` | Server port (3001) |
| `CLOUDINARY_*` | Cloudinary credentials |
| `R2_*` | Cloudflare R2 credentials |
| `RESEND_API_KEY` | Email API key |
| `NOTIFY_EMAIL` | Admin notification email |
| `FROM_EMAIL` | Sender email address |
