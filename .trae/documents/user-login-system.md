# User Login System — Implementation Plan

## Summary

Add a **unified user login system** for 86 Connects customers. One account per email works for both Study in China and Product Sourcing services. Accounts are **auto-created on first form submission** (no email infrastructure needed) — the user sets their password on-screen immediately after submitting. Includes a full account dashboard to track submissions, edit profile, and view history.

**Bot protection:** Rate limiting on all new endpoints + honeypot field + 2-second minimum submit time on forms.

**Admin auth stays separate** (existing `admin_token` system untouched).

---

## Current State Analysis

### Backend (mostly done — routes created but NOT mounted)

The following files already exist and are complete:
- [backend/src/routes/auth.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/routes/auth.ts) — set-password, login, logout, verify, me, profile endpoints
- [backend/src/routes/study-application.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/routes/study-application.ts) — POST with auto-create user logic
- [backend/src/routes/sourcing-inquiry.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/routes/sourcing-inquiry.ts) — POST with auto-create user logic
- [backend/src/routes/tracking.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/routes/tracking.ts) — GET tracking with stage timelines
- [backend/src/middleware/auth.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/middleware/auth.ts) — `authenticateUser` middleware added
- [backend/src/lib/validation.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/lib/validation.ts) — user auth + submission schemas added
- [backend/prisma/schema.prisma](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/prisma/schema.prisma) + [schema.dev.prisma](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/prisma/schema.dev.prisma) — User model + extended Submission (db push already run on dev)

### Backend (NOT done — needs work)
- [backend/src/index.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/index.ts) — only mounts `contactRouter` + `adminRouter`. New routes NOT mounted. No `formLimiter`. No honeypot/time-check middleware.

### Frontend (NOT done — all needs building)
- [frontend/src/lib/api.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/lib/api.ts) — `SubmissionResponse` type missing `newUser` + `setPasswordToken` fields
- [frontend/src/context/auth-context.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/context/auth-context.tsx) — admin-only, needs a parallel user auth context
- [frontend/src/middleware.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/middleware.ts) — only protects `/admin`, needs `/account` protection
- [frontend/src/components/tracking/tracking-form.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/tracking/tracking-form.tsx) — simulates lookups, needs real API
- [frontend/src/components/forms/study-application-form.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/forms/study-application-form.tsx) + [sourcing-inquiry-form.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/forms/sourcing-inquiry-form.tsx) — no honeypot, no time-check, no auto-create redirect handling
- [frontend/src/components/layout/navbar.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/layout/navbar.tsx) — no Login/Account link
- No `/login`, `/set-password`, or `/account` pages exist

---

## Proposed Changes

### Step 1: Backend — Mount routes + add rate limiters + bot protection middleware

**File:** [backend/src/index.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/backend/src/index.ts)

**Changes:**
1. Import the 4 new routers: `authRouter`, `studyApplicationRouter`, `sourcingInquiryRouter`, `trackingRouter`
2. Add a new `formLimiter` (10 requests / 15 min) — stricter than `apiLimiter` to prevent form spam, more lenient than `loginLimiter`
3. Mount routes with appropriate limiters:
   - `/api/auth/login` → `loginLimiter` (5/15min, brute-force protection)
   - `/api/auth/set-password` → `loginLimiter` (5/15min, token-guessing protection)
   - `/api/auth` → `authRouter` (verify/me/profile/logout use `apiLimiter` default via app-level)
   - `/api/study-application` → `formLimiter` + `studyApplicationRouter`
   - `/api/sourcing-inquiry` → `formLimiter` + `sourcingInquiryRouter`
   - `/api/tracking` → `apiLimiter` + `trackingRouter` (read-only, low risk)

**New file:** `backend/src/middleware/bot-check.ts`

A reusable middleware for honeypot + time-check on form submissions:
- **Honeypot:** checks `req.body.website_url` (or similar hidden field name). If non-empty → silently return success (200) without creating anything, so bots think it worked but nothing is stored.
- **Time-check:** requires a `formLoadedAt` timestamp in the body. If `Date.now() - formLoadedAt < 2000ms` → reject as bot (too fast for a human to fill a form).

