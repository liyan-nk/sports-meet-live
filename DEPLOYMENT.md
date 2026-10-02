# SPORTS MEET LIVE 2026 — PRODUCTION DEPLOYMENT GUIDE

This document provides step-by-step instructions for deploying the **SPORTS MEET LIVE 2026** web application using Appwrite backend infrastructure and Vercel hosting.

---

## 1. Prerequisites & Architecture Overview

- **Frontend Hosting**: Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
- **Backend / Database**: Appwrite (Cloud or Self-Hosted Appwrite instance: Databases, Realtime Pub/Sub, Auth).
- **Client Framework**: React 18 + Vite + TailwindCSS + PWA.

---

## 2. Appwrite Setup & Demo Database Seeding

1. **Create an Appwrite Project**:
   - Log into your Appwrite Console or self-hosted Appwrite instance.
   - Create a new project (e.g. `sports-meet-live`).
   - Copy your **Project ID** and **API Endpoint** (e.g. `https://cloud.appwrite.io/v1`).

2. **Database & Collections Setup**:
   - Create a Database in Appwrite (or let the setup script auto-create it).
   - Use the included setup script to provision collections (`teams`, `events`, `scoring_rules`, `standings_adjustments`, `results`, `authorized_admins`) and seed initial demo data:
     ```bash
     export APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
     export APPWRITE_PROJECT_ID="your-project-id"
     export APPWRITE_API_KEY="your-server-api-key" # Needs database & collection administrative permissions
     node scripts/setup_appwrite_demo.js
     ```

3. **Collection Permissions & Realtime**:
   - Ensure collections have **Any** read access (`read("any")`) enabled for public standings visibility.
   - Writes are authorized through Appwrite Auth and verified against the `authorized_admins` collection.

---

## 3. Appwrite Authentication & Whitelist Setup

1. **Configure Auth Providers**:
   - In your Appwrite project dashboard, enable Google OAuth or Email/Password under **Auth -> Settings**.
   - Add your client domain (e.g., `localhost`, `your-app.vercel.app`) under **Settings -> Web Platforms**.

2. **Seed Initial Admin Whitelist**:
   - The setup script seeds the default admin whitelist. Additional admins can be managed through the Admin Console (`/admin/admins`) or directly in the `authorized_admins` collection.

---

## 4. Environment Variables

Create `.env` or set environment variables in your deployment hosting provider (Vercel/Netlify):

```env
# Required for Appwrite live database & auth integration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-appwrite-project-id
VITE_APPWRITE_DATABASE_ID=sports_meet
```

> **Note**: Only client-safe `VITE_APPWRITE_*` environment variables should be exposed to the browser. Never commit secret API keys.

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

