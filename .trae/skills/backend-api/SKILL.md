---
name: backend-api
description: "Backend API and database patterns for the 86 Connects project. Uses Express + TypeScript + Prisma ORM with SQLite for local development and PostgreSQL on Render for production. Covers API endpoints (/api/contact, /api/admin), Prisma schema setup (dual schema for dev/prod), JWT auth middleware, database migrations, and environment configuration. Use when building backend API endpoints, database operations, or setting up local development with SQLite."
---

# Backend API & Database Skill

**Full documentation:** Read `skills/backend-api.md` for complete patterns, code examples, and setup instructions.

## Quick Reference

### When to use this skill
- Building backend API endpoints for contact form submission
- Retrieving submissions for the admin dashboard
- Database operations with Prisma ORM
- Setting up local development with SQLite
- Deploying to Render with PostgreSQL

### Architecture
- **Local:** Next.js (localhost:3000) → Express API (localhost:3001) → SQLite (dev.db)
- **Production:** Next.js (Vercel) → Express API (Render) → PostgreSQL (Render)

### Key Commands
- `npm run dev` — Start backend with hot reload (SQLite)
- `npm run db:migrate:dev` — Run SQLite migrations
- `npm run db:migrate:prod` — Deploy PostgreSQL migrations
- `npm run db:studio:dev` — Open Prisma Studio (SQLite)

### Environment Variables
- `DATABASE_URL` — `file:./dev.db` (dev) or `postgresql://...` (prod)
- `JWT_SECRET` — JWT signing secret
- `ADMIN_PASSWORD` — Admin login password
- `CORS_ORIGIN` — Frontend origin URL
- `PORT` — Server port (default 3001)

### Related Rules
- `api-form-submission.yml` — Contact form POST validation
- `express-body-parsing.yml` — Express body parsing middleware check
- `admin-route-protection.yml` — Admin route protection