```typescript
// Pseudocode for bot-check.ts
export function botCheck(req, res, next) {
  // Honeypot: if filled, silently succeed (bot trapped)
  if (req.body.website_url && req.body.website_url.trim() !== '') {
    return res.status(200).json({ success: true, id: 'bot-trapped', newUser: false });
  }
  // Time check: must take at least 2 seconds
  const loadedAt = Number(req.body.formLoadedAt || 0);
  if (loadedAt && Date.now() - loadedAt < 2000) {
    return res.status(400).json({ error: 'Submission too fast. Please try again.' });
  }
  next();
}
```

Apply `botCheck` to study-application + sourcing-inquiry routes (before the route handler).

### Step 2: Frontend — Update `api.ts` for auto-create flow

**File:** [frontend/src/lib/api.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/lib/api.ts)

**Changes:**
1. Extend `SubmissionResponse` type:
   ```typescript
   export interface SubmissionResponse {
     success: boolean;
     id: string;
     newUser?: boolean;
     setPasswordToken?: string;
   }
   ```
2. Add user auth API functions:
   - `userLogin(email, password)` → POST `/api/auth/login`
   - `userSetPassword(token, password)` → POST `/api/auth/set-password`
   - `userLogout()` → POST `/api/auth/logout`
   - `userVerify()` → GET `/api/auth/verify`
   - `getUserProfile()` → GET `/api/auth/me`
   - `updateUserProfile(data)` → PATCH `/api/auth/profile`
   - `trackSubmission(referenceId, email)` → GET `/api/tracking/:referenceId?email=xxx`
3. All auth functions use `credentials: "include"` for cookie-based auth.

### Step 3: Frontend — Create `user-auth-context.tsx` + wrap in layout

**New file:** `frontend/src/context/user-auth-context.tsx`

Parallel to existing [auth-context.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/context/auth-context.tsx) (admin), but for users:
- `UserAuthProvider` component
- `useUserAuth()` hook
- State: `user` (id, email, name, phone), `isAuthenticated`, `isLoading`
- On mount: call `/api/auth/verify` to check `user_token` cookie
- Methods: `login(email, password)`, `logout()`, `setPassword(token, password)`, `refreshProfile()`
- Uses `credentials: "include"` on all fetches

**File:** [frontend/src/app/layout.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/app/layout.tsx)

Wrap app with `UserAuthProvider` inside existing `AuthProvider`:
```tsx
<AuthProvider>
  <UserAuthProvider>
    <ContactProvider>
      {/* ... */}
    </ContactProvider>
  </UserAuthProvider>
</AuthProvider>
```

### Step 4: Frontend — Create login + set-password pages

**New file:** `frontend/src/app/login/page.tsx`

User login page (follows [admin login pattern](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/app/admin/login/page.tsx)):
- Email + password fields
- Uses `useUserAuth().login()`
- On success → redirect to `/account`
- Link to homepage
- Note: "Don't have an account? Submit a Study or Sourcing form and we'll create one for you."
- 3D border styling consistent with rest of app (`border-2 border-border border-b-[6px] border-b-primary/30`)

**New file:** `frontend/src/app/set-password/page.tsx`

Set-password page (reached after first form submission):
- Reads `token` from query string (`?token=xxx`)
- Password + confirm-password fields (min 8 chars, must match)
- Uses `useUserAuth().setPassword(token, password)`
- On success → redirect to `/account`
- Handles invalid/expired token with clear error message + link to contact support
- If no token in URL → show error + link to login

### Step 5: Frontend — Create account dashboard page

**New file:** `frontend/src/app/account/page.tsx`

