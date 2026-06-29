# Skill: SEO Optimization (Next.js)

> **Registered Skill:** `.trae/skills/seo/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description

Comprehensive SEO optimization patterns for the 86 Connects project. Uses Next.js Metadata API for server-side SEO, structured data for rich results, and follows best practices for search engine optimization.

---

## Target Keywords (PRD §4.7)

| Priority | Keyword | Target Pages |
|----------|---------|-------------|
| **Primary** | Study in China | Homepage, Study in China section |
| **Primary** | Product Sourcing from China | Homepage, Product Sourcing section |
| **Secondary** | Scholarship Applications China | Study in China section |
| **Secondary** | University Admissions Assistance China | Study in China section |
| **Secondary** | Study Abroad Guidance China | Study in China section |
| **Secondary** | China Supplier Finding | Product Sourcing section |
| **Secondary** | China Procurement Assistance | Product Sourcing section |
| **Secondary** | China Logistics Support | Product Sourcing section |

---

## 1. Next.js Metadata API

### Root Layout Metadata (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://86connects.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '86 Connects | Study in China & Product Sourcing from China',
    template: '%s | 86 Connects',
  },
  description:
    '86 Connects helps international students study in China and businesses source products from China. Scholarship applications, university admissions, study abroad guidance, supplier finding, procurement, and logistics support.',
  keywords: [
    'Study in China',
    'Product Sourcing from China',
    'China Scholarship',
    'University Admissions China',
    'China Supplier',
    'China Procurement',
    'China Logistics',
    'Study Abroad China',
    'China Product Sourcing',
  ],
  authors: [{ name: '86 Connects' }],
  creator: '86 Connects',
  publisher: '86 Connects',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: '86 Connects',
    title: '86 Connects | Study in China & Product Sourcing from China',
    description:
      'Helping international students study in China and businesses source products from China.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: '86 Connects - Study in China & Product Sourcing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '86 Connects | Study in China & Product Sourcing from China',
    description:
      'Helping international students study in China and businesses source products from China.',
    images: [`${baseUrl}/og-image.jpg`],
    creator: '@86connects',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};
```

### Page-Specific Metadata

```tsx
// app/page.tsx
export const metadata: Metadata = {
  title: '86 Connects | Study in China & Product Sourcing from China',
  description:
    'Your trusted partner for studying in China and product sourcing from China. Expert guidance for scholarships, university admissions, and procurement.',
};
```

---

## 2. Structured Data (JSON-LD)

### Organization Schema

```tsx
// components/structured-data.tsx
export function OrganizationSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '86 Connects',
    url: 'https://86connects.com',
    logo: 'https://86connects.com/logo.png',
    description:
      '86 Connects provides comprehensive Study in China and Product Sourcing services.',
    sameAs: [
      'https://linkedin.com/company/86connects',
      'https://facebook.com/86connects',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-xxx-xxxx-xxxx',
      contactType: 'customer service',
      availableLanguage: ['English', 'Chinese'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Service Schema

```tsx
export function ServiceSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'Service',
        position: 1,
        name: 'Study in China',
        description:
          'Comprehensive study in China services including scholarship applications, university admissions assistance, and study abroad guidance.',
        provider: { '@type': 'Organization', name: '86 Connects' },
        areaServed: { '@type': 'Country', name: 'China' },
      },
      {
        '@type': 'Service',
        position: 2,
        name: 'Product Sourcing from China',
        description:
          'Professional product sourcing services including supplier finding, procurement assistance, and logistics support.',
        provider: { '@type': 'Organization', name: '86 Connects' },
        areaServed: { '@type': 'Country', name: 'China' },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### BreadcrumbList Schema

```tsx
export function BreadcrumbSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://86connects.com',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

## 3. Sitemap & Robots

### Dynamic Sitemap (`app/sitemap.ts`)

```ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://86connects.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/#study-in-china`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#product-sourcing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
```

### Robots.txt (`app/robots.ts`)

```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://86connects.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 4. Heading Hierarchy

### Correct Structure

```
h1: 86 Connects (only ONE per page)
├── h2: Study in China
│   ├── h3: Scholarship Applications
│   ├── h3: University Admissions Assistance
│   └── h3: Study Abroad Guidance
├── h2: Product Sourcing
│   ├── h3: Supplier Finding
│   ├── h3: Procurement Assistance
│   └── h3: Logistics Support
├── h2: About Us
└── h2: Contact Us
```

### Rules:
- **ONLY ONE h1** per page
- **No skipped levels** (don't go h1 → h3)
- **Keywords in headings** — Include primary/secondary keywords naturally
- **Section headings** — Use semantic sectioning with meaningful headings

---

## 5. Image SEO

### Rules (enforced by `seo-images.yml` and `require-next-image.yml`)

- **Always use `next/image`** — Never use plain `<img>` tags
- **Always include `alt` text** — Describe the image content
- **Include keywords naturally** — e.g., "Study in China services overview"
- **Specify dimensions** — `width` and `height` attributes
- **Use `priority`** — For above-the-fold images (hero)
- **Use `fill`** — For decorative/background images

```tsx
import Image from 'next/image';

// Hero image (above-the-fold)
<Image
  src="/hero_banner.jpg"
  alt="86 Connects - Study in China and Product Sourcing from China services"
  width={1200}
  height={600}
  priority
/>

// Service image
<Image
  src="/study_in_china.jpg"
  alt="International students studying in China with scholarship support"
  width={600}
  height={400}
/>
```

---

## 6. Performance SEO (Core Web Vitals)

- **LCP (Largest Contentful Paint)** < 2.5s — Use `priority` on hero images
- **FID (First Input Delay)** < 100ms — Minimize JavaScript
- **CLS (Cumulative Layout Shift)** < 0.1 — Always specify image dimensions
- **TTFB (Time to First Byte)** — Use Vercel edge caching

---

## 7. SEO Checklist (Pre-Launch)

- [ ] Title tag includes primary keywords
- [ ] Meta description is 150-160 characters, includes keywords
- [ ] Open Graph image is 1200x630px
- [ ] All images have descriptive alt text
- [ ] Heading hierarchy is correct (h1 → h2 → h3)
- [ ] Structured data (JSON-LD) is present
- [ ] Sitemap.xml is generated and accessible
- [ ] Robots.txt is generated and excludes /admin
- [ ] Canonical URL is set
- [ ] Google Search Console is configured
- [ ] No broken internal links
- [ ] Mobile-friendly responsive design
- [ ] Page loads in under 3 seconds
- [ ] No duplicate content issues
- [ ] HTTPS is enforced

---

## Related Rules

| Rule | Purpose |
|------|---------|
| `seo-meta-tags.yml` | Enforces metadata on all pages |
| `seo-headings.yml` | Enforces h1-h6 hierarchy |
| `seo-images.yml` | Enforces alt text on images |
| `require-next-image.yml` | Enforces next/image over img tags |

## Related Skills

- `ui-components` — Component patterns for images and headings
- `routing` — Canonical URLs and dynamic routes