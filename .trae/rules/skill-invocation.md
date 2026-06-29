# Skill Invocation Rules

**MANDATORY: Before writing ANY code, invoke ALL relevant skills from this list.**

## How This Works

When the user asks you to build, create, modify, or fix anything in this project, you MUST:

1. **First**, read `.trae/skills/INDEX.md` to see all 13 available skills
2. **Then**, invoke the specific skills listed below for the user's task
3. **Then**, read the full documentation in `skills/*.md` for code patterns
4. **Only then**, write the code

## Skill Invocation Matrix

### If user asks to build/create/design ANY UI:

```
[ ] Invoke: ui-ux-pro-max          ← ALWAYS FIRST for design
[ ] Invoke: gral-frontend-design   ← Specific design aspects
[ ] Invoke: ui-components          ← Component patterns
```

### If user asks about forms/validation:

```
[ ] Invoke: contact-form           ← Form patterns + Zod
[ ] Invoke: ui-components          ← Form component styling
[ ] Invoke: backend-api            ← API endpoint for submission
```

### If user asks about admin/auth/login:

```
[ ] Invoke: admin-auth             ← JWT + httpOnly cookies
[ ] Invoke: routing                ← Route protection + middleware
[ ] Invoke: backend-api            ← Auth API endpoints
```

### If user asks about routing/navigation:

```
[ ] Invoke: routing                ← Next.js App Router patterns
[ ] Invoke: ui-components          ← Navigation components
```

### If user asks about SEO/metadata/sitemap:

```
[ ] Invoke: seo                     ← Meta tags, Open Graph, JSON-LD, sitemap
[ ] Invoke: ui-components           ← Image alt text, heading hierarchy
```

### If user asks about API/backend/database:

```
[ ] Invoke: backend-api            ← Express + Prisma patterns
[ ] Read: skills/backend-api.md    ← Full code examples
```

### If user asks about deployment/Docker:

```
[ ] Invoke: docker                 ← Dockerfile + Render config
[ ] Invoke: backend-api            ← Deployment environment
```

### If user asks for code review:

```
[ ] Invoke: frontend-code-review   ← Code review checklist
[ ] Invoke: gral-frontend-design   ← scrutinio audit command
```

### If user asks about design system:

```
[ ] Invoke: ui-ux-pro-max          ← Generate design system
[ ] Invoke: gral-frontend-design   ← Apply design principles
```

### If user asks about UI feedback:

```
[ ] Invoke: agentation             ← Visual feedback toolbar
```

### If user asks to create a new skill:

```
[ ] Invoke: skill-creator          ← Skill creation workflow
```

## Quick Reference: All 13 Skills

| #   | Skill Name             | Domain   | Invoke When                                                            |
| --- | ---------------------- | -------- | ---------------------------------------------------------------------- |
| 1   | `ui-ux-pro-max`        | Design   | ANY UI work — always first                                             |
| 2   | `gral-frontend-design` | Design   | Specific design aspects (typography, layout, color, animation, polish) |
| 3   | `frontend-code-review` | Quality  | Code review, PR review                                                 |
| 4   | `seo`                  | SEO      | Meta tags, Open Graph, JSON-LD, sitemap, alt text, headings            |
| 5   | `backend-api`          | Backend  | API endpoints, database, Prisma, migrations                            |
| 6   | `admin-auth`           | Auth     | Login, route protection, JWT, cookies                                  |
| 7   | `contact-form`         | Frontend | Form validation, React Hook Form, Zod                                  |
| 8   | `routing`              | Frontend | Next.js App Router, navigation, middleware                             |
| 9   | `ui-components`        | Frontend | shadcn/ui, Tailwind, component patterns                                |
| 10  | `docker`               | DevOps   | Dockerfile, docker-compose, Render deployment                          |
| 11  | `skill-creator`        | Meta     | Creating new skills                                                    |
| 12  | `agentation`           | Tools    | UI feedback toolbar                                                    |
| 13  | `amis-builder`         | Tools    | Amis low-code builder                                                  |

## Critical Rules

### NEVER skip design

If the task involves ANY visual output, invoke `ui-ux-pro-max` FIRST. No exceptions.

### NEVER skip review

Before delivering code, invoke `frontend-code-review` and run `bash rules/check.sh`.

### ALWAYS read full docs

Each SKILL.md is a summary. For code examples, read the full file in `skills/`.

### ALWAYS chain skills

Skills depend on each other. Check the "Related Skills" section of each skill.

## Example: User says "Build the contact form"

```
1. Invoke: ui-ux-pro-max          (design system)
2. Invoke: contact-form           (form patterns)
3. Invoke: ui-components          (component styling)
4. Invoke: backend-api            (API endpoint)
5. Read: skills/contact-form.md   (full code)
6. Read: skills/backend-api.md    (full code)
7. Build: form component + API
8. Invoke: frontend-code-review   (review)
9. Run: bash rules/check.sh       (validate)
```

## Example: User says "Build the admin dashboard"

```
1. Invoke: ui-ux-pro-max          (design system)
2. Invoke: admin-auth             (authentication)
3. Invoke: routing                (route protection)
4. Invoke: ui-components          (table/UI)
5. Invoke: backend-api            (data fetching)
6. Read: skills/admin-auth.md     (full code)
7. Read: skills/backend-api.md    (full code)
8. Build: login + dashboard
9. Invoke: frontend-code-review   (review)
10. Run: bash rules/check.sh      (validate)
```
