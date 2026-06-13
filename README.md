# Zip Puzzle Game

A path-drawing puzzle game built with React, Tailwind CSS, and Supabase. Draw a path through every cell on the grid, hitting numbered waypoints in order.

## Game Modes

- **Daily Challenge** — one shared puzzle worldwide per date (seeded by the date), harder on weekends. Compete on the same board as everyone else.
- **Endless Levels** — procedurally generated, difficulty rises forever: grids grow from 4×4 to 8×8, walls multiply, waypoints thin out. Solve a level to unlock the next; progress and best times are saved locally.

Puzzles are generated with a seeded random Hamiltonian-path algorithm (backbite method), so Level 12 is the same puzzle for every player — leaderboard times stay comparable — while no two levels ever repeat a layout.

## Quick Start (Local Development)

```bash
npm install
npm run dev
```

The game is fully playable locally without Supabase — the leaderboard is disabled until configured, and everything else (puzzles, levels, daily, local best times) works.

## Supabase Setup (for the Leaderboard)

No login required — players just type a name before posting a score. Setup is two short steps: no Google Cloud, no OAuth, no email config.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings > API** and copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the project root (and add the same two vars in Vercel for production):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Create Database Schema

In **Supabase SQL Editor**, run:

```sql
CREATE TABLE scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text,
  display_name text,
  puzzle_id text NOT NULL,
  puzzle_name text,
  time_seconds integer NOT NULL,
  hints_used integer DEFAULT 0,
  solved_at timestamptz DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read the leaderboard
CREATE POLICY "Public read" ON scores
  FOR SELECT USING (true);

-- Anyone can post a score (no login)
CREATE POLICY "Public insert" ON scores
  FOR INSERT WITH CHECK (true);
```

That's it. The `anon` key is safe to expose in the browser — it's designed for public client-side use.

## Deploy to Vercel

1. Push code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) > **New Project** > Import from GitHub
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — you'll get a public URL like `https://zip-game-yourname.vercel.app`

## Game Rules

- Click waypoint **1** to start drawing the path
- Move through adjacent cells (horizontal/vertical only) — click, drag, touch, or arrow keys
- Walls (thick borders) block movement between cells
- Visit **every cell** exactly once
- Pass through numbered waypoints **in order**
- Use hints (max 3 per puzzle) if stuck

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Leaderboard**: Supabase PostgreSQL (no login — name-based)
- **Hosting**: Vercel
