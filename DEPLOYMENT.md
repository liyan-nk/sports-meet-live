# SPORTS MEET LIVE 2026 — PRODUCTION DEPLOYMENT GUIDE

This document provides step-by-step instructions for deploying the **SPORTS MEET LIVE 2026** web application using free/zero-cost cloud infrastructure (Vercel/Netlify + Supabase Free Tier).

---

## 1. Prerequisites & Architecture Overview

- **Frontend Hosting**: Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
- **Backend / Database**: Supabase (PostgreSQL, Realtime Pub/Sub, Auth with Google OAuth).
- **Client Framework**: React 18 + Vite + TailwindCSS + PWA.

---

## 2. Supabase Setup & SQL Migration

1. **Create a Supabase Project**:
   - Go to [Supabase Console](https://supabase.com) and create a new project.
   - Save your **Project URL** and **`anon` Public API Key** from `Project Settings -> API`.

2. **Run SQL Migration**:
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Copy the entire contents of [`supabase/migrations/001_sports_meet.sql`](file:///home/liyan/Projects/sports_meet/supabase/migrations/001_sports_meet.sql).
   - Execute the SQL script. This sets up:
     - `teams`, `events`, `scoring_rules`, `standings_adjustments`, `results`, `authorized_admins` tables.
     - Row Level Security (RLS) policies allowing public read and restricting writes to active authorized admins.
     - Realtime publication subscriptions (`supabase_realtime` publication).

3. **Enable Realtime**:
   - In Supabase dashboard, navigate to `Database -> Realtime`.
   - Ensure `results`, `standings_adjustments`, `events`, and `scoring_rules` tables have Realtime enabled.

---

## 3. Google OAuth & Whitelist Setup

1. **Configure Google OAuth Provider in Supabase**:
   - Go to Google Cloud Console (`https://console.cloud.google.com`).
   - Create OAuth 2.0 Credentials (Web application).
   - Add Authorized Redirect URIs provided in Supabase `Authentication -> Providers -> Google` (e.g., `https://<project-ref>.supabase.co/auth/v1/callback`).
   - Copy the Client ID and Client Secret into Supabase `Authentication -> Providers -> Google` settings and enable Google login.

2. **Set Authorized Redirect URLs**:
   - In Supabase `Authentication -> URL Configuration`:
     - **Site URL**: `https://your-app-domain.vercel.app`
     - **Redirect URLs**: `https://your-app-domain.vercel.app/admin` and `https://your-app-domain.vercel.app/`

3. **Seed Initial Admin Whitelist**:
   - Run the following SQL statement in Supabase SQL Editor replacing `your.email@gmail.com` with your Google login email:
     ```sql
     INSERT INTO public.authorized_admins (email, name, active)
     VALUES ('your.email@gmail.com', 'Lead Sports Officer', true)
     ON CONFLICT (email) DO UPDATE SET active = true;
     ```

---

## 4. Environment Variables

Create `.env` or set environment variables in your deployment hosting provider (Vercel/Netlify):

```env
# Required for live database & auth integration
VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-public-key>
```

> **Note**: Never expose service role keys or commit `.env` files to git repository.

---

## 5. Production Build & Deployment Command

To build the static production distribution locally or on CI/CD:

```bash
# 1. Install dependencies
npm install

# 2. Run typecheck & linter
npm run lint

# 3. Create production bundle
npm run build
```

The compiled output directory is `dist/`.

---

## 6. Single-Page Application (SPA) Routing Configuration

Ensure single-page routing fallbacks (`/results`, `/events`, `/admin`, `/admin/admins`) route to `index.html`:

- **Vercel**: Include `vercel.json` (already pre-configured).
- **Netlify**: Create `public/_redirects` with content `/* /index.html 200`.

---

## 7. PWA Considerations

- The application includes service worker auto-update via `vite-plugin-pwa`.
- Web manifest is served from `/manifest.webmanifest`.
- Standings are optimized for standalone mobile app installation.
- Realtime pub/sub handles live updates without aggressive stale data caching.
