---
name: docker
description: "Docker containerization patterns for the 86 Connects project. Docker is used for production deployment on Render only. Local development uses SQLite directly without Docker. Covers Dockerfile, docker-compose.yml, Render deployment configuration, and multi-stage builds. Use when containerizing the backend for production, deploying to Render, or testing production-like environments locally."
---

# Docker Skill

**Full documentation:** Read `skills/docker.md` for complete patterns, code examples, and setup instructions.

## Quick Reference

### When to use this skill
- Containerizing the backend Express API for **production** (Render)
- Local development with Docker Compose (optional, for testing production-like environment)
- Deploying to Render Web Service
- **NOT needed for local dev** — use SQLite directly

### Development Options
- **Option 1 (Recommended):** Local dev WITHOUT Docker — SQLite + `npm run dev`
- **Option 2 (Optional):** Local dev WITH Docker — Docker Compose + PostgreSQL

### Key Files
- `Dockerfile` — Multi-stage build (Node.js + TypeScript)
- `docker-compose.yml` — Local testing with PostgreSQL
- `render.yaml` — Render deployment configuration

### Render Deployment
- Runtime: Docker
- Port: 3001
- Health check: `GET /health`
- Environment variables: Set in Render dashboard

### Dockerfile Structure
- Stage 1: Install dependencies and build TypeScript
- Stage 2: Production image with only runtime dependencies
- Exposes port 3001
- Runs `npm start` (compiled JS)

### Related Skills
- `backend-api` — Backend API patterns
- `admin-auth` — Admin authentication