Protected page (middleware redirects to `/login` if no `user_token`). Sections:
1. **Header** — greeting with user's name, "My Account" title
2. **Profile card** — name, email, phone, member since date. Edit button → inline edit form (name + phone) using `updateUserProfile()`
3. **Submissions list** — fetched from `getUserProfile()` which returns submissions array. Each card shows:
   - Type badge (Study / Sourcing) with icon + color
   - Status badge (color-coded)
   - Reference ID (last 8 chars, uppercase) + copy button
   - Date submitted
   - "Track" button → links to `/study-in-china/track-application` or `/product-sourcing/track-quote` with prefilled reference
   - Expandable message preview
4. **Quick actions** — buttons to start new Study application or Sourcing inquiry
5. **Logout button**

Uses 3D border cards consistent with app design. Empty state: "No submissions yet — start a Study application or Sourcing inquiry."

### Step 6: Frontend — Update forms for auto-create flow + bot protection

**Files:**
- [frontend/src/components/forms/study-application-form.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/forms/study-application-form.tsx)
- [frontend/src/components/forms/sourcing-inquiry-form.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/forms/sourcing-inquiry-form.tsx)

**Changes to both forms:**
1. **Honeypot field** — add a hidden input named `website_url` with `tabIndex={-1}`, `aria-hidden`, positioned off-screen with `absolute left-[-9999px]`. Humans won't see/fill it; bots will. Include in submission payload.
2. **Time-check** — record `formLoadedAt = Date.now()` on mount via `useEffect`. Include in submission payload.
3. **Auto-create handling** — after `submitStudyApplication()` / `submitSourcingInquiry()` returns, check `newUser`:
   - If `newUser === true` and `setPasswordToken` exists → show success screen with a prominent "Set your password to track this application" button → links to `/set-password?token=xxx`
   - If `newUser === false` (existing user) → show success screen with "View in your account" button → links to `/account`
4. **Update `submitStudyApplication` / `submitSourcingInquiry` calls** to pass `website_url` + `formLoadedAt` alongside form data (these are stripped by backend `botCheck` middleware, not stored in DB).

**Note:** The Zod schemas in [frontend/src/lib/validation.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/lib/validation.ts) don't include `website_url` / `formLoadedAt` — these are added to the payload separately (not via react-hook-form) before calling the API.

### Step 7: Frontend — Update middleware for `/account` protection

**File:** [frontend/src/middleware.ts](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/middleware.ts)

Extend to protect `/account` routes with `user_token` cookie:
```typescript
// Protect /account routes
if (pathname.startsWith("/account")) {
  const userToken = request.cookies.get("user_token")?.value;
  if (!userToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Redirect to /account if already logged in and visiting /login
if (pathname === "/login") {
  const userToken = request.cookies.get("user_token")?.value;
  if (userToken) {
    return NextResponse.redirect(new URL("/account", request.url));
  }
}
```

Update `matcher` to include `/account/:path*` and `/login`.

### Step 8: Frontend — Update tracking-form.tsx to use real API

**File:** [frontend/src/components/tracking/tracking-form.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/tracking/tracking-form.tsx)

Replace the simulated lookup (lines 83-112) with real API call:
```typescript
const res = await fetch(
  `${API_URL}/api/tracking/${encodeURIComponent(data.referenceId)}?email=${encodeURIComponent(data.email)}`,
  { credentials: "include" }
);
if (!res.ok) {
  setNotFound(true);
  return;
}
const json = await res.json();
// Map json.timeline + json.submission to TrackingResult
```

The backend returns `timeline` as array of `{ key, label, description, status: 'done'|'current'|'pending' }`. Map `currentStage` = index where `status === 'current'`. Use `submission.createdAt` for submitted date, current date for last updated.

Add `API_URL` constant (same as other files: `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"`).

### Step 9: Frontend — Add Login/Account to navbar

