# 86 Connects - Project Context

## CRITICAL: Before writing any code, read these files in order:

1. **`.trae/rules/skill-invocation.md`** — Which skills to invoke for which task
2. **`.trae/rules/build-workflow.md`** — Step-by-step build workflow
3. **`.trae/skills/INDEX.md`** — All 12 skills and their relationships
4. **`prd.md`** — Product requirements and tech stack
5. **`production-checklist.md`** — Production readiness criteria

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Express + TypeScript + Prisma ORM |
| Database (Dev) | SQLite |
| Database (Prod) | PostgreSQL on Render |
| Deployment | Vercel (frontend) + Render (backend + DB) |
| Containerization | Docker (production only) |
| Auth | JWT + httpOnly cookies |

## Key Files

| File | Purpose |
|------|---------|
| `prd.md` | Product Requirements Document |
| `production-checklist.md` | Pre-launch production checklist |
| `skills/*.md` | Full skill documentation with code examples |
| `.trae/skills/*/SKILL.md` | Registered Trae skills (quick reference) |
| `.trae/skills/INDEX.md` | Master skills index |
| `.trae/rules/skill-invocation.md` | Skill invocation rules |
| `.trae/rules/build-workflow.md` | Build workflow rules |
| `rules/*.yml` | Code quality rules (ast-grep) |
| `rules/check.sh` | Run all code quality checks |
| `.gral/commands/*.md` | 18 Gral design commands |
| `.gral/reference/*.md` | 8 Gral reference files |

## Available Skills (12)

**Design:** `ui-ux-pro-max`, `gral-frontend-design`
**Frontend:** `ui-components`, `contact-form`, `routing`
**Backend:** `backend-api`, `admin-auth`
**DevOps:** `docker`
**Quality:** `frontend-code-review`
**Tools:** `agentation`, `amis-builder`, `skill-creator`

## Mandatory Rules

1. **Design First** — Always invoke `ui-ux-pro-max` before any UI work
2. **Skill Chain** — Invoke all related skills, not just one
3. **Full Docs** — Read `skills/*.md` for code patterns, not just SKILL.md
4. **Review** — Run `frontend-code-review` and `bash rules/check.sh` before delivering
5. **SQLite for Dev** — Use SQLite locally, PostgreSQL only on Render
6. **httpOnly Cookies** — Never store tokens in localStorage, use httpOnly cookies
7. **No Emoji Icons** — Use Lucide/Heroicons SVG, not emojis