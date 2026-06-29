# Skill: Backend API & Database (Render + PostgreSQL / SQLite)

> **Registered Skill:** `.trae/skills/backend-api/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description
Patterns for the backend API using Express + TypeScript + Prisma ORM. Uses **SQLite for local development** and **PostgreSQL on Render for production** (PRD §8.4, §8.5).

## When to Use
- Building backend API endpoints for contact form submission
- Retrieving submissions for the admin dashboard
- Database operations with Prisma ORM
- Setting up local development with SQLite
- Deploying to Render with PostgreSQL

## Architecture

```
LOCAL DEVELOPMENT:
  Next.js (localhost:3000)  ──>  Express API (localhost:3001)  ──>  SQLite (dev.db)

PRODUCTION:
  Next.js (Vercel)  ──HTTPS──>  Express API (Render)  ──SQL──>  PostgreSQL (Render)
```

## Backend Setup

### Project Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── contact.ts
│   │   └── admin.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── cors.ts
│   ├── lib/
│   │   └── prisma.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma          # Production (PostgreSQL)
│   ├── schema.dev.prisma      # Local dev (SQLite)
│   ├── migrations/            # Production migrations
│   └── dev.db                 # SQLite database (gitignored)
├── package.json
├── tsconfig.json
└── .env
```

### Prisma Schema - Production (PostgreSQL)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Submission {
  id              String   @id @default(uuid())
  name            String
  email           String
  phone           String?
  serviceInterest String   @map("service_interest")
  message         String
  createdAt       DateTime @default(now()) @map("created_at")

  @@map("submissions")
}
```

### Prisma Schema - Local Dev (SQLite)

```prisma
// prisma/schema.dev.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Submission {
  id              String   @id @default(uuid())
  name            String
  email           String
  phone           String?
  serviceInterest String
  message         String
  createdAt       DateTime @default(now())
}
```

### Prisma Client (Auto-detects schema)

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "prisma generate --schema=prisma/schema.dev.prisma && tsx watch src/index.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/index.js",
    "db:migrate:dev": "prisma migrate dev --schema=prisma/schema.dev.prisma",
    "db:reset:dev": "prisma migrate reset --schema=prisma/schema.dev.prisma",
    "db:studio:dev": "prisma studio --schema=prisma/schema.dev.prisma",
    "db:migrate:prod": "prisma migrate deploy",
    "db:generate:prod": "prisma generate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.6",
    "jsonwebtoken": "^9.0.2",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/cookie-parser": "^1.4.3",
    "@types/jsonwebtoken": "^9.0.1"
  }
}
```

### .gitignore

```gitignore
# Database
prisma/dev.db
prisma/dev.db-journal
*.db
*.db-journal

# Environment
.env
.env.local
```

### Express Server

```typescript
// src/index.ts
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { contactRouter } from './routes/contact'
import { adminRouter } from './routes/admin'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Health check (for Render)
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/contact', contactRouter)
app.use('/api/admin', adminRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

## Local Development Setup

### First-time Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with local values

# 3. Run SQLite migration (creates dev.db)
npm run db:migrate:dev

# 4. Generate Prisma Client for SQLite
npm run dev  # This runs prisma generate with dev schema

# 5. (Optional) Open Prisma Studio to view data
npm run db:studio:dev
# Visit http://localhost:5555
```

### .env.example (Local Development)

```env
# Database (not needed for SQLite, but keep for consistency)
DATABASE_URL="file:./dev.db"

# Auth
JWT_SECRET=local_dev_jwt_secret_change_in_production
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

### Development Workflow

```bash
# Start backend (with hot reload)
npm run dev

# In another terminal, start frontend
cd ../frontend
npm run dev

# Make schema changes? Update both schema files:
# 1. Edit prisma/schema.prisma (PostgreSQL)
# 2. Edit prisma/schema.dev.prisma (SQLite)
# 3. Run migration for local dev
npm run db:migrate:dev

# Reset local database (WARNING: deletes all data)
npm run db:reset:dev

# Seed local database (optional)
npx prisma db seed --schema=prisma/schema.dev.prisma
```

## API Endpoints

### Contact Form Submission

```typescript
// src/routes/contact.ts
import { Router } from 'express'
import { prisma } from '../lib/prisma'

export const contactRouter = Router()

contactRouter.post('/', async (req, res) => {
  const { name, email, phone, serviceInterest, message } = req.body

  // Validation
  if (!name || !email || !serviceInterest || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!['Study in China', 'Product Sourcing'].includes(serviceInterest)) {
    return res.status(400).json({ error: 'Invalid service interest' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        name,
        email,
        phone: phone || null,
        serviceInterest,
        message,
      },
    })
    res.status(201).json({ success: true, id: submission.id })
  } catch (error) {
    console.error('Submission error:', error)
    res.status(500).json({ error: 'Submission failed. Please try again later.' })
  }
})
```

### Admin Endpoints

```typescript
// src/routes/admin.ts
import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

