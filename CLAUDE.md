# stable. — Claude Code Configuration

## Project Overview

ADHD productivity app. Monorepo (pnpm + Turborepo) with a Next.js API and Expo mobile app.

## Structure

```
apps/
  api/      → Next.js 15, tRPC, Clerk, Stripe, Resend, Upstash Redis — deploys to Vercel
  mobile/   → Expo ~54 / React Native, expo-router, Clerk Expo
packages/
  db/       → Supabase JS client (shared across apps)
  shared/   → Shared types and utilities
```

## Tech Stack

| Concern      | Tool                  |
|--------------|-----------------------|
| Auth         | Clerk                 |
| Database     | Supabase              |
| Payments     | Stripe                |
| Email        | Resend                |
| Cache        | Upstash Redis         |
| API layer    | tRPC v11              |
| Validation   | Zod                   |
| Styling      | Tailwind CSS (api)    |
| Testing      | Vitest (api)          |
| Deploy       | Vercel (api), EAS (mobile) |

## Key Commands

```bash
pnpm dev              # Run all apps (turbo)
pnpm build            # Build all
pnpm test             # Run all tests

# API only
cd apps/api && pnpm dev       # port 3001
cd apps/api && pnpm test

# Mobile only
cd apps/mobile && pnpm dev    # expo start
cd apps/mobile && pnpm ios
cd apps/mobile && pnpm android

# Utility scripts (run from repo root)
pnpm repair:stripe-emails
pnpm repair:stripe-emails:dry
pnpm reset:test-users
```

## Rules

- API routes go in `apps/api/app/`, tRPC routers in `apps/api/src/routers/`
- Shared types/utils go in `packages/shared/src/` — never duplicate between apps
- DB access goes through `packages/db/` — never import Supabase directly in apps
- Env files: `apps/api/.env.local` — never commit secrets
- Always run `pnpm test` after API changes
- Keep files under 500 lines
- Validate at system boundaries (tRPC inputs use Zod)
