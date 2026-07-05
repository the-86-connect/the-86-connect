# backend/Dockerfile — Multi-stage build for production (Render)

# === Base stage ===
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# === Dependencies stage ===
FROM base AS deps
COPY package*.json ./
RUN npm ci

# === Builder stage ===
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client (production schema — PostgreSQL)
RUN npx prisma generate --schema=prisma/schema.prisma
# Compile TypeScript
RUN npm run build

# === Production runner stage ===
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 expressjs

# Copy only production files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Security: add wget for healthcheck
RUN apk add --no-cache wget

USER expressjs

EXPOSE 3001

ENV PORT=3001

# Health check — hits /health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["npm", "start"]