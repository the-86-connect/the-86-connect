# Build Workflow Rules

**CRITICAL: These rules apply to EVERY build task. Read this file first before any code generation.**

## Mandatory Startup Sequence

When asked to build, create, or modify any part of the app, the AI MUST follow this sequence:

### Step 0: Read Essential Files (ALWAYS)

1. **Read `.trae/skills/INDEX.md`** — Know all 13 available skills
2. **Read `prd.md`** — Understand project requirements and tech stack
3. **Read `production-checklist.md`** — Know production requirements

### Step 1: Design (for any UI work)

**For ALL UI/design work, invoke these skills in order:**

1. **`ui-ux-pro-max`** — Generate design system (colors, typography, styles)
   - Run: `python .trae/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "86 Connects"`
2. **`gral-frontend-design`** — Apply specific design aspects
   - Read `.gral/commands/magistero.md` for core design principles
   - Read `.gral/commands/carattere.md` for typography
   - Read `.gral/commands/componi.md` for layout
   - Read `.gral/commands/tinta.md` for color
   - Read `.gral/commands/anima.md` for animation
   - Read `.gral/commands/lucida.md` for polish

### Step 2: Implementation (for any code work)

**For EACH component/page being built, invoke these skills:**

1. **`ui-components`** — Component patterns (shadcn/ui + Tailwind)
2. **`routing`** — Route setup and navigation
3. **`contact-form`** — Form validation and submission
4. **`backend-api`** — API endpoints and database
5. **`admin-auth`** — Authentication and route protection
6. **`docker`** — Containerization (production only)

### Step 3: Review (before delivering)

**Before delivering any code:**

1. **`frontend-code-review`** — Run code review checklist
2. **`gral-frontend-design`** (scrutinio) — UI audit
3. **`gral-frontend-design`** (lucida) — Final polish
4. Run `bash rules/check.sh` — Validate against all code rules

## Skill Invocation Rules

### Rule A: Design First

**NEVER write UI code without first invoking `ui-ux-pro-max`.** This is non-negotiable.

### Rule B: Skill Chain

When invoking a skill, check its "Related Skills" section and invoke those too.

- `contact-form` → also invoke `backend-api`, `ui-components`
- `admin-auth` → also invoke `backend-api`, `routing`
- `routing` → also invoke `ui-components`

### Rule C: Full Documentation

Each skill's SKILL.md is a quick reference. For full patterns, read the corresponding file in `skills/`:

- `backend-api` → `skills/backend-api.md`
- `admin-auth` → `skills/admin-auth.md`
- `contact-form` → `skills/contact-form.md`
- `routing` → `skills/routing.md`
- `ui-components` → `skills/ui-components.md`
- `docker` → `skills/docker.md`

### Rule D: Rules Enforcement

Run `bash rules/check.sh` after every significant code change to validate against all 14 rules.

## Task-Specific Checklists

### Building a New Page

```
[ ] Read .trae/skills/INDEX.md
[ ] Invoke ui-ux-pro-max (design system)
[ ] Invoke gral-frontend-design (specific design)
[ ] Invoke ui-components (component patterns)
[ ] Invoke routing (route setup)
[ ] Read skills/ui-components.md
[ ] Read skills/routing.md
[ ] Build component
[ ] Invoke frontend-code-review
[ ] Run bash rules/check.sh
```

### Building the Contact Form

```
[ ] Read .trae/skills/INDEX.md
[ ] Invoke ui-ux-pro-max (design system)
[ ] Invoke contact-form (form patterns)
[ ] Invoke ui-components (form styling)
[ ] Invoke backend-api (API endpoint)
[ ] Read skills/contact-form.md
[ ] Read skills/backend-api.md
[ ] Build form component
[ ] Build API endpoint
[ ] Invoke frontend-code-review
[ ] Run bash rules/check.sh
```

### Building Admin Dashboard

```
[ ] Read .trae/skills/INDEX.md
[ ] Invoke ui-ux-pro-max (design system)
[ ] Invoke admin-auth (authentication)
[ ] Invoke routing (route protection)
[ ] Invoke ui-components (table/UI patterns)
[ ] Invoke backend-api (data fetching)
[ ] Read skills/admin-auth.md
[ ] Read skills/backend-api.md
[ ] Build login page
[ ] Build dashboard page
[ ] Build middleware
[ ] Invoke frontend-code-review
[ ] Run bash rules/check.sh
```

### Building API Endpoint

```
[ ] Read .trae/skills/INDEX.md
[ ] Invoke backend-api (API patterns)
[ ] Read skills/backend-api.md
[ ] Build endpoint
[ ] Build validation
[ ] Run bash rules/check.sh
```

### Deploying to Production

```
[ ] Read .trae/skills/INDEX.md
[ ] Read production-checklist.md
[ ] Invoke docker (containerization)
[ ] Read skills/docker.md
[ ] Verify all checklist items
```
