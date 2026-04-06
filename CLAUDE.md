# WataTracker - Claude Code Guide

## Project Overview

WataTracker is a mobile-first daily activity tracker. Users log daily habits (water intake, strength training, cardio) by pressing a "+" button. Each press records a fixed increment to Supabase.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS 3
- **Backend:** Supabase (Auth + PostgreSQL + Row Level Security)
- **Hosting:** Vercel (free tier)
- **Package manager:** npm

## Project Structure

```
watatracker/
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx       # Tab navigation (water/strength/cardio)
│   │   ├── CategoryTab.tsx     # Single category view: today's count + "+" button
│   │   └── ProtectedRoute.tsx  # Auth guard wrapper
│   ├── pages/
│   │   ├── Login.tsx           # Email/password login & signup
│   │   └── Dashboard.tsx       # Main screen, hosts tabs
│   ├── lib/
│   │   └── supabase.ts         # Supabase client init
│   ├── App.tsx                 # Router + auth state
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind imports
├── .env.local                  # Local dev credentials (not committed)
├── .env.example                # Template with placeholder values
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Database Schema

One table in Supabase:

```sql
CREATE TABLE tracking_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category text NOT NULL CHECK (category IN ('water', 'strength', 'cardio')),
  amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security: users only see/insert their own data
ALTER TABLE tracking_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries"
  ON tracking_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON tracking_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Category Configuration

| Category | Label               | Increment per press | Unit    |
|----------|---------------------|---------------------|---------|
| water    | Water               | 100                 | ml      |
| strength | Strength Training   | 10                  | minutes |
| cardio   | Cardio              | 10                  | minutes |

## Key Patterns

- **Auth:** Use `@supabase/supabase-js` client. Call `supabase.auth.signInWithPassword()` for login, `supabase.auth.signUp()` for registration. Session persists in localStorage automatically.
- **Auth state:** Listen to `supabase.auth.onAuthStateChange()` in App.tsx to track login state. Redirect unauthenticated users to Login.
- **Inserting entries:** On "+" press, call `supabase.from('tracking_entries').insert({ user_id, category, amount })`.
- **Querying today's total:** Query with `.select('amount')` filtered by `category` and `created_at` for today's date range, then sum client-side. Alternatively, use a Supabase RPC for server-side sum.
- **Routing:** Use `react-router-dom` v6. Two routes: `/login` and `/` (dashboard). Dashboard uses URL params or local state for active tab.
- **Mobile layout:** Use Tailwind. Full viewport height (`h-dvh`), flex column, bottom nav fixed at bottom. Content area scrollable.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

## Environment Variables

`.env.local` is never committed. Copy `.env.example` and fill in your cloud credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-cloud-anon-key
```

Credentials come from: Supabase Dashboard > Project Settings > API.

**Production** (Vercel): set the same variables in Vercel project settings > Environment Variables.

## Development Notes

- This is a learning project. Favor simplicity over optimization.
- No custom backend — Supabase handles everything server-side.
- No state management library needed — React useState + useEffect is sufficient.
- No undo/delete feature in v1 — just increment.
- Tailwind utility classes only — no custom CSS except Tailwind's base imports.