export const adminRouter = Router()

// Login
adminRouter.post('/login', (req, res) => {
  const { password } = req.body

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET!, { expiresIn: '24h' })

  // Set httpOnly cookie
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })

  res.json({ success: true })
})

// Logout
adminRouter.post('/logout', (req, res) => {
  res.clearCookie('admin_token')
  res.json({ success: true })
})

// Get all submissions (protected)
adminRouter.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(submissions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve submissions' })
  }
})

// Get submissions by service interest (protected)
adminRouter.get('/submissions/:service', authenticateToken, async (req, res) => {
  const { service } = req.params

  try {
    const submissions = await prisma.submission.findMany({
      where: { serviceInterest: service },
      orderBy: { createdAt: 'desc' },
    })
    res.json(submissions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve submissions' })
  }
})
```

### Auth Middleware (JWT)

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Check for token in httpOnly cookie first, then fallback to Authorization header
  const token = req.cookies?.admin_token || req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    next()
  })
}
```

## Frontend API Client

```typescript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ContactSubmission {
  name: string
  email: string
  phone?: string
  serviceInterest: 'Study in China' | 'Product Sourcing'
  message: string
}

export async function submitContactForm(data: ContactSubmission) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Submission failed')
  }

  return response.json()
}

export async function getSubmissions() {
  const response = await fetch(`${API_URL}/api/admin/submissions`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to fetch submissions')
  return response.json()
}

export async function adminLogin(password: string) {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Login failed')
  return response.json()
}
```

## Environment Variables

### Local Development (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=local_dev_jwt_secret_change_in_production
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development
```

### Backend (.env on Render - Production)

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=https://your-app.vercel.app
PORT=3001
NODE_ENV=production
```

### Frontend (.env.local on Vercel)

```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Production (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Database Migration Commands

### Local Development (SQLite)

```bash
# Create migration (creates dev.db if not exists)
npm run db:migrate:dev

# Reset database (WARNING: deletes all data)
npm run db:reset:dev

# Generate Prisma Client
npx prisma generate --schema=prisma/schema.dev.prisma

# View database in Prisma Studio
npm run db:studio:dev
```

### Production (PostgreSQL on Render)

```bash
# Apply migrations in production
npm run db:migrate:prod

# Generate Prisma Client
npm run db:generate:prod

# View production database (use with caution)
npx prisma studio
```

## SQLite vs PostgreSQL Considerations

| Feature | SQLite (Dev) | PostgreSQL (Prod) |
|---------|--------------|-------------------|
| UUID generation | `@default(uuid())` | `@default(uuid())` |
| Timestamps | `DateTime @default(now())` | `DateTime @default(now())` |
| Array fields | Not supported | Supported |
| JSON fields | Limited support | Full support |
| Case sensitivity | Case-insensitive | Case-sensitive |
| Concurrent writes | Single writer | Multiple writers |
| Connection string | `file:./dev.db` | `postgresql://...` |

### Schema Differences

When using SQLite locally, be aware:
- No `@map` for column names (SQLite uses model/field names as-is)
- No `CHECK` constraints via Prisma (validate in application code)
- No `TIMESTAMPTZ` (SQLite uses `DateTime` which stores as text)
- No native UUID type (stored as text)

## Error Handling

```typescript
// Consistent error response format
interface ErrorResponse {
  error: string
  details?: string
}

// Example error handling in routes
try {
  // Database operation
} catch (error) {
  console.error('Database error:', error)
  res.status(500).json({
    error: 'Submission failed. Please try again later.',
  } as ErrorResponse)
}
```

## Best Practices

1. **Keep both schemas in sync** - Update `schema.prisma` AND `schema.dev.prisma` together
2. **Use Prisma** for type-safe database queries
3. **Validate input** on both frontend and backend
4. **Never expose DATABASE_URL** to the client
5. **Use JWT** with expiration for admin sessions
6. **Enable CORS** only for the allowed origin
7. **Add health check** endpoint for Render monitoring
8. **Log errors** server-side for debugging
9. **Use HTTPS** for all API communication in production
10. **Gitignore dev.db** - Never commit the SQLite database file

## Related Rules
- `api-form-submission.yml` - Ensures contact form uses POST to /api/contact
- `express-body-parsing.yml` - Ensures express.json() middleware for body parsing
- `admin-route-protection.yml` - Frontend route protection