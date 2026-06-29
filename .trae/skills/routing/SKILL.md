---
name: routing
description: "Routing patterns for the 86 Connects project using Next.js App Router. Covers route structure (public pages, admin routes), smooth scroll navigation for single-page layout, admin route protection with middleware, and redirect flows after login/logout. Use when setting up routes, implementing navigation, or protecting admin pages."
---

# Routing Skill

**Full documentation:** Read `skills/routing.md` for complete patterns, code examples, and setup instructions.

## Quick Reference

### When to use this skill
- Setting up the Next.js App Router structure
- Implementing smooth scroll navigation for single-page layout
- Protecting admin routes with middleware
- Managing redirects after login/logout

### Route Structure (PRD §3)
```
app/
├── layout.tsx          # Root layout with AuthProvider
├── page.tsx            # Homepage (single-page with sections)
├── admin/
│   ├── layout.tsx      # Admin layout (auth check)
│   ├── page.tsx        # Admin dashboard (protected)
│   └── login/
│       └── page.tsx    # Admin login page
└── api/
    └── contact/        # (optional: API proxy)
```

### Key Patterns
- **Single-page navigation:** Use `scrollIntoView({ behavior: 'smooth' })` for section navigation
- **Admin protection:** Middleware checks cookie, redirects to `/admin/login`
- **Login redirect:** After successful login, redirect to `/admin`
- **Logout redirect:** After logout, redirect to `/`

### Middleware
- Runs on `/admin/*` routes
- Checks for `admin_token` cookie
- Redirects to `/admin/login` if not authenticated
- Skips middleware for `/admin/login` page

### Related Rules
- `admin-route-protection.yml` — Admin route protection
- `use-client-directive.yml` — Client component directive