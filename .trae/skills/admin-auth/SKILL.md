---
name: admin-auth
description: "Admin authentication patterns for the 86 Connects project. JWT-based auth with httpOnly cookies using Next.js App Router. Covers AuthProvider context, useAuth hook, ProtectedRoute component, login/logout flows, and Next.js middleware for route protection. Use when implementing admin login, protecting admin routes, or managing admin sessions."
---

# Admin Authentication Skill

**Full documentation:** Read `skills/admin-auth.md` for complete patterns, code examples, and setup instructions.

## Quick Reference

### When to use this skill
- Admin login page (`/admin/login`)
- Protecting admin dashboard routes (`/admin`)
- Managing admin session with JWT + httpOnly cookies
- Logout functionality

### Architecture
- **Auth flow:** Password → Express login endpoint → JWT in httpOnly cookie → Frontend checks cookie
- **Route protection:** Next.js middleware checks cookie → redirects to `/admin/login` if missing
- **Session:** JWT expires in 24 hours, stored in httpOnly cookie (not localStorage)

### Key Components
- `AuthProvider` — Wraps app root, provides auth context
- `useAuth()` — Hook for `isAuthenticated`, `isLoading`, `login()`, `logout()`
- `ProtectedRoute` — Wraps admin pages, redirects if not authenticated
- `middleware.ts` — Server-side route protection for `/admin` routes

### API Endpoints
- `POST /api/admin/login` — Authenticates with password, sets httpOnly cookie
- `POST /api/admin/logout` — Clears cookie
- `GET /api/admin/submissions` — Protected, requires valid cookie

### Related Rules
- `admin-route-protection.yml` — Admin route protection enforcement
- `use-client-directive.yml` — 'use client' directive requirement
- `useAuth.yml` — useAuth hook usage detection
- `authProvider.yml` — AuthProvider wrapper check