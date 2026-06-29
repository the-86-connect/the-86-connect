# Skill: Admin Authentication (Next.js)

> **Registered Skill:** `.trae/skills/admin-auth/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description
JWT-based authentication pattern for the admin dashboard using Next.js App Router. The frontend (Next.js on Vercel) communicates with the backend API (Express on Render) for authentication (PRD §3.7, §4.5, §4.6, §4.7, §8.6).

## When to Use
- Admin login page (`/admin/login`)
- Protecting admin dashboard routes (`/admin`)
- Managing admin session with JWT tokens
- Logout functionality

## Architecture

```
Next.js Frontend (Vercel)  ──HTTPS──>  Express Backend (Render)
  - /admin/login                       - POST /api/admin/login
  - /admin (protected)                 - GET /api/admin/submissions
  - Auth Context                       - JWT verification middleware
  - httpOnly cookie storage
```

## Implementation

### Auth Context Provider (Client Component)

```typescript
// src/context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check existing auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      setIsAuthenticated(response.ok)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (password: string): Promise<boolean> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',  // Required for httpOnly cookie
    })

    if (response.ok) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### useAuth Hook

```typescript
// src/hooks/useAuth.ts
'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Root Layout with AuthProvider

```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

### Protected Route (Middleware)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  // Protect /admin routes (except /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') &&
      request.nextUrl.pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect to dashboard if already authenticated and visiting login
  if (request.nextUrl.pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

### Login Page (Next.js App Router)

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
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
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

### Admin Dashboard Page

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

### Logout Button

```typescript
// src/components/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return <Button variant="outline" onClick={handleLogout}>Logout</Button>
}
```

## Backend Auth Endpoints (on Render)

See `backend-api.md` skill for the complete backend implementation including:
- `POST /api/admin/login` - Sets httpOnly cookie with JWT
- `POST /api/admin/logout` - Clears cookie
- `GET /api/admin/submissions` - Protected route using cookie-based auth

## Best Practices

1. **Use httpOnly cookies** for JWT storage (not localStorage)
2. **Set secure flag** in production (HTTPS only)
3. **Use sameSite: 'strict'** to prevent CSRF
4. **Middleware for route protection** at the edge
5. **Loading states** to prevent flash of unauthenticated content
6. **Redirect after login** to intended destination
7. **Clear cookies on logout** (PRD §4.7)
8. **Show error messages** for failed login attempts (PRD §4.5)

## Security Considerations

- JWT token stored in httpOnly cookie (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite strict (CSRF protection)
- 24-hour token expiration
- Backend validates token on every protected request
- Password never stored on frontend

## Related Rules
- `admin-route-protection.yml` - Ensures routes are protected
- `useAuth.yml` - Detects useAuth usage
- `authProvider.yml` - Ensures AuthProvider wraps the app
