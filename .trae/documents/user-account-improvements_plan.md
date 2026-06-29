# User Account Page: What to Add vs. Skip

## Current Features

| Feature | Status |
|---------|--------|
| Login / Signup / Set Password | Done |
| Profile editing (name, phone) | Done |
| Submissions list with status timeline | Done |
| Copy reference code | Done |
| Track button linking to tracking page | Done |
| Quick actions (new study/sourcing) | Done |
| Auth with JWT + httpOnly cookies | Done |
| Login lockout (5 attempts → 15 min) | Done |
| Auto-create user from form submissions | Done |

---

## RECOMMENDED: Add These

### 1. Forgot Password / Password Reset
**Why:** Users who forget their password have zero recovery options. They're locked out permanently.
- Add "Forgot password?" link on login page
- Backend: `POST /api/auth/forgot-password` — generates a reset token (JWT, 1h expiry), sends email via Resend
- Backend: `POST /api/auth/reset-password` — validates token, sets new password
- Frontend: `/forgot-password` page (enter email), `/reset-password?token=xxx` page (enter new password)
- Reuses the email utility already built in `backend/src/lib/email.ts`

### 2. Change Password (for logged-in users)
**Why:** No way for authenticated users to change their password. Basic security hygiene.
- Add "Change Password" section in account page (below profile card)
- Backend: `PATCH /api/auth/password` — requires current password + new password
- Frontend: 3-field form (current password, new password, confirm new password)

### 3. Account Deletion & Data Export (GDPR)
**Why:** Privacy regulations require this. Also builds trust.
- Add "Delete Account" button in account settings
- Backend: `DELETE /api/auth/account` — deletes user + anonymizes their submissions (sets userId=null, keeps data)
- Backend: `GET /api/auth/export` — returns user data as JSON download
- Frontend: confirmation modal for delete, download button for export

### 4. Toast Notifications
**Why:** Profile save silently succeeds/fails. No feedback on copy, errors, or success actions.
- Add sonner toast to account page for: profile save success/failure, copy reference success, errors
- Minor UX improvement, high impact

### 5. Signup Form Zod Validation
**Why:** The signup page has basic validation only (password >= 8 chars). Email format, name length, and phone format are not validated client-side.
- Add Zod schema matching the backend `userRegisterSchema`
- Show inline validation errors

---

## OPTIONAL: Nice-to-Have

### 6. Email Verification
**Why:** Anyone can sign up with any email. Prevents fake accounts.
- Send verification email on signup with a token link
- Mark user as verified before allowing login
- **Medium effort** — requires email integration (already built) + DB migration + UX flow

### 7. Register Rate Limiting
**Why:** No rate limit on `/api/auth/register`. Could allow mass account creation.
- Add `express-rate-limit` to the register endpoint (e.g., 5 per 15 min per IP)
- **Small change** — backend only

### 8. Session Management for Users
**Why:** Admin has session tracking, but users don't. Can't revoke compromised sessions.
- Similar to admin session tracker but for users
- Show active devices, allow logout from others
- **High effort** — requires new DB model or Redis store

---

## SKIP: Not Needed Now

| Feature | Why Skip |
|---------|----------|
| **Profile Picture Upload** | Adds complexity (file storage, cropping). Generic avatar is fine. |
| **Notification Preferences** | No notification system for users yet. Add when email notifications grow. |
| **Resend Set-Password Link** | Users can use the signup page to claim their account. Low priority. |
| **2FA / MFA** | Overkill for this application. Admin panel is higher risk and doesn't have it either. |

---

## Suggested Implementation Order

1. **Forgot Password flow** (medium — critical gap, reuses email.ts)
2. **Change Password** (small — security basic)
3. **Account Deletion & Data Export** (small — compliance)
4. **Toast Notifications** (tiny — UX polish)
5. **Signup Zod Validation** (small — data quality)
6. Register rate limiting (tiny — security)
7. Email verification (medium — trust)
8. User session management (high — overkill for now)

---

## Implementation Details

### 1. Forgot Password

**Backend changes** (`backend/src/routes/auth.ts`):
- `POST /api/auth/forgot-password` — accepts `{ email }`, finds user, generates JWT reset token (1h), calls `notifyUserPasswordReset()` from `lib/email.ts`
- `POST /api/auth/reset-password` — accepts `{ token, password }`, verifies JWT (purpose: "reset-password"), updates user's `passwordHash`

**Backend email** (`backend/src/lib/email.ts`):
- Add `notifyUserPasswordReset({ to, name, resetUrl })` function

**Frontend pages:**
- `/forgot-password/page.tsx` — email input form, shows "Check your email" confirmation
- `/reset-password/page.tsx` — new password + confirm password form (similar to set-password page)

**Frontend login page** (`/login/page.tsx`):
- Add "Forgot password?" link below the password field

### 2. Change Password

**Backend** (`backend/src/routes/auth.ts`):
- `PATCH /api/auth/password` — requires `authenticateUser`, accepts `{ currentPassword, newPassword }`, validates current password, hashes and saves new one

**Frontend** (`/account/page.tsx`):
- Add a "Security" card below profile card with change password form
- Three fields: current, new, confirm
- Save button with loading state

### 3. Account Deletion & Data Export

**Backend** (`backend/src/routes/auth.ts`):
- `DELETE /api/auth/account` — requires `authenticateUser`, sets `userId=null` on all user submissions, deletes the user, clears cookie
- `GET /api/auth/export` — requires `authenticateUser`, returns JSON with user profile + all submissions + attachments

**Frontend** (`/account/page.tsx`):
- Add "Danger Zone" section at the bottom
- "Export My Data" button → downloads JSON file
- "Delete Account" button → confirmation modal with type-to-confirm

### 4. Toast Notifications

**Frontend** (`/account/page.tsx`):
- Import `toast` from `sonner`
- Add `toast.success("Profile updated")` after successful save
- Add `toast.error(...)` in catch blocks
- Add `toast.success("Reference code copied")` after copy

### 5. Signup Zod Validation

**Frontend** (`/signup/page.tsx`):
- Import `userRegisterSchema` from backend validation or create matching frontend schema
- Use React Hook Form + Zod resolver for proper inline validation
