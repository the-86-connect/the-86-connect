---
name: seo
description: "SEO optimization patterns for the 86 Connects project using Next.js Metadata API. Covers meta tags, Open Graph, Twitter Cards, structured data (JSON-LD), sitemap.xml, robots.txt, canonical URLs, heading hierarchy, image alt text, and keyword targeting for 'Study in China' and 'Product Sourcing from China'. Use when implementing SEO, optimizing for search engines, or adding metadata to pages."
---

# SEO Optimization Skill

**Full documentation:** Read `skills/seo.md` for complete patterns, code examples, and setup instructions.

## Quick Reference

### When to use this skill
- Adding meta tags to pages (title, description, keywords)
- Setting up Open Graph and Twitter Card metadata
- Implementing structured data (JSON-LD schema)
- Creating sitemap.xml and robots.txt
- Ensuring proper heading hierarchy (h1 → h2 → h3)
- Adding alt text to all images
- Setting canonical URLs
- Optimizing for target keywords

### Target Keywords (PRD §4.7)
- **Primary:** "Study in China", "Product Sourcing from China"
- **Secondary:** "Scholarship Applications China", "University Admissions China", "China Supplier Finding", "China Procurement Services"

### Key Files
- `app/layout.tsx` — Root metadata (site-wide defaults)
- `app/page.tsx` — Page-specific metadata
- `app/sitemap.ts` — Dynamic sitemap generation
- `app/robots.ts` — Robots.txt generation
- `public/` — Static assets (favicon, og-image)

### Next.js Metadata API Patterns
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: '86 Connects',
    template: '%s | 86 Connects',
  },
  description: '...',
  keywords: ['Study in China', 'Product Sourcing from China'],
  openGraph: { ... },
  twitter: { ... },
  metadataBase: new URL('https://86connects.com'),
  alternates: { canonical: '/' },
}
```

### Structured Data
```tsx
// JSON-LD for Organization
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "86 Connects",
  "url": "https://86connects.com",
  "description": "Study in China and Product Sourcing services",
  "sameAs": ["https://linkedin.com/company/86connects"]
}
```

### Related Rules
- `seo-meta-tags.yml` — Enforces meta tags on all pages
- `seo-headings.yml` — Enforces proper heading hierarchy
- `seo-images.yml` — Enforces alt text on all images
- `require-next-image.yml` — Enforces next/image usage

### Related Skills
- `ui-components` — For image handling and component patterns
- `routing` — For canonical URLs and dynamic routes