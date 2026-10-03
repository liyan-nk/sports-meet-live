# SPORTS MEET LIVE 2026 — EDITORIAL SPORTS SCOREBOARD DESIGN SYSTEM (PHASE 7.5)

A bold, clean, typography-first sports scoreboard presentation layer designed for effortless mobile scanning and confident desktop presentation.

---

## 1. Core Principles

- **Editorial Sports Scoreboard**: Calm, spacious, high-contrast, confident. Looks like a real live college sports meet app, not a SaaS dashboard or analytics tool.
- **Typography-First Hierarchy**: Large readable typography. No tiny 10px–12px text anywhere in normal content.
- **Single Page Scroll**: The page scrolls naturally as one unified view. NO nested scrolling containers, NO fixed-height scrolling panels, NO split-viewport scrolling.
- **De-Cardified Presentation**: Avoid card-ifying every row or wrapping lists inside nested rounded borders. Prefer clean editorial rows with subtle horizontal dividers (`divide-y divide-slate-200`), generous vertical padding, and whitespace.
- **Mobile-First Composition**: Designed specifically for 360px–430px wide phone viewports with room to breathe, scaling up to centered 1024px–1440px desktop layouts.

---

## 2. Typography Scale

- **Page Titles**: `32px – 40px` (`text-3xl sm:text-4xl font-black tracking-tight text-slate-900`)
- **Section Headers**: `22px – 28px` (`text-xl sm:text-2xl font-bold tracking-tight text-slate-900`)
- **Standings & Major Numbers**: `32px – 44px` (`text-3xl sm:text-4xl font-black font-mono tabular-nums text-slate-900`)
- **Event & Team Titles**: `18px – 22px` (`text-lg sm:text-xl font-extrabold text-slate-900`)
- **Participant / Body Text**: `16px – 18px` (`text-base sm:text-lg font-medium text-slate-900`)
- **Labels & Secondary Metadata**: `14px – 15px` (`text-sm font-semibold text-slate-500`)
- **Minimum Font Size**: `14px` (`text-sm`). `text-xs` (12px) and `text-[10px]` are strictly forbidden for user content.

---

## 3. Color & Visual Palette

- **App Background**: Soft warm off-white / light slate (`bg-slate-50`, `#f8fafc`).
- **Surface**: Pure White (`#ffffff`) for elevated header/navigation and structured scoreboard blocks.
- **Primary Text**: Near Black / Deep Slate (`text-slate-900`, `#0f172a`).
- **Secondary Text**: Neutral Slate (`text-slate-500`, `#64748b`).
- **Dividers & Borders**: Crisp light slate (`border-slate-200`, `#e2e8f0`).
- **Brand Accent**: Athletic Blue (`bg-blue-600` / `text-blue-600`), used strictly for primary CTAs and active states.
- **Podium Ranks**:
  - 1st Place (Gold): Subtle warm gold rank indicator (`bg-amber-400 text-amber-950 font-black`)
  - 2nd Place (Silver): Cool silver rank indicator (`bg-slate-200 text-slate-800 font-bold`)
  - 3rd Place (Bronze): Bronze rank indicator (`bg-amber-100 text-amber-900 font-bold`)

---

## 4. Spacing & Touch Boundaries

- **Page Padding**: Mobile: `px-4 py-6`, Desktop: `px-8 py-10 max-w-4xl mx-auto`.
- **Bottom Nav Clearance**: `pb-28 sm:pb-12` on the main page content wrapper.
- **Row Spacing**: `py-4 sm:py-5` for event & result rows.
- **Touch Targets**: Minimum 48px height for all interactive buttons and form inputs (`h-12 px-5 text-base`).

---

## 5. Navigation & Shell

- **Mobile Navigation**: Simple fixed bottom navigation bar with 5 primary destinations (`Home`, `Standings`, `Events`, `Results`, `Admin`). Large icons and 14px labels.
- **Desktop Header**: Clean top bar with app title, live status pill, and navigation links.
- **Unified Vertical Page Scroll**: The browser page window handles all vertical scrolling natively.
