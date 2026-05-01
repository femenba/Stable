# stable. UI Redesign Design Spec

## Goal

Rebuild the web app UI to match the approved mobile-first mockup: centered layout, bottom tab navigation, dual light/dark theme with toggle, task categories, and AI insight card. Lay the design foundation for an Expo mobile app that shares the same visual language.

## Architecture

Single theme system using CSS custom properties on `<html data-theme="light|dark">`. Tailwind's `darkMode: 'class'` is already available but we'll use a `data-theme` attribute + CSS variables approach so the same tokens can later be shared with Expo via a design-token package. All web pages replace the current sidebar layout with a mobile-first centered shell (~480px max-width) plus a fixed bottom tab bar.

## Design Tokens

### Light mode (matches original approved mockup)
| Token | Value |
|---|---|
| Background | `#fafafe` |
| Card background | `#ffffff` |
| Card border | `#f0eeff` |
| Header gradient | `linear-gradient(160deg, #4f3aff 0%, #7c3aed 50%, #c026d3 100%)` |
| Nav background | `#ffffff` |
| Nav border | `#f0eeff` |
| Primary text | `#111111` |
| Secondary text | `#888888` |
| Muted text | `#bbbbbb` |

### Dark mode
| Token | Value |
|---|---|
| Background | `#120e24` |
| Card background | `#1a1535` |
| Card border | `#2a1f60` |
| Header gradient | `linear-gradient(160deg, #1e1260 0%, #120e24 70%)` |
| Nav background | `#120e24` |
| Nav border | `#1e1a38` |
| Primary text | `#e2d9f3` |
| Secondary text | `#8b7ab8` |
| Muted text | `#3a2f5a` |

### Task category accent colours (both modes)
| Category | Accent colour | Tag bg (light) | Tag bg (dark) |
|---|---|---|---|
| Work | `#4f3aff` / `#6366f1` | `#eef0ff` | `rgba(99,102,241,0.2)` |
| Personal | `#7c3aed` / `#a855f7` | `#f3e8ff` | `rgba(168,85,247,0.2)` |
| Family | `#be185d` / `#ec4899` | `#fdf2f8` | `rgba(236,72,153,0.12)` |
| Health | `#0891b2` / `#22d3ee` | `#cffafe` | `rgba(34,211,238,0.15)` |
| Other | `#6b7280` / `#9ca3af` | `#f3f4f6` | `rgba(156,163,175,0.15)` |

## Layout

- **Shell**: `max-width: 480px`, horizontally centred, `min-height: 100svh`
- **Header**: Full-width gradient band at the top of each page. Contains page title + theme toggle pill (☀️ Light / 🌙 Dark) anchored to the right
- **Body**: Scrollable content area between header and bottom nav
- **Bottom tab bar**: Fixed, 4 tabs — Today · Tasks · Focus · Reminders — with active indicator dot + label colour change

## Pages

### Today
1. Header — gradient, "Three things. That's it." / "One at a time." subline
2. AI insight card — STABLE AI badge, personalised sentence about yesterday's performance
3. Top-3 task cards — coloured left border, category tag, duration
4. "Start focus session" CTA button (gradient fill)

### Tasks
- Full task list grouped by priority (High / Medium / Low)
- Each card: title, category tag, due date, duration, complete/delete actions
- FAB or top button to create new task (category picker: Work / Personal / Family / Health / Other)

### Focus
- Active session view: task name, live timer, pause/end/abandon buttons
- Session history list below (or empty state)

### Reminders
- List of reminders with snooze/dismiss
- Create reminder button

## Theme Toggle

- Pill component in every page header, top-right
- Reads `localStorage` key `stable-theme` on mount; defaults to `light`
- Writes `data-theme` attribute on `<html>`
- No flash on load: inline script in `<head>` sets attribute before first paint

## Database Change

Add `category` column to `tasks` table:
```sql
ALTER TABLE tasks ADD COLUMN category TEXT NOT NULL DEFAULT 'other'
  CHECK (category IN ('work','personal','family','health','other'));
```

## Components to Build / Replace

| Component | Action |
|---|---|
| `src/components/shell.tsx` | CREATE — mobile shell wrapper with bottom nav |
| `src/components/theme-toggle.tsx` | CREATE — ☀️/🌙 pill button |
| `src/components/task-card.tsx` | CREATE — replaces task-item.tsx with new visual design |
| `src/components/ai-insight.tsx` | CREATE — STABLE AI card |
| `src/components/sidebar.tsx` | DELETE (replaced by shell) |
| `app/(dashboard)/layout.tsx` | REPLACE — sidebar layout → shell layout |
| All dashboard page files | REWRITE with new design |
| `tailwind.config.ts` | UPDATE — add all design token colours |
| `app/globals.css` | UPDATE — CSS custom properties for both themes |

## Out of Scope (this spec)

- Expo mobile app (separate spec + plan after web is complete)
- Real AI insight generation (static placeholder text for now)
- Push notifications

## Success Criteria

1. App loads in light mode by default; toggle switches to dark and persists across refreshes
2. All four tabs are functional with correct data
3. Tasks can be created with a category; category shown as coloured tag
4. Design matches the approved mockup screenshots pixel-close on a 390px viewport
5. No layout shift or flash of unstyled content on load
