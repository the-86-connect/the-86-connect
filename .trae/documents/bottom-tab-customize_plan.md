# Plan: Customize Bottom Tab Bar for SIC/PS Pages

## Request
Change the bottom tab bar on SIC and PS pages from (Home, Other Service, Track, Me, Apply/Quote) to:
- **SIC page**: Home, Services, Apply, Track, Me/Login
- **PS page**: Home, Services, Quote, Track, Me/Login

## Current State
The bottom bar in `page-navbar.tsx` currently has:
1. Home → "/"
2. Other Service cross-link (Sourcing on SIC, Study on PS)
3. Track → trackHref
4. Me/Login → /account or /login
5. Apply/Quote (gradient CTA button) → scrolls to ctaTarget

## Target State
Replace the cross-service link (tab #2) with a "Services" in-page anchor link that scrolls to the services section, and make the CTA tab (#5) label appropriate per page.

### Files to Modify
- **`frontend/src/components/layout/page-navbar.tsx`** (lines 333-396):
  - Remove the cross-service otherService logic (lines 52-57)
  - Replace tab #2 (OtherServiceIcon link) with a "Services" button that scrolls to section "services" using `handleNavClick("services")` with Briefcase icon
  - Keep tabs 1, 3, 4, 5 as is (Home, Track, Me/Login, Apply/Quote)
  - Remove unused imports: `GraduationCap`, `ShoppingCart` (only used for cross-link)
  - Keep `Briefcase` for Services icon, keep `usePathname`/`isSIC` for Apply/Quote label differentiation

### Tab Order (5 columns):
1. 🏠 **Home** → "/" (HomeIcon)
2. 💼 **Services** → scrolls to #services (Briefcase icon)
3. 🔍 **Track** → trackHref (Search icon)
4. 👤 **Me/Login** → /account or /login (User/LogIn icon)
5. 🎯 **Apply/Quote** → scrolls to CTA section (gradient button, FileCheck/Send icon)

## Steps
1. Remove otherService and OtherServiceIcon variables
2. Replace cross-link tab with Services anchor button
3. Clean up unused imports (GraduationCap, ShoppingCart)
4. Verify compilation with GetDiagnostics

## Risk
- Low: Simple tab swap, no new features
- The "services" section ID must exist on both SIC and PS pages (confirmed: subLinks include "services" target on both)