**File:** [frontend/src/components/layout/navbar.tsx](file:///e:/PYTHON%20PROJECT%20UNI/The%2086%20Connect/frontend/src/components/layout/navbar.tsx)

Add a user account button to the desktop CTA area (next to "Get Started"):
- If not authenticated → "Login" button (links to `/login`)
- If authenticated → "Account" button with user icon (links to `/account`)

This requires the navbar to use `useUserAuth()` — so navbar must remain a client component (it already is). Add a small `User` icon from lucide-react.

For the mobile bottom tab bar, the existing 5 tabs (Home, Study, Sourcing, About, Contact) stay. The Login/Account button goes in the mobile slide-down menu only (to avoid overcrowding the bottom bar).

---

## Assumptions & Decisions

1. **One login system** — single account per email works for both Study + Sourcing. No separate logins.
2. **No email infrastructure** — password set on-screen immediately after first submission via temp JWT (1h expiry). No emails sent.
3. **Admin auth untouched** — separate `admin_token` cookie + `authenticateToken` middleware remains as-is.
4. **Bot protection** — rate limiting + honeypot + 2s time-check. No captcha (zero UX friction).
5. **Password hashing** — bcryptjs cost factor 10 (already implemented in auth.ts).
6. **Cookie config** — `user_token` httpOnly, secure in prod, sameSite strict, 24h maxAge (already in auth.ts).
7. **Tracking reference** — last 8 chars of submission UUID, uppercase. User enters this + their email.
8. **Honeypot silent success** — when bot fills honeypot, return 200 success without saving. Bots think it worked; no data polluted.
9. **Form time-check threshold** — 2000ms (2 seconds). Real humans take longer to fill a multi-field form.
10. **Existing admin `AuthProvider`** stays. New `UserAuthProvider` is separate context to avoid confusion.

---

## Verification Steps

1. **Backend compiles:** `cd backend && npx tsc --noEmit` — no type errors
2. **Backend routes mounted:** start server, `GET /health` works, `POST /api/auth/login` returns 401 (not 404)
3. **Frontend compiles:** `cd frontend && npm run build` — no type errors
4. **End-to-end flow (manual):**
   - Submit Study application form with new email → get `setPasswordToken` → redirect to `/set-password` → set password → land on `/account` → see submission listed
   - Logout → `/login` → login with email + password → land on `/account`
   - Submit Sourcing inquiry with same email → no new user created → submission appears in account
   - Track submission via reference ID + email → timeline displays
5. **Bot protection:**
   - Fill honeypot field → submission returns success but nothing saved in DB
   - Submit form in <2s → 400 error "Submission too fast"
   - Hit `/api/auth/login` 6 times in 15 min → 429 rate limited
6. **Route protection:** visit `/account` while logged out → redirected to `/login`
7. **Admin unaffected:** `/admin/login` + `/admin` still work with `admin_token`

---

## File Summary

### Backend (2 files)
| File | Action |
|---|---|
| `backend/src/index.ts` | Edit — mount 4 new routers, add `formLimiter`, apply limiters |
| `backend/src/middleware/bot-check.ts` | New — honeypot + time-check middleware |

### Frontend (10 files)
| File | Action |
|---|---|
| `frontend/src/lib/api.ts` | Edit — extend type, add user auth + tracking functions |
| `frontend/src/context/user-auth-context.tsx` | New — user auth provider + hook |
| `frontend/src/app/layout.tsx` | Edit — wrap with `UserAuthProvider` |
| `frontend/src/app/login/page.tsx` | New — user login page |
| `frontend/src/app/set-password/page.tsx` | New — set password page |
| `frontend/src/app/account/page.tsx` | New — account dashboard |
| `frontend/src/middleware.ts` | Edit — protect `/account`, redirect `/login` |
| `frontend/src/components/tracking/tracking-form.tsx` | Edit — use real tracking API |
| `frontend/src/components/forms/study-application-form.tsx` | Edit — honeypot, time-check, auto-create redirect |
| `frontend/src/components/forms/sourcing-inquiry-form.tsx` | Edit — honeypot, time-check, auto-create redirect |
| `frontend/src/components/layout/navbar.tsx` | Edit — add Login/Account button |

**Total: 12 files (3 new, 9 edited)**
