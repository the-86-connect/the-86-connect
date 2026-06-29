# User Account Page: Status Review & Remaining Work

## Current Status

The previous plan (`user-account-improvements_plan.md`) had 5 recommended features. Here's where each stands:

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Forgot Password / Password Reset | **DONE** | Backend endpoints + frontend pages + login link |
| 2 | Change Password | **DONE** | Security section on account page |
| 3 | Account Deletion & Data Export | **DONE** | Data & Privacy section with type-to-confirm |
| 4 | Toast Notifications | **DONE** | sonner toasts on all actions |
| 5 | Signup Zod Validation | **BROKEN** | Logic is correct but missing `cn` import — causes runtime error |

The account page is feature-complete for the core use case. The remaining work is a bug fix and small security hardening.

---

## MUST FIX: Signup Page Broken

### Bug: Missing `cn` import in signup page

**File:** `frontend/src/app/signup/page.tsx`
**Problem:** Uses `cn()` on 4 lines (160, 190, 224, 256) for conditional error styling, but `cn` is never imported. This causes a `ReferenceError` at runtime.
**Fix:** Add `import { cn } from "@/lib/utils";` to the imports.

---

## RECOMMENDED: Small Security Fix

### Register Rate Limiting

**Why:** No rate limit on `POST /api/auth/register`. Allows mass account creation.
**File:** `backend/src/routes/auth.ts`
**Change:** Add `express-rate-limit` middleware to the register endpoint (5 registrations per 15 min per IP), consistent with the existing login rate limiting pattern already in the codebase.

---

## OPTIONAL: Code Quality

### Centralize API Functions

**Why:** The account page uses inline `fetch()` for 3 endpoints (change password, data export, account deletion) while other calls go through centralized helpers in `lib/api.ts`. This is inconsistent and harder to maintain.
**Files:** `frontend/src/lib/api.ts`, `frontend/src/app/account/page.tsx`
**Change:** Add `changePassword()`, `exportUserData()`, `deleteAccount()` helper functions to `api.ts`, then use them in the account page.

---

## SKIP: Not Needed Now

| Feature | Why Skip |
|---------|----------|
| **Email Verification** | Adds significant UX complexity (email flow, unverified state, re-send). Low risk without it for a small service site. |
| **User Session Management** | Overkill for this app. Admin has it because admin panel is high-risk. Users only have 24h JWT tokens. |
| **Profile Picture** | Adds file storage complexity. Generic avatar is fine. |
| **Notification Preferences** | No notification system for users yet. |

---

## Implementation Steps

### Step 1: Fix signup page bug
- Add `import { cn } from "@/lib/utils";` to `frontend/src/app/signup/page.tsx`
- Verify with `npm run build`

### Step 2: Add register rate limiting
- In `backend/src/routes/auth.ts`, import `rateLimit` (already used elsewhere in the project)
- Add rate limit middleware to the register route: 5 requests per 15 minutes per IP
- Pattern: same as existing login rate limiting in the codebase

### Step 3: Centralize API functions (optional)
- Add to `frontend/src/lib/api.ts`:
  - `changePassword(currentPassword: string, newPassword: string)`
  - `exportUserData()`
  - `deleteAccount()`
- Update `frontend/src/app/account/page.tsx` to use these helpers instead of inline fetch

### Verification
- `npm run build` in frontend — no TypeScript errors
- Test signup form: validation errors show inline without crashing
- Test register endpoint: 6th registration within 15 min returns 429
- Test account page: change password, export data, delete account all still work
