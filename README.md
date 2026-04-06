# WataTracker

A mobile-first web app for tracking daily habits. Tap "+" to log water intake, strength training, and cardio sessions. Built with React and Supabase.

https://github.com/user-attachments/assets/87c2ce70-6d13-49a2-8db2-dbf4a7999733

## Features

- Username/password authentication with persistent sessions
- Three tracking categories: water (100ml increments), strength training (10min), cardio (10min)
- Bottom tab navigation optimized for phone use
- Each tap records immediately to the database
- Per-user data isolation via Row Level Security

## Quick Start

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run this SQL in the cloud SQL Editor:

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

3. Go to Authentication → Providers → Email and disable "Confirm email"

### 2. Run locally

```bash
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings
npm run dev
```

### 3. Deploy to production

1. In your GitHub repo, go to Settings → Secrets and variables → Actions and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Go to Settings → Pages → Source and select **GitHub Actions**
3. Push to `main` — the workflow builds and deploys automatically
4. Add the Pages URL (`https://ferranrigual.github.io/watatracker/`) to Supabase → Authentication → URL Configuration → Redirect URLs

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18, Vite, TypeScript    |
| Styling  | Tailwind CSS 3                |
| Backend  | Supabase (Auth + PostgreSQL)  |
| Hosting  | GitHub Pages                  |

## License

MIT
