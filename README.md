# WataTracker

A mobile-first web app for tracking daily habits. Tap "+" to log water intake, strength training, and cardio sessions. Built with React and Supabase.

## Features

- Email/password authentication with persistent sessions
- Three tracking categories: water (100ml increments), strength training (10min), cardio (10min)
- Bottom tab navigation optimized for phone use
- Each tap records immediately to the database
- Per-user data isolation via Row Level Security

## Quick Start

### 1. Run locally (uses a local Supabase instance — no cloud account needed)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

```bash
npm install
npx supabase start        # First run downloads images, takes a few minutes
# Copy the printed API URL and anon key into .env.local
npm run dev
```

The schema is applied automatically from `supabase/migrations/` when `supabase start` runs.

### 2. Deploy to production

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/20240101000000_init.sql` in the cloud SQL Editor
3. Push this repo to GitHub
4. Import at [vercel.com](https://vercel.com) and set env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (from the cloud project)
5. Deploy

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18, Vite, TypeScript    |
| Styling  | Tailwind CSS 3                |
| Backend  | Supabase (Auth + PostgreSQL)  |
| Hosting  | Vercel                        |

## Implementation Plan

This project is designed as a ~1 hour learning session. Follow these phases in order:

### Phase 1: Scaffold (5 min)

- [ ] Run `npm create vite@latest . -- --template react-ts` in this directory
- [ ] Install dependencies: `npm install @supabase/supabase-js react-router-dom`
- [ ] Install Tailwind: `npm install -D tailwindcss @tailwindcss/vite`
- [ ] Configure Tailwind in `vite.config.ts` (add the `@tailwindcss/vite` plugin)
- [ ] Replace `src/index.css` with `@import "tailwindcss";`
- [ ] Create `.env.example` with placeholder values (commit this)
- [ ] Verify `npm run dev` shows the default Vite page

### Phase 2: Supabase Setup — local first (10 min)

Local dev uses a local Supabase instance (Docker). The cloud project is only needed for production.

- [ ] Make sure Docker Desktop is running
- [ ] Run `npx supabase init` — creates `supabase/config.toml`
- [ ] Create the migration file `supabase/migrations/20240101000000_init.sql` with this SQL:

```sql
CREATE TABLE tracking_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category text NOT NULL CHECK (category IN ('water', 'strength', 'cardio')),
  amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracking_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries"
  ON tracking_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON tracking_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

- [ ] Run `npx supabase start` — this pulls Docker images and starts a local instance (first run is slow)
- [ ] Copy the printed `API URL` and `anon key` into `.env.local`:
  ```
  VITE_SUPABASE_URL=http://127.0.0.1:54321
  VITE_SUPABASE_ANON_KEY=<anon key from above>
  ```
- [ ] Create `src/lib/supabase.ts` — initialize the Supabase client:
  ```ts
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```
- [ ] Test connection: temporarily log `supabase.auth.getSession()` in main.tsx
- [ ] Note: local Supabase has a built-in dashboard at http://127.0.0.1:54323 — use it to inspect data

### Phase 3: Authentication (10 min)

- [ ] Create `src/pages/Login.tsx`:
  - Email + password form
  - Two buttons: "Log in" and "Sign up"
  - On login: `supabase.auth.signInWithPassword({ email, password })`
  - On signup: `supabase.auth.signUp({ email, password })`
  - Show error messages inline
- [ ] Create `src/components/ProtectedRoute.tsx`:
  - If no session, redirect to `/login`
  - If session exists, render children
- [ ] Update `src/App.tsx`:
  - Add `react-router-dom` BrowserRouter
  - Track auth state with `supabase.auth.onAuthStateChange()`
  - Routes: `/login` (Login) and `/` (ProtectedRoute > Dashboard)
- [ ] Test: sign up, refresh page (session should persist), log out

### Phase 4: Core UI (15 min)

- [ ] Create `src/components/BottomNav.tsx`:
  - Three tabs: Water, Strength, Cardio
  - Each tab shows an icon or emoji and label
  - Highlight active tab
  - Fixed to bottom of viewport
  - Use flexbox, equal width tabs
- [ ] Create `src/pages/Dashboard.tsx`:
  - State for active tab (default: 'water')
  - Render BottomNav, pass active tab + setter
  - Render CategoryTab for the active category
  - Add a logout button in the top bar
- [ ] Create `src/components/CategoryTab.tsx`:
  - Props: category name, unit label, increment amount
  - Show today's total (start with hardcoded 0)
  - Large "+" button (easy to tap on phone)
  - Style: centered content, large text, prominent button
- [ ] Test on phone: access via `http://<your-ip>:5173`

### Phase 5: Data Layer (10 min)

- [ ] In CategoryTab, on "+" press:
  ```ts
  await supabase.from('tracking_entries').insert({
    user_id: session.user.id,
    category: category,
    amount: incrementAmount,
  })
  ```
- [ ] On mount + after each insert, fetch today's total:
  ```ts
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('tracking_entries')
    .select('amount')
    .eq('category', category)
    .gte('created_at', today)
    .lt('created_at', tomorrow)
  const total = data?.reduce((sum, row) => sum + row.amount, 0) ?? 0
  ```
- [ ] Display the total with the unit (e.g., "300 ml", "20 minutes")
- [ ] Test: press "+", verify count updates, refresh page, verify persistence

### Phase 6: Deploy (10 min)

**Apply schema to cloud Supabase:**
- [ ] Create a cloud Supabase project at supabase.com (if not already done)
- [ ] Go to SQL Editor and run the SQL from `supabase/migrations/20240101000000_init.sql`
- [ ] In Authentication > Providers > Email: disable "Confirm email" (simpler for learning)

**Deploy to Vercel:**
- [ ] Commit everything: `git add -A && git commit -m "build: complete app"`
- [ ] Push to GitHub: `git push`
- [ ] Go to vercel.com, import the GitHub repo
- [ ] Add environment variables in Vercel project settings (cloud Supabase URL + anon key)
- [ ] Deploy and test the live URL on your phone
- [ ] Add the Vercel URL to Supabase > Authentication > URL Configuration > Redirect URLs

## License

MIT
