# Admin Subdomain Authentication Fix - Product Requirement Document

## Overview
- **Summary**: Diagnose and fix the admin subdomain (`admin.the86connect.com`) authentication and routing issues. The admin subdomain currently returns `DEPLOYMENT_NOT_FOUND` (404) for API calls, preventing admin login. This project systematically audits all 12 diagnostic categories from the master checklist and resolves identified issues.
- **Purpose**: The admin panel is inaccessible via the admin subdomain, blocking all backend management workflows. Admin authentication must work seamlessly on both `admin.the86connect.com` and `the86connect.com/admin`.
- **Target Users**: Admin users accessing the dashboard via `admin.the86connect.com`

## Goals
- Fix `DEPLOYMENT_NOT_FOUND` 404 error on `admin.the86connect.com/api/*`
- Ensure admin login works end-to-end on the admin subdomain
- Verify cookie sharing works correctly between main domain and admin subdomain
- Confirm CORS configuration supports the admin subdomain
- Validate middleware subdomain detection and routing
- Document all infrastructure requirements for Vercel + Render setup

## Non-Goals (Out of Scope)
- Creating a separate Vercel deployment for the admin subdomain (single deployment with subdomain routing)
- Migrating backend from Render to Vercel
- Implementing OAuth or SSO for admin login
- Mobile app for admin panel
- Admin UI redesign (glass morphism is already in place)

## Background & Context
- **Current Architecture**:
  - Frontend: Next.js 16 on Vercel (single deployment)
  - Backend: Express + TypeScript + Prisma on Render
  - Admin subdomain routing via Next.js middleware (`middleware.ts`)
  - API proxying via both `vercel.json` rewrites AND middleware (potential conflict)
  - Cookie-based auth with JWT in httpOnly cookies
  - Cookie domain set to `.the86connect.com` for cross-subdomain sharing

- **Error Observed**:
  - URL: `https://admin.the86connect.com/api/admin/login`
  - Status: 404 NOT_FOUND
  - Code: `DEPLOYMENT_NOT_FOUND`
  - ID: `hnd1:hnd1::srcxd-1783370123796-fa5ff7ab9260`
  - This is a Vercel infrastructure-level error, not an application error

- **Key Files**:
  - `frontend/src/middleware.ts` - Subdomain routing + API proxy
  - `frontend/vercel.json` - Vercel-specific rewrites
  - `frontend/next.config.ts` - Next.js configuration
  - `backend/src/routes/admin.ts` - Admin auth routes
  - `backend/src/index.ts` - CORS + cookie configuration

## Functional Requirements
- **FR-1**: Admin subdomain (`admin.the86connect.com`) must serve the admin panel pages
- **FR-2**: Admin subdomain API calls (`/api/admin/*`) must proxy to the Render backend
- **FR-3**: Admin login must authenticate successfully and set the `admin_token` cookie
- **FR-4**: The `admin_token` cookie must be accessible on both `admin.the86connect.com` and `the86connect.com`
- **FR-5**: Admin dashboard pages must be protected (redirect to login if no valid cookie)
- **FR-6**: CSRF token must work correctly on the admin subdomain
- **FR-7**: Main domain `/admin` path must continue to work alongside the subdomain

## Non-Functional Requirements
- **NFR-1 (Performance)**: Admin subdomain page load time must match main domain performance
- **NFR-2 (Security)**: Auth cookies must use `httpOnly`, `secure`, `sameSite`, and proper `Domain` attributes
- **NFR-3 (Reliability)**: API proxy must work for all routes on both main domain and admin subdomain
- **NFR-4 (Compatibility)**: Must work across all modern browsers with default cookie settings
- **NFR-5 (Maintainability)**: No duplicate proxy configurations (middleware vs vercel.json) — single source of truth

## Constraints
- **Technical**:
  - Next.js 16 App Router with middleware
  - Single Vercel deployment serving both domains
  - Render backend with PostgreSQL
  - JWT-based authentication with httpOnly cookies
  - CSRF protection via double-submit cookie pattern
- **Business**:
  - Must not break existing main domain functionality
  - Must preserve current admin authentication flow
- **Dependencies**:
  - Vercel DNS configuration for `admin.the86connect.com`
  - Vercel project domain settings
  - Render backend environment variables (CORS_ORIGIN, COOKIE_DOMAIN)
  - Cloudinary for file storage (unchanged)

## Assumptions
- Vercel project has `admin.the86connect.com` added as a domain alias
- DNS CNAME record for `admin.the86connect.com` points to Vercel
- Render backend `CORS_ORIGIN` includes both `https://the86connect.com` and `https://admin.the86connect.com`
- Cookie `Domain` is set to `.the86connect.com` (with leading dot) for cross-subdomain access
- Middleware `matcher` includes all routes that need subdomain detection

## Acceptance Criteria

### AC-1: Admin Subdomain Serves Admin Pages
- **Given**: The user navigates to `https://admin.the86connect.com/login`
- **When**: The page loads
- **Then**: The admin login page is displayed without 404 error
- **Verification**: `human-judgment`

### AC-2: Admin Subdomain API Proxy Works
- **Given**: The user is on `https://admin.the86connect.com/login`
- **When**: A POST request is made to `/api/admin/login`
- **Then**: The request is proxied to the Render backend and returns a valid response (200, 401, or 429, but not 404)
- **Verification**: `programmatic`

### AC-3: Admin Login Succeeds on Subdomain
- **Given**: Valid admin credentials
- **When**: Admin logs in via `https://admin.the86connect.com/login`
- **Then**: 
  - Response status is 200
  - `admin_token` cookie is set with correct attributes
  - User is redirected to admin dashboard
- **Verification**: `programmatic`

### AC-4: Cookie Shared Across Subdomains
- **Given**: Admin is logged in on `admin.the86connect.com`
- **When**: User navigates to `https://the86connect.com/admin`
- **Then**: User remains authenticated (no redirect to login)
- **Verification**: `programmatic`

### AC-5: Main Domain Admin Path Still Works
- **Given**: Valid admin credentials
- **When**: Admin logs in via `https://the86connect.com/admin/login`
- **Then**: Login succeeds and dashboard loads
- **Verification**: `programmatic`

### AC-6: CSRF Protection Works on Subdomain
- **Given**: Admin is on `admin.the86connect.com/login`
- **When**: Login form is submitted
- **Then**: CSRF token is included in request and validated by backend
- **Verification**: `programmatic`

### AC-7: No Duplicate Proxy Configuration
- **Given**: The codebase has API proxying
- **When**: Reviewing proxy configurations
- **Then**: There is a single source of truth for API proxying (not both vercel.json and middleware)
- **Verification**: `human-judgment`

### AC-8: Vercel Deployment Configuration Verified
- **Given**: The Vercel project settings
- **When**: Checking domain configuration
- **Then**: `admin.the86connect.com` is listed as a verified domain with valid SSL
- **Verification**: `human-judgment`

## Open Questions
- [ ] Is `admin.the86connect.com` currently added as a domain in the Vercel project settings?
- [ ] What is the current `CORS_ORIGIN` value on the Render backend?
- [ ] Is `COOKIE_DOMAIN` explicitly set on the Render backend, or does it use the default?
- [ ] Was `admin.the86connect.com` previously working, or is this a new setup?
- [ ] Are there any Vercel Edge middleware limitations that might affect subdomain routing?
- [ ] Does the vercel.json rewrite for `/api/:path*` conflict with middleware proxying?
