# Skill: Docker Containerization

> **Registered Skill:** `.trae/skills/docker/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description
Docker configuration for containerizing the backend API service for production deployment on Render. **Local development uses SQLite without Docker** for faster iteration (PRD §8.8).

## When to Use
- Containerizing the backend Express API for **production** (Render)
- Local development with Docker Compose (optional, for testing production-like environment)
- Deploying to Render Web Service
- **NOT needed for local dev** - use SQLite directly (see `backend-api.md` skill)

## Development Options

### Option 1: Local Dev WITHOUT Docker (Recommended)

Uses SQLite, no Docker required. Fastest development experience.

```bash
# Start backend with SQLite
cd backend
npm run dev  # Uses prisma/schema.dev.prisma (SQLite)

# Start frontend
cd ../frontend
npm run dev
```

See `backend-api.md` skill for full SQLite local dev setup.

### Option 2: Local Dev WITH Docker (Optional)

Uses PostgreSQL in Docker for production-like testing.

```bash
# Start backend + PostgreSQL with Docker Compose
docker-compose up -d

# Run migrations against PostgreSQL
docker-compose exec backend npm run db:migrate:prod
```

## Project Structure

```
the-86-connect/
├── backend/
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma          # Production (PostgreSQL)
│   │   ├── schema.dev.prisma      # Local dev (SQLite)
│   │   └── dev.db                 # SQLite database (gitignored)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # Next.js (deployed to Vercel, not Dockerized)
├── docker-compose.yml              # Optional: for Docker-based local dev
└── README.md
```

## Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001

ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["npm", "start"]
```

## .dockerignore

```gitignore
# backend/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.production
dist
coverage
.nyc_output
*.md
.DS_Store
```

## Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: connect86-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/connect86
      - JWT_SECRET=local_jwt_secret_change_in_production
      - ADMIN_PASSWORD=admin123
      - CORS_ORIGIN=http://localhost:3000
      - PORT=3001
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - connect86-network

  db:
    image: postgres:16-alpine
    container_name: connect86-db
    environment:
      - POSTGRES_DB=connect86
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d connect86"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - connect86-network

volumes:
  postgres_data:

networks:
  connect86-network:
    driver: bridge
```

## Development with Hot Reload

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: deps
    container_name: connect86-backend-dev
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/connect86
      - JWT_SECRET=local_jwt_secret
      - ADMIN_PASSWORD=admin123
      - CORS_ORIGIN=http://localhost:3000
    volumes:
      - ./backend/src:/app/src
      - ./backend/prisma:/app/prisma
    command: npm run dev
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=connect86
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Commands

### Build and Run

```bash
# Build the backend image
docker build -t connect86-backend ./backend

# Run the container
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://postgres:postgres@host:5432/connect86 \
  -e JWT_SECRET=your_secret \
  -e ADMIN_PASSWORD=your_password \
  -e CORS_ORIGIN=http://localhost:3000 \
  connect86-backend

# Run with Docker Compose (production-like)
docker-compose up -d

# Run with Docker Compose (development with hot reload)
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Database Operations in Docker

```bash
# Run Prisma migrations in container
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d connect86
```

## Render Deployment with Docker

### Render Configuration

1. **Create Web Service** on Render
2. **Connect Git repository**
3. **Configure**:
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Build Context Directory**: `./backend`
   - **Health Check Path**: `/health`

4. **Environment Variables** (Render Dashboard):
   ```
   DATABASE_URL=<Render PostgreSQL internal connection string>
   JWT_SECRET=<generate secure secret>
   ADMIN_PASSWORD=<your admin password>
   CORS_ORIGIN=https://your-app.vercel.app
   PORT=3001
   ```

### render.yaml (Optional - Infrastructure as Code)

```yaml
# render.yaml
services:
  - type: web
    name: connect86-backend
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: connect86-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ADMIN_PASSWORD
        sync: false
      - key: CORS_ORIGIN
        value: https://your-app.vercel.app
      - key: PORT
        value: 3001
      - key: NODE_ENV
        value: production

databases:
  - name: connect86-db
    databaseName: connect86
    ipAllowList: []
```

## Multi-Stage Build Benefits

1. **Smaller image size** - Only production dependencies in final image
2. **Security** - Non-root user (nodejs) runs the application
3. **Caching** - Dependencies cached separately from source code
4. **Health checks** - Built-in container health monitoring

## Best Practices

1. **Use Alpine images** for smaller size
2. **Multi-stage builds** to separate build and runtime
3. **Non-root user** for security
4. **.dockerignore** to exclude unnecessary files
5. **Health checks** for container orchestration
6. **Environment variables** for configuration (not hardcoded)
7. **Pin Node.js version** (node:20-alpine) for consistency
8. **Use volumes** for database persistence
9. **Network isolation** with custom networks
10. **Restart policies** for production stability

## Troubleshooting

### Common Issues

```bash
# View container logs
docker logs connect86-backend

# Execute shell in container
docker exec -it connect86-backend sh

# Check container resource usage
docker stats connect86-backend

# Rebuild after Dockerfile changes
docker-compose build --no-cache backend

# Prisma client not generated
docker-compose exec backend npx prisma generate
```

### Port Conflicts

```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Use different port
docker run -p 3002:3001 connect86-backend
```

## Related Skills
- `backend-api.md` - Backend API patterns (now uses Docker for deployment)
- `admin-auth.md` - Authentication (runs inside Docker container)
