# Skill: UI Components (Next.js + shadcn/ui)

> **Registered Skill:** `.trae/skills/ui-components/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description
Component patterns for the 86 Connects website using Next.js App Router, shadcn/ui, and Tailwind CSS (PRD §3, §8.3).

## When to Use
- Building public-facing sections (Hero, Study in China, Product Sourcing, About Us, Contact)
- Creating admin dashboard tables
- Implementing forms with validation
- Using shadcn/ui components in Next.js

## Component Library

This project uses **shadcn/ui** with **Tailwind CSS** in a **Next.js** application:

- `Button` - with variants (default, outline, ghost)
- `Input` - for form fields
- `Textarea` - for message field
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` - for dropdowns
- `Table` - for admin dashboard
- `Toast` / `useToast` - for notifications
- `Form`, `FormField`, `FormControl`, `FormMessage` - for form validation

## Next.js Component Patterns

### Server vs Client Components

```typescript
// Server Component (default) - for static content
// src/components/sections/HeroSection.tsx
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center">
      <Image
        src="/images/hero_banner.jpg"
        alt="86 Connects"
        fill
        priority
        className="object-cover"
      />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">86 Connects</h1>
        <p className="text-xl mb-8">Your gateway to China</p>
        <div className="flex gap-4">
          <Button size="lg">Study in China</Button>
          <Button size="lg" variant="outline">Product Sourcing</Button>
        </div>
      </div>
    </div>
  )
}

// Client Component - for interactive elements
// src/components/ContactForm.tsx
'use client'

import { useState } from 'react'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // ...
}
```

### Using next/image (PRD §4.8)

```typescript
import Image from 'next/image'

// Hero image
<Image
  src="/images/hero_banner.jpg"
  alt="86 Connects Hero"
  fill
  priority
  className="object-cover"
  sizes="100vw"
/>

// Section image
<Image
  src="/images/study_in_china.jpg"
  alt="Study in China"
  width={600}
  height={400}
  className="rounded-lg shadow-lg"
/>

// Image with fallback (PRD §5 - edge case)
'use client'

import { useState } from 'react'
import Image from 'next/image'

export function ImageWithFallback({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  ...props
}: {
  src: string
  alt: string
  fallback?: string
  [key: string]: any
}) {
  const [error, setError] = useState(false)

  return (
    <Image
      src={error ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}
```

## Section Layout Pattern

```typescript
// src/components/sections/StudyInChinaSection.tsx
'use client'

import { useContact } from '@/context/ContactContext'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function StudyInChinaSection() {
  const { setSelectedService } = useContact()

  const handleCTAClick = () => {
    setSelectedService('Study in China')
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Study in China
            </h2>
            <p className="text-muted-foreground mb-6">
              Comprehensive support for your educational journey in China.
            </p>
            <ul className="space-y-2 mb-6">
              <li>Scholarship Applications</li>
              <li>University Admissions Assistance</li>
              <li>Study Abroad Guidance</li>
            </ul>
            <Button onClick={handleCTAClick} size="lg">
              Contact Us
            </Button>
          </div>
          {/* Image */}
          <div className="relative h-96">
            <Image
              src="/images/study_in_china.jpg"
              alt="Study in China"
              fill
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Admin Dashboard Table (PRD §3.8)

```typescript
// src/components/SubmissionsTable.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

interface Submission {
  id: string
  name: string
  email: string
  phone: string | null
  serviceInterest: string
  message: string
  createdAt: string
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [sortBy, setSortBy] = useState<keyof Submission>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState<string>('all')

  const filtered = submissions.filter(
    (s) => filter === 'all' || s.serviceInterest === filter
  )

  const sorted = [...filtered].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    return a[sortBy] > b[sortBy] ? order : -order
  })

  const handleSort = (column: keyof Submission) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Study in China">Study in China</SelectItem>
          <SelectItem value="Product Sourcing">Product Sourcing</SelectItem>
        </SelectContent>
      </Select>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                >
                  Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('email')}
                >
                  Email <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('serviceInterest')}
                >
                  Service <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Message</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('createdAt')}
                >
                  Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.name}</TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>{submission.phone || '-'}</TableCell>
                <TableCell>{submission.serviceInterest}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {submission.message}
                </TableCell>
                <TableCell>
                  {new Date(submission.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

## Responsive Design (PRD §3.6, §5)

```typescript
// Mobile-first responsive patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Responsive navigation
<nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur">
  <div className="container mx-auto px-4">
    <div className="hidden md:flex items-center justify-between h-16">
      {/* Desktop nav */}
    </div>
    <div className="md:hidden">
      {/* Mobile hamburger menu */}
    </div>
  </div>
</nav>
```

## SEO Optimization (PRD §4.4)

```typescript
// Use Next.js Metadata API (not react-helmet)
// src/app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '86 Connects - Study in China & Product Sourcing Services',
  description: 'Professional services for Study in China assistance and Product Sourcing from China. Scholarships, university admissions, supplier finding, procurement, and logistics support.',
  keywords: ['Study in China', 'Product Sourcing from China', 'China education', 'China procurement'],
  openGraph: {
    title: '86 Connects',
    description: 'Study in China & Product Sourcing Services',
    images: ['/images/hero_banner.jpg'],
  },
}
```

## Button Patterns

### CTA Button (PRD §3.1, §3.2, §3.3)

```typescript
'use client'

<Button onClick={() => handleCTAClick('Study in China')} size="lg">
  Contact Us About Study in China
</Button>
```

### Submit Button (PRD §4.3)

```typescript
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Sending...' : 'Send Message'}
</Button>
```

### Logout Button (PRD §4.7)

```typescript
<Button variant="outline" onClick={handleLogout}>
  Logout
</Button>
```

## Best Practices

1. **Use shadcn/ui variants** consistently (default, outline, ghost)
2. **Avoid contrast issues** - don't use `text-foreground` on outline buttons
3. **Ensure buttons are interactive** - add onClick, type, or asChild
4. **Use proper SelectItem values** - never empty strings
5. **Avoid Slot nesting** - don't wrap FormControl in Trigger
6. **Mobile-first** responsive design
7. **Use next/image** for all images (optimization, lazy loading)
8. **Alt text** on all images for accessibility
9. **Server Components by default**, 'use client' only when needed
10. **Use Metadata API** for SEO instead of react-helmet

## Related Rules
- `button-intreactions.yml` - Ensures buttons have interaction
- `ontrast.yml` - Ensures proper color contrast
- `selectitem.yml` - Ensures SelectItem has valid value
- `slot-nesting.yml` - Prevents dangerous Slot nesting
