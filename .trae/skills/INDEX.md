# Project Skills Index

> **Rules:** `.trae/rules/skill-invocation.md` | `.trae/rules/build-workflow.md` | **Context:** `.trae/project-context.md`

Central registry of all 13 skills available in the **86 Connects** project. When the AI needs to implement a feature, it should check this index first to determine which skills to use.

---

## Skill Inventory

| #   | Skill Name             | Location                             | Purpose                                              | When to Use                                         |
| --- | ---------------------- | ------------------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| 1   | `ui-ux-pro-max`        | `.trae/skills/ui-ux-pro-max/`        | Design intelligence (colors, typography, styles, UX) | ANY UI/design work — always check first             |
| 2   | `gral-frontend-design` | `.trae/skills/gral-frontend-design/` | 18 design commands + 8 references                    | Typography, layout, color, animation, polish, audit |
| 3   | `frontend-code-review` | `.trae/skills/frontend-code-review/` | Code review checklist                                | PR review, code quality audit                       |
| 4   | `seo`                  | `.trae/skills/seo/`                  | SEO optimization (meta, structured data, sitemap)    | Meta tags, Open Graph, JSON-LD, sitemap, alt text   |
| 5   | `backend-api`          | `.trae/skills/backend-api/`          | Express + Prisma + SQLite/PostgreSQL                 | Backend API, database, migrations                   |
| 6   | `admin-auth`           | `.trae/skills/admin-auth/`           | JWT auth with httpOnly cookies                       | Admin login, route protection, sessions             |
| 7   | `contact-form`         | `.trae/skills/contact-form/`         | React Hook Form + Zod validation                     | Contact form, validation, submissions               |
| 8   | `routing`              | `.trae/skills/routing/`              | Next.js App Router patterns                          | Routes, navigation, middleware                      |
| 9   | `ui-components`        | `.trae/skills/ui-components/`        | shadcn/ui + Tailwind patterns                        | UI components, layouts, styling                     |
| 10  | `docker`               | `.trae/skills/docker/`               | Docker + Render deployment                           | Production deployment, containerization             |
| 11  | `skill-creator`        | `.trae/skills/skill-creator/`        | Create new skills                                    | Adding new skills to the project                    |
| 12  | `agentation`           | `.trae/skills/agentation/`           | Visual UI feedback toolbar                           | Element annotation, UI feedback collection          |
| 13  | `amis-builder`         | `.trae/skills/amis-builder/`         | Amis low-code builder                                | Building amis-based forms and pages                 |

---

## Skill Relationships

```
                    ┌──────────────────┐
                    │  ui-ux-pro-max   │  ← Data-driven design system
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────────┐ ┌───────────┐ ┌──────────────┐
     │gral-frontend   │ │ui-components│ │   routing    │
     │  -design       │ └─────┬─────┘ └──────┬───────┘
     │(18 commands)   │       │              │
     └───────┬────────┘       │              │
             │                │              │
             ▼                ▼              ▼
     ┌────────────┐   ┌───────────┐  ┌────────────┐
     │frontend-   │   │contact-form│  │ admin-auth │
     │code-review │   └─────┬─────┘  └─────┬──────┘
     └────────────┘         │              │
                            └──────┬───────┘
                                   │
                        ┌──────────┼──────────┐
                        ▼          ▼          ▼
                 ┌────────────┐ ┌───────────┐ ┌────────┐
                 │ backend-api │ │docker     │ │agentation│
                 └────────────┘ └───────────┘ └────────┘
```

## Design Skills Decision Tree

```
Need design help?
├── Data-driven design system → ui-ux-pro-max (run search.py)
├── Specific design aspect → gral-frontend-design (pick command)
│   ├── Typography → carattere
│   ├── Layout → componi
│   ├── Color → tinta
│   ├── Animation → anima
│   ├── Responsive → muta
│   ├── UX Writing → lume
│   ├── Polish → lucida
│   └── Audit → scrutinio
├── Code review → frontend-code-review
└── UI feedback → agentation
```

---

## Feature → Skill Mapping

| Feature / Task         | Skills to Check                                                        |
| ---------------------- | ---------------------------------------------------------------------- |
| Design a new page      | `ui-ux-pro-max` → `gral-frontend-design` → `ui-components` → `routing` |
| Typography fix         | `gral-frontend-design` (carattere) → `ui-ux-pro-max`                   |
| Color scheme fix       | `gral-frontend-design` (tinta) → `ui-ux-pro-max`                       |
| Layout/spacing fix     | `gral-frontend-design` (componi)                                       |
| Animation/motion       | `gral-frontend-design` (anima)                                         |
| Full UI audit          | `gral-frontend-design` (scrutinio) → `frontend-code-review`            |
| Final polish pass      | `gral-frontend-design` (lucida)                                        |
| Build contact form     | `ui-ux-pro-max` → `contact-form` → `backend-api`                       |
| Admin login page       | `ui-ux-pro-max` → `admin-auth` → `routing`                             |
| Admin dashboard        | `ui-ux-pro-max` → `admin-auth` → `ui-components` → `backend-api`       |
| Create API endpoint    | `backend-api`                                                          |
| Protect a route        | `admin-auth` → `routing`                                               |
| Database migration     | `backend-api`                                                          |
| Deploy to production   | `docker` → `backend-api` → `seo`                                       |
| Add SEO optimization   | `seo` → `ui-components`                                                |
| Style a component      | `ui-ux-pro-max` → `ui-components`                                      |
| Add form validation    | `contact-form`                                                         |
| Setup navigation       | `routing` → `ui-components`                                            |
| Code review            | `frontend-code-review`                                                 |
| UI feedback collection | `agentation`                                                           |
| Create new skill       | `skill-creator`                                                        |

---

## Workflow Rules

### Rule 1: Design First

**ALWAYS check `ui-ux-pro-max` before any UI work.** Run the design system search to get colors, typography, and style recommendations before writing code.

### Rule 2: Skill Chain

Skills are chained. When using one skill, check its "Related Skills" section to find dependencies. For example:

- `contact-form` → needs `backend-api` (for API endpoint) and `ui-components` (for form styling)
- `admin-auth` → needs `backend-api` (for auth endpoints) and `routing` (for middleware)

### Rule 3: Full Documentation

Each SKILL.md in `.trae/skills/` is a quick reference. For full code examples and patterns, read the corresponding file in `skills/`:

- `.trae/skills/backend-api/SKILL.md` → Full docs: `skills/backend-api.md`
- `.trae/skills/admin-auth/SKILL.md` → Full docs: `skills/admin-auth.md`
- `.trae/skills/contact-form/SKILL.md` → Full docs: `skills/contact-form.md`
- `.trae/skills/routing/SKILL.md` → Full docs: `skills/routing.md`
- `.trae/skills/ui-components/SKILL.md` → Full docs: `skills/ui-components.md`
- `.trae/skills/docker/SKILL.md` → Full docs: `skills/docker.md`

### Rule 4: Rules Enforcement

Each skill references related `.yml` rules in `rules/`. Run `bash rules/check.sh` to validate code against all rules.

---

## Quick Lookup

### Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Express + TypeScript + Prisma ORM
- **Database (Dev):** SQLite
- **Database (Prod):** PostgreSQL
- **Deployment:** Vercel (frontend) + Render (backend + DB)
- **Containerization:** Docker (production only)
- **Auth:** JWT + httpOnly cookies

### Key Files

- `prd.md` — Product Requirements Document
- `production-checklist.md` — Pre-launch production checklist
- `rules/` — Code quality rules (ast-grep)
- `skills/` — Full skill documentation
- `.trae/skills/` — Registered Trae skills
