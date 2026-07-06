# Admin Subdomain Authentication Fix - Verification Checklist

## Infrastructure & DNS
- [ ] `admin.the86connect.com` is added as a verified domain in Vercel project settings
- [ ] DNS CNAME record for `admin.the86connect.com` points to Vercel (`cname.vercel-dns.com`)
- [ ] SSL certificate is provisioned for `admin.the86connect.com` in Vercel
- [ ] Render backend is accessible at its configured URL

## Middleware & Routing
- [x] `middleware.ts` correctly detects `admin.the86connect.com` from host header
- [x] Middleware matcher includes `/api/*` routes for proxying
- [x] Middleware handles host header variations (with/without port, www prefix)
- [x] Admin subdomain rewrites to `/admin/*` path correctly
- [x] API routes are proxied to backend on both main domain and admin subdomain
- [x] Static assets (`_next`, `favicon`, `og-image`, `fonts`) are excluded from subdomain rewrite
- [x] `robots.txt` and `sitemap.xml` work correctly on both domains

## API Proxy
- [x] Single source of truth for API proxying (not both vercel.json and middleware)
- [ ] `/api/*` requests return correct responses (not 404 DEPLOYMENT_NOT_FOUND)
- [x] `/health` endpoint is proxied correctly
- [x] POST, GET, PATCH, DELETE methods all work through proxy
- [x] Request headers are correctly forwarded to backend
- [x] Response headers (including Set-Cookie) are correctly returned to client
- [x] Request body is correctly forwarded (JSON parsing works)

## Cookie Configuration
- [x] `admin_token` cookie has `httpOnly: true`
- [x] `admin_token` cookie has `secure: true` in production
- [x] `admin_token` cookie has `sameSite: "lax"` (appropriate for same-origin proxy)
- [x] `admin_token` cookie has `domain: ".the86connect.com"` for cross-subdomain access
- [x] `admin_token` cookie has `path: "/"`
- [x] Cookie `maxAge` is set to 24 hours
- [ ] Cookie is correctly set on both `the86connect.com` and `admin.the86connect.com`
- [ ] Cookie is accessible on both subdomains after login

## CORS Configuration
- [ ] Backend CORS allows `https://the86connect.com`
- [ ] Backend CORS allows `https://admin.the86connect.com`
- [x] CORS preflight (OPTIONS) requests return 200 with correct headers
- [x] `Access-Control-Allow-Credentials: true` is set
- [x] CORS error responses also include CORS headers
- [x] `CORS_ORIGIN` env var is documented in `.env.example`

## CSRF Protection
- [x] CSRF cookie is set with correct domain for cross-subdomain access
- [ ] CSRF token endpoint works on admin subdomain
- [x] POST requests include `X-CSRF-Token` header
- [x] Backend validates CSRF token correctly
- [x] CSRF middleware skips GET/HEAD/OPTIONS methods

## Authentication Flow
- [ ] Admin login page loads on `admin.the86connect.com/login`
- [ ] Admin login API returns 200 with valid credentials
- [ ] Admin login API returns 401 with invalid credentials
- [ ] Admin login API returns 429 after too many attempts
- [ ] `admin_token` cookie is set after successful login
- [ ] Admin dashboard loads after login
- [ ] Protected routes redirect to login when not authenticated
- [ ] Logout clears the cookie correctly

## Cross-Subdomain Functionality
- [ ] Login on `admin.the86connect.com` persists on `the86connect.com/admin`
- [ ] Login on `the86connect.com/admin` persists on `admin.the86connect.com`
- [ ] Logout on one subdomain logs out on the other
- [ ] CSRF token works across subdomains

## Main Domain Regression
- [ ] Main domain (`the86connect.com`) pages load correctly
- [ ] Main domain API calls work correctly
- [ ] Main domain `/admin` path still works
- [ ] Main domain user authentication still works
- [ ] Contact form submission still works
- [ ] Study application form still works
- [ ] Product sourcing form still works

## Build & Deploy
- [x] Frontend builds successfully
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] Middleware is correctly detected by Next.js build
- [x] `BACKEND_PROXY_URL` env var is documented
