# SPORTS MEET LIVE 2026 — DESIGN SYSTEM

A minimal, light-first, highly readable modern sports scoreboard design system inspired by Apple Sports and Linear.

---

## 1. Design Principles

- **Fast to Understand, Fast to Use, Excellent on Phone**.
- **Light-First Aesthetics**: Clean, bright neutrals (`#f8fafc`, `#ffffff`), crisp borders (`#e2e8f0`), deep slate typography (`#0f172a`).
- **No Unnecessary Visual Noise**: No complex gradients, no glassmorphism, no heavy shadows, no dark/rainbow dashboard chaos.
- **Mobile First**: Optimized for 360px–430px wide viewports with responsive expansion up to 1440px+ desktop monitors.
- **Scannable Hierarchy**: Visually prominent tabular numbers for team scores and position ranks.

---

## 2. Color System

### Base & Neutrals
- **App Background**: `bg-slate-50` (`#f8fafc`)
- **Card Background**: `bg-white` (`#ffffff`)
- **Card Border**: `border-slate-200` (`#e2e8f0`) / hover `border-slate-300`
- **Text Primary**: `text-slate-900` (`#0f172a`)
- **Text Secondary**: `text-slate-500` (`#64748b`)
- **Text Muted**: `text-slate-400` (`#94a3b8`)

### Brand & Sports Accent
- **Primary Accent**: Athletic Blue `bg-blue-600` (`#2563eb`), hover `bg-blue-700` (`#1d4ed8`)
- **Live Indicator**: Emerald `bg-emerald-500` / `text-emerald-700` / `bg-emerald-50`

### Position Badges (Podium Ranks)
- **1st Gold**: `bg-amber-100 text-amber-900 border border-amber-300 font-bold`
- **2nd Silver**: `bg-slate-100 text-slate-800 border border-slate-300 font-bold`
- **3rd Bronze**: `bg-orange-100 text-orange-900 border border-orange-300 font-bold`
- **4th+ Position**: `bg-slate-50 text-slate-600 border border-slate-200 font-medium`

---

## 3. Typography

- **Font Family**: System Sans-Serif (`Inter`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`)
- **App Title**: 20px–24px, Bold tracking-tight (`text-xl sm:text-2xl font-bold`)
- **Page Title**: 24px–30px, Bold tracking-tight (`text-2xl sm:text-3xl font-extrabold`)
- **Section Title**: 16px–20px, Semi-bold (`text-base sm:text-lg font-semibold`)
- **Body Text**: 14px–16px, Regular (`text-sm sm:text-base`)
- **Secondary Text**: 12px–13px, Medium (`text-xs sm:text-sm text-slate-500`)
- **Tabular Numbers**: `font-mono tabular-nums` for points and ranks

---

## 4. Spacing & Touch Boundaries

- **Touch Targets**: Minimum 44px height for interactive elements on mobile (`h-11 px-4`).
- **Container Margins**: `max-w-4xl mx-auto px-4 sm:px-6 py-6`.
- **Bottom Navigation Clearance**: `pb-24` padding on main content on mobile screens (`sm:pb-8`).
- **Card Spacing**: `space-y-3` for vertical lists, `gap-3` or `gap-4` for grids.

---

## 5. Components Overview

- `AppShell`: Top header bar + main view container + sticky mobile bottom navigation.
- `MobileBottomNav`: Sticky bottom bar with 5 primary touch destinations (`Home`, `Standings`, `Events`, `Results`, `Admin`).
- `StandingsCard`: Mobile stacked team rank card featuring prominent score badge.
- `EventCard`: Compact card with category badge, status indicator, and podium summary.
- `ResultCard`: Clean scannable result card displaying event, rank badge, winner name, class, and team.
- `FilterChips`: Horizontal filter chip bar for events & results filtering.
- `FormInputs`: 1-field-per-row inputs with large 44px+ touch targets and clear validation errors.
