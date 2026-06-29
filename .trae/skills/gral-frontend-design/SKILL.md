---
name: gral-frontend-design
description: "Frontend Design Skills system with 18 specialized design commands covering typography, layout, color, animation, responsive design, UX writing, onboarding, performance, accessibility, and design system management. Includes 8 reference files on craft, color, interaction, motion, responsive, spatial, typography, and UX writing. Use when designing, auditing, polishing, or improving any frontend UI."
---

# Gral Frontend Design Skill

A system of 18 specialized design commands and 8 reference files for frontend design excellence. Each command targets a specific aspect of interface quality.

## Commands (in `.claude/commands/`)

### Foundation
| Command | File | Purpose |
|---------|------|---------|
| **magistero** | `magistero.md` | Core design skill — principles, anti-patterns, AI Slop Test. Modes: `teach`, `craft`, default |
| **forgia** | `forgia.md` | UX/UI planning — discovery interview, design brief |

### Building
| Command | File | Purpose |
|---------|------|---------|
| **carattere** | `carattere.md` | Typography — fonts, hierarchy, scale, weight, readability |
| **componi** | `componi.md` | Layout & spacing — grid, rhythm, visual hierarchy, density |
| **tinta** | `tinta.md` | Color — strategic palette, semantic color, OKLCH, accessibility |
| **anima** | `anima.md` | Animation — micro-interactions, choreography, easing, reduced motion |
| **muta** | `muta.md` | Responsive — cross-device, touch targets, breakpoints |
| **lume** | `lume.md` | UX writing — error messages, labels, microcopy, empty states |
| **incanto** | `incanto.md` | Delight — personality, easter eggs, celebrations, loading states |
| **inizia** | `inizia.md` | Onboarding — first-run experience, empty states, progressive disclosure |

### Tuning
| Command | File | Purpose |
|---------|------|---------|
| **ardore** | `ardore.md` | Amplify — make safe/boring designs impactful |
| **smorza** | `smorza.md` | Tone down — reduce aggressive designs to refined |
| **distilla** | `distilla.md` | Simplify — strip to essence, remove complexity |

### Hardening
| Command | File | Purpose |
|---------|------|---------|
| **affina** | `affina.md` | Performance — loading, rendering, bundle, Core Web Vitals |
| **tempra** | `tempra.md` | Resilience — error handling, i18n, text overflow, edge cases |
| **allinea** | `allinea.md` | Design system — realign to tokens, patterns, standards |

### Quality
| Command | File | Purpose |
|---------|------|---------|
| **scrutinio** | `scrutinio.md` | Audit — scored report (a11y, perf, theming, responsive, anti-patterns) |
| **lucida** | `lucida.md` | Polish — alignment, spacing, states, transitions, code quality |

## Reference Files (in `.claude/reference/`)

| File | Topic |
|------|-------|
| `craft.md` | Design craft principles |
| `color-and-contrast.md` | Color theory and contrast |
| `interaction-design.md` | Interaction patterns |
| `motion-design.md` | Motion and animation |
| `responsive-design.md` | Responsive design |
| `spatial-design.md` | Spatial design and layout |
| `typography.md` | Typography systems |
| `ux-writing.md` | UX writing and microcopy |

## Workflows

### New Feature (full process)
1. Read `.claude/commands/magistero.md` → establish design context
2. Read `.claude/commands/forgia.md` → discovery + design brief
3. Read `.claude/commands/magistero.md` → craft mode, build with visual iteration
4. Read `.claude/commands/scrutinio.md` → technical audit
5. Read `.claude/commands/lucida.md` → final polish

### Improve Existing UI
1. Read `.claude/commands/scrutinio.md` → find issues
2. Read `.claude/commands/carattere.md` → fix typography
3. Read `.claude/commands/componi.md` → fix layout/spacing
4. Read `.claude/commands/tinta.md` → fix color
5. Read `.claude/commands/lucida.md` → final polish

### Production Hardening
1. Read `.claude/commands/tempra.md` → edge cases, i18n, error states
2. Read `.claude/commands/affina.md` → performance optimization
3. Read `.claude/commands/allinea.md` → design system alignment

### Make Bolder / Quieter
1. Read `.claude/commands/ardore.md` → amplify bland designs
2. Read `.claude/commands/smorza.md` → tone down aggressive designs

## When to Use

| Scenario | Commands to Read |
|----------|-----------------|
| Starting a new design | `magistero.md` → `forgia.md` |
| Typography issues | `carattere.md` |
| Layout/spacing problems | `componi.md` |
| Color scheme issues | `tinta.md` |
| Animation/motion work | `anima.md` |
| Mobile/responsive fixes | `muta.md` |
| Writing error messages | `lume.md` |
| Adding delight/personality | `incanto.md` |
| Onboarding flow | `inizia.md` |
| Design is too boring | `ardore.md` |
| Design is too aggressive | `smorza.md` |
| Simplify complex UI | `distilla.md` |
| Performance optimization | `affina.md` |
| Error handling/edge cases | `tempra.md` |
| Design system alignment | `allinea.md` |
| Full UI audit | `scrutinio.md` |
| Final polish pass | `lucida.md` |

## Integration with Other Skills

This skill complements:
- `ui-ux-pro-max` — For data-driven design system generation (colors, typography, styles)
- `frontend-code-review` — For code-level review
- `ui-components` — For component implementation patterns

**Rule of thumb:** Use `ui-ux-pro-max` first to generate the design system, then use `gral-frontend-design` commands for specific design aspects.