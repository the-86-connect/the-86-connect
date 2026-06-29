---
name: ui-components
description: "UI component patterns for the 86 Connects project using Next.js App Router, shadcn/ui, and Tailwind CSS. Covers public-facing sections (Hero, Study in China, Product Sourcing, About Us, Contact), admin dashboard tables, form components, responsive design, image handling with next/image, and SEO meta tags. Use when building UI components, implementing layouts, or styling pages."
---

# UI Components Skill

**Full documentation:** Read `skills/ui-components.md` for complete patterns, code examples, and best practices.

## Quick Reference

### When to use this skill
- Building public-facing sections (Hero, Study in China, Product Sourcing, About Us, Contact)
- Creating admin dashboard tables
- Implementing forms with validation
- Using shadcn/ui components in Next.js

### Component Library
- **shadcn/ui** — Button, Input, Textarea, Select, Table, Toast, Form, Card, Dialog
- **Tailwind CSS** — Utility-first styling
- **Next.js** — Server/Client components, `next/image`, Metadata API

### Page Sections (PRD §3)
1. **Hero** — Full-width hero with CTAs
2. **Study in China** — Service overview with CTA
3. **Product Sourcing** — Service overview with CTA
4. **About Us** — Company info section
5. **Contact** — Contact form section

### Key Patterns
- **Server Components:** Default for static content (SEO-friendly)
- **Client Components:** Add `'use client'` directive for interactivity
- **Images:** Use `next/image` with `width`, `height`, `alt` attributes
- **Responsive:** Mobile-first with Tailwind breakpoints
- **SEO:** Export `metadata` or `generateMetadata` from pages

### Related Rules
- `use-client-directive.yml` — 'use client' directive requirement
- `require-next-image.yml` — next/image over plain img tags
- `button-interactions.yml` — Button interactivity checks
- `contrast.yml` — Button color contrast checks
- `selectitem.yml` — SelectItem value checks
- `slot-nesting.yml` — Slot nesting validation
- `toast-hook.yml` — Toast notification usage