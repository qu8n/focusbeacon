# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Focusbeacon is an unofficial third-party productivity dashboard for Focusmate users. It's a full-stack application with a Next.js 14 frontend and FastAPI backend, deployed on Vercel.

## Key Commands

```bash
# Development - runs Next.js (port 3000) + FastAPI (port 8000) concurrently
npm run dev

# Run servers individually
npm run next-dev       # Next.js only
npm run fastapi-dev    # FastAPI only (auto-reloads)

# Build & lint
npm run build
npm run lint

# Generate TypeScript types from Supabase schema
npm run supabase-typegen
```

**Python setup** (optional - `npm run dev` handles this automatically via `uv`):
```bash
uv sync  # Install dependencies and create .venv
```

## Architecture

### Backend (FastAPI - Python 3.12)

- **Entry point**: `api/index.py` - All REST endpoints for stats, streaks, goals, history
- **Utilities**: `api_utils/` - Data processing modules:
  - `metric.py` - Streak & analytics calculations using Pandas
  - `focusmate.py` - Focusmate API integration
  - `faker.py` - Demo data generator
  - `time.py` - Timezone-aware date utilities
  - `supabase.py` - Database operations
  - `encryption.py` - Session encryption

**Caching**: TTLCache with 60s TTL for regular users, 24h for demo mode.

### Frontend (Next.js 14 App Router - TypeScript)

- **Pages**: `app/` - App Router pages
  - `app/dashboard/` - Main dashboard views (streak, week, month, year, lifetime)
  - `app/api/` - Next.js API routes for OAuth and session management
- **Components**: `components/` - Reusable UI (ui/, common/, charts/)
- **Hooks**: `hooks/` - Custom hooks for auth, routing, breakpoints
- **Lib**: `lib/` - Config, utilities, Supabase client

### Authentication (BFF Pattern)

1. User initiates OAuth with Focusmate
2. `/api/callback` exchanges code for access token
3. Token encrypted and stored in Supabase
4. Session ID stored in httpOnly cookie
5. Protected routes verify session via middleware (`middleware.ts`)

### Database (Supabase/PostgreSQL)

- `profile` - User profiles with encrypted OAuth tokens
- `goals` - Weekly session goals
- `daily_streaks` - Daily streak tracking

Types auto-generated to `types/supabase.ts` via `npm run supabase-typegen`.

## UI Stack

- **Styling**: TailwindCSS with Catppuccin Mocha theme (custom bg: `#0a0a0f`)
- **Components**: Radix UI primitives, custom components in `components/ui/`
- **Charts**: Recharts, Nivo Calendar for heatmaps
- **State**: TanStack React Query for data fetching

## Demo Mode

Add `?demo=true` to any dashboard route to view with fake data. Demo mode uses `DEMO_USER_ID` from env and has 24h cache TTL.

## Environment Variables

See `.env.example`. Key variables:
- `NEXT_PUBLIC_FM_OAUTH_CLIENT_ID` / `FM_OAUTH_CLIENT_SECRET` - Focusmate OAuth (request via developer@focusmate.com)
- `ENCRYPTION_KEY` / `ENCRYPTION_AES_IV` - Generate with `crypto.randomBytes(32).toString("hex")`
- `SUPABASE_PROJECT_URL` / `SUPABASE_SERVICE_ROLE_KEY` - Database connection

## API Routes

FastAPI endpoints are proxied via Next.js rewrites (see `next.config.js`):
- `/api/py/*` → FastAPI backend

Key FastAPI endpoints in `api/index.py`:
- `/streak`, `/week`, `/month`, `/year`, `/lifetime` - Dashboard stats
- `/history` - Paginated session history
- `/goals` - Weekly goal management
