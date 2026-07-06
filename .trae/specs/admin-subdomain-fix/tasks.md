# Admin Subdomain Authentication Fix - Implementation Plan

## [x] Task 1: Audit Current Middleware Configuration
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Review `frontend/src/middleware.ts` for subdomain detection logic
  - Verify the matcher pattern covers all necessary routes
  - Check if API proxying in middleware works for both main domain and admin subdomain
  - Verify host header parsing handles edge cases (port numbers, www prefix)
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: Middleware build compiles without errors
  - `programmatic` TR-1.2: Matcher pattern includes `/api/*` routes
  - `human-judgement` TR-1.3: Host detection logic handles Vercel production host format
- **Notes**: The `DEPLOYMENT_NOT_FOUND` error suggests Vercel infrastructure issue, but middleware should be verified regardless

## [/] Task 2: Resolve Duplicate API Proxy Configuration
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Remove duplicate API proxy from `vercel.json` since middleware now handles it
  - OR remove API proxy from middleware and keep vercel.json (decide which is more reliable)
  - Ensure single source of truth for API routing
  - Update `BACKEND_PROXY_URL` env var documentation
- **Acceptance Criteria Addressed**: AC-2, AC-7, NFR-5
- **Test Requirements**:
  - `programmatic` TR-2.1: API requests return correct responses (not 404)
  - `human-judgement` TR-2.2: Only one proxy configuration exists in the codebase
- **Notes**: Middleware proxy is preferred because it works both locally and on Vercel, and handles subdomain routing

## [x] Task 3: Fix Middleware Host Detection for Production
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Make host detection more robust for Vercel production environment
  - Handle cases where host includes port number
  - Handle `www.admin.the86connect.com` edge case
  - Add support for `NEXT_PUBLIC_SITE_URL` env var for domain configuration
  - Ensure middleware runs on Edge runtime correctly
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: Host parsing correctly extracts domain without port
  - `programmatic` TR-3.2: Middleware handles both `admin.the86connect.com` and `the86connect.com`
  - `human-judgement` TR-3.3: Edge runtime compatibility verified
- **Notes**: Vercel may send host header with port or in different formats

## [x] Task 4: Verify Cookie Configuration for Cross-Subdomain Access
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Review `backend/src/routes/admin.ts` cookie options
  - Verify `Domain` attribute is set to `.the86connect.com` (with leading dot)
  - Verify `SameSite` attribute is appropriate (lax for same-site, none for cross-site)
  - Verify `Secure` flag is set correctly in production
  - Verify `Path` is set to `/`
  - Check `COOKIE_DOMAIN` env var usage
- **Acceptance Criteria Addressed**: AC-3, AC-4, NFR-2
- **Test Requirements**:
  - `programmatic` TR-4.1: Cookie domain is `.the86connect.com` in production
  - `programmatic` TR-4.2: Cookie has httpOnly, secure, sameSite attributes
  - `human-judgement` TR-4.3: Cookie settings match security best practices
- **Notes**: Since API is proxied through same domain, SameSite=Lax should work fine

## [x] Task 5: Verify CORS Configuration for Admin Subdomain
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Review `backend/src/index.ts` CORS configuration
  - Verify `CORS_ORIGIN` env var includes both `https://the86connect.com` and `https://admin.the86connect.com`
  - Check if CORS preflight (OPTIONS) is handled correctly
  - Verify credentials: true is set
  - Add CORS_ORIGIN to `.env.example` if missing
- **Acceptance Criteria Addressed**: AC-3, AC-6
- **Test Requirements**:
  - `programmatic` TR-5.1: CORS origin check accepts admin subdomain
  - `programmatic` TR-5.2: Preflight OPTIONS requests return 200 with correct headers
  - `human-judgement` TR-5.3: CORS configuration is documented in .env.example
- **Notes**: Since API is proxied through same domain via middleware, CORS may not be strictly necessary, but should be correct for direct API access

## [x] Task 6: Verify CSRF Token Works on Admin Subdomain
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - Review CSRF middleware (`backend/src/middleware/csrf.ts`)
  - Verify CSRF cookie is set with correct domain for cross-subdomain access
  - Verify frontend CSRF token fetch works on admin subdomain
  - Check `frontend/src/lib/api.ts` CSRF handling
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: CSRF token cookie is accessible on admin subdomain
  - `programmatic` TR-6.2: POST requests include X-CSRF-Token header
  - `human-judgement` TR-6.3: CSRF flow is documented
- **Notes**: Double-submit cookie pattern should work across subdomains if cookie domain is correct

## [x] Task 7: Add Vercel Infrastructure Documentation
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - Document Vercel domain setup requirements for admin subdomain
  - Document DNS CNAME configuration
  - Document required environment variables on both Vercel and Render
  - Add troubleshooting section for common issues (DEPLOYMENT_NOT_FOUND, etc.)
  - Create/update `.env.example` files with all required vars
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-7.1: Documentation covers all infrastructure setup steps
  - `human-judgement` TR-7.2: Troubleshooting section covers DEPLOYMENT_NOT_FOUND error
  - `programmatic` TR-7.3: .env.example files are up to date
- **Notes**: The DEPLOYMENT_NOT_FOUND error is primarily an infrastructure issue

## [/] Task 8: End-to-End Testing and Verification
- **Priority**: high
- **Depends On**: Tasks 2, 3, 4, 5, 6
- **Description**:
  - Test admin login on main domain path (`/admin/login`)
  - Test admin login on admin subdomain (`admin.the86connect.com/login`)
  - Verify cookie persistence across subdomains
  - Test all admin API endpoints on both domains
  - Test CSRF token flow
  - Verify no regression on main domain functionality
- **Acceptance Criteria Addressed**: AC-1 through AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: Admin login returns 200 on admin subdomain
  - `programmatic` TR-8.2: Admin dashboard loads after login on admin subdomain
  - `programmatic` TR-8.3: Cookie is present on both subdomains
  - `programmatic` TR-8.4: Main domain admin path still works
  - `human-judgement` TR-8.5: Full admin workflow verified manually
- **Notes**: Use browser automation for verification where possible
