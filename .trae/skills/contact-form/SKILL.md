---
name: contact-form
description: "Contact form implementation patterns for the 86 Connects project. Uses React Hook Form + Zod validation with Next.js App Router. Covers form fields (name, email, phone, service interest, message), CTA pre-selection logic, submission to Render backend API, toast notifications, and edge cases. Use when building the contact form, adding validation, or handling form submissions."
---

# Contact Form Skill

**Full documentation:** Read `skills/contact-form.md` for complete patterns, code examples, and setup instructions.

## Quick Reference

### When to use this skill
- Building the Contact Section form
- Handling form validation with React Hook Form + Zod
- Submitting form data to backend API on Render
- Implementing CTA button pre-selection behavior

### Form Fields (PRD §3.5)
- **Name** (required) — Single text field
- **Email** (required) — Validated with regex
- **Phone** (optional) — Single text field
- **Service Interest** (required) — "Study in China" or "Product Sourcing"
- **Message** (required) — Multi-line textarea (max 500 chars)

### CTA Pre-Selection Logic
- "Study in China" CTA → pre-selects "Study in China" in the form
- "Product Sourcing" CTA → pre-selects "Product Sourcing" in the form
- Smooth scroll to contact section after CTA click

### Validation (Zod Schema)
- Name: 2-100 characters
- Email: Valid email regex
- Phone: Optional, 7-15 digits
- Service Interest: Must be one of the two options
- Message: 10-500 characters

### Edge Cases
- Loading state: Disable submit button, show spinner
- Error state: Display error above form
- Network failure: Show retry option
- Duplicate submission: Prevent double-click
- Empty form: Validation errors on submit

### Related Rules
- `api-form-submission.yml` — Contact form must use POST to /api/contact
- `form-validation.yml` — Form validation requirements
- `toast-hook.yml` — Toast notification usage