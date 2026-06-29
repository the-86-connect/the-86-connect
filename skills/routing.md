# Skill: Routing (Next.js App Router)

> **Registered Skill:** `.trae/skills/routing/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description
Patterns for implementing routing in the 86 Connects application using Next.js App Router, with admin route protection via middleware (PRD §3, §4.6, §4.7, §8.3).

## When to Use
- Setting up the Next.js App Router structure
- Implementing smooth scroll navigation for single-page layout
- Protecting admin routes with middleware
- Managing redirects after login/logout

## Route Structure (PRD §3)

```
app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Home page (single-page with sections)
├── admin/
│   ├── login/
│   │   └── page.tsx        # Admin login page
│   └── page.tsx            # Admin dashboard (protected)
├── middleware.ts           # Route protection
└── globals.css
```

## Implementation

### Root Layout with Providers

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { ContactProvider } from '@/context/ContactContext'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '86 Connects - Study in China & Product Sourcing Services',
  description: 'Professional services for Study in China assistance and Product Sourcing from China.',
  keywords: ['Study in China', 'Product Sourcing from China', 'China education', 'China procurement'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ContactProvider>
            {children}
            <Toaster />
          </ContactProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Home Page (Single-Page with Sections)

```typescript
// src/app/page.tsx
import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { StudyInChinaSection } from '@/components/sections/StudyInChinaSection'
import { ProductSourcingSection } from '@/components/sections/ProductSourcingSection'
import { AboutUsSection } from '@/components/sections/AboutUsSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section id="hero"><HeroSection /></section>
        <section id="study-in-china"><StudyInChinaSection /></section>
        <section id="product-sourcing"><ProductSourcingSection /></section>
        <section id="about-us"><AboutUsSection /></section>
        <section id="contact"><ContactSection /></section>
      </main>
      <Footer />
    </>
  )
}
```

### Middleware for Route Protection (PRD §4.6)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect to dashboard if already authenticated and visiting login
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

### Smooth Scroll Navigation (PRD §3.6)

```typescript
// src/components/Navbar.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', target: 'hero' },
  { label: 'Study in China', target: 'study-in-china' },
  { label: 'Product Sourcing', target: 'product-sourcing' },
  { label: 'About Us', target: 'about-us' },
  { label: 'Contact', target: 'contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavClick = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="font-bold text-xl">86 Connects</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.target}
                variant="ghost"
                onClick={() => handleNavClick(item.target)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.target}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavClick(item.target)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
```

### Admin Login Page

```typescript
// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const success = await login(password)
    if (success) {
      router.push('/admin')
    } else {
      setError('Incorrect password. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          required
        />
        {error && <p className="text-destructive">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  )
}
```

### Admin Dashboard Page (Protected)

```typescript
// src/app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { SubmissionsTable } from '@/components/SubmissionsTable'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch submissions with credentials (httpOnly cookie sent automatically)
      fetch(`${API_URL}/api/admin/submissions`, {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then(setSubmissions)
        .catch(console.error)
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      <SubmissionsTable submissions={submissions} />
    </div>
  )
}
```

## Access Control Logic (PRD §4.6)

```
User accesses /admin
  → Middleware checks admin_token cookie
  → If token exists: Allow access to Admin Dashboard
  → If no token: Redirect to /admin/login

User accesses /admin/login
  → If token exists: Redirect to /admin
  → If no token: Show login form
```

## Best Practices

1. **Use middleware** for route protection (runs at the edge)
2. **Use `replace`** in router.push to prevent back button issues
3. **Wrap app root** with AuthProvider and ContactProvider
4. **Use sticky navbar** for single-page navigation
5. **Smooth scroll** to sections, not jump
6. **Handle mobile** with responsive hamburger menu
7. **Redirect after logout** to home page (PRD §4.7)
8. **Server Components by default**, 'use client' only when needed
9. **Metadata API** for SEO (PRD §4.4)

## SEO Optimization (PRD §4.4)

```typescript
// Use Next.js Metadata API (not react-helmet)
export const metadata: Metadata = {
  title: '86 Connects - Study in China & Product Sourcing',
  description: 'Professional services for Study in China and Product Sourcing from China.',
  keywords: ['Study in China', 'Product Sourcing from China'],
}
```

## Related Rules
- `admin-route-protection.yml` - Ensures /admin routes are protected
- `authProvider.yml` - Ensures AuthProvider wraps the app
- `useAuth.yml` - Detects useAuth hook usage
