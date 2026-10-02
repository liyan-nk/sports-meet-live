# Sports Meet Live

A real-time college Sports Meet live standings management and poster generation Progressive Web App (PWA).

> **NOTICE**: The dataset currently included is **DEMO DATA** configured for demonstration and presentation purposes. It should not be presented as official Sports Meet results. The scoring rules (e.g. 1st: 10, 2nd: 5, 3rd: 3) are configurable dummy rules and subject to official Sports Meet committee final determination.

---

## Features

- **Live Standings Leaderboard**: Real-time position tracking and total points calculation.
- **Result Operations & Auditing**: Record, view, edit, and delete event results with audit trail (`created_by`, `created_at`).
- **Configurable Scoring Engine**: Dynamic calculation from starting adjustments + results + position rules.
- **Google OAuth Admin Authentication**: Secure login flow restricted via authorized admin email whitelist.
- **Supabase Row Level Security (RLS)**: Enforced database-level protection; public read access with admin-only write policies.
- **Realtime Updates**: Supabase pub/sub syncs live updates instantly across connected public devices.
- **Public Event Results Page (`/results`)**: Detailed breakdown of completed events, placement ranks, and participant names.
- **Public Events Schedule (`/events`)**: Operational status view (Live, Upcoming, Completed, Archived).
- **Poster Generator**: Instant social media poster creation for individual athletes and teams.
- **Nondestructive Photo Cropping**: In-browser pan, zoom, scale-to-fill viewport system with zero blank space leakage.
- **Progressive Web App (PWA)**: Standalone installation support for mobile and desktop screens.

---

## Tech Stack

- **Frontend Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Vanilla CSS & utility classes)
- **Backend & Realtime**: Supabase (PostgreSQL, Realtime, Auth with Google OAuth)
- **State & Graphics**: HTML5 Canvas (Poster Renderer & Crop Engine)
- **PWA**: `vite-plugin-pwa` with service worker precaching

---

## Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/sports-meet-live.git
cd sports-meet-live
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` or `.env.local`:

```bash
cp .env.example .env
```

Define your Supabase project keys:

```env
# Optional: Set real Supabase credentials for cloud backend
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> If environment variables are left blank, the application automatically runs in standalone local mock mode with full in-memory state.

### 4. Run Development Server
Start the Vite local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Quality Audit

Run TypeScript type-checking and linter:

```bash
npm run lint
```

Create production distribution bundle:

```bash
npm run build
```

Production output will be compiled to `dist/`.

---

## Database Migrations (Supabase)

To set up a fresh Supabase database instance:

1. Run `supabase/migrations/001_sports_meet.sql` in Supabase SQL Editor (creates schema & RLS policies).
2. Run `supabase/migrations/002_add_participant_name.sql` (adds `participant_name` field).
3. Run `supabase/migrations/003_demo_seed_data.sql` (populates presentation demo dataset).

Before official sports meet deployment, demo data can be wiped by executing `DELETE FROM public.results;`.
