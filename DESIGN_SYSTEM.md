# SPORTS MEET LIVE 2026 — PRODUCT EXPERIENCE DESIGN SYSTEM (PHASE 9)

A mobile-first live sports app presentation layer built for competition excitement, scannability, un-cramped layouts, and zero control text wrapping.

---

## 1. Core Principles

- **Live Sports Application Experience**: Feels like an official live tournament scoreboard app on a phone screen. Not a SaaS dashboard, CRM, or generic admin template.
- **Mobile-First Width Protection**: At 360px–430px viewports, controls, headers, and action buttons NEVER wrap awkwardly (e.g. `LIVE SCOREBOARD` or `SIGN OUT` wrapping into 2 lines).
- **De-Cardified Whitespace Rhythm**: Avoid enclosing every section in outlined boxes or rounded cards. Use typography, spacing (`40px–56px` section gaps), alignment, and subtle horizontal dividers (`divide-y divide-slate-200`) for structural hierarchy.
- **Competition & Scoreboard Identity**: Prominent tabular numbers (`32px–40px font-mono tabular-nums`), rank badges (`01`, `02`, `03`), points gap indicators (`-6`, `-19`, `-25`), and live status indicators (`LIVE NOW`, `UP NEXT`, `COMPLETED / FINAL`).
- **Unified Vertical Page Scroll**: Single primary vertical document scroll. NO nested scrollable containers or fixed-height viewports.

---

## 2. Typography & Hierarchy

- **Hero & Page Titles**: `28px – 36px` (`text-2xl sm:text-4xl font-black text-slate-900 tracking-tight`)
- **Section Headers**: `20px – 24px` (`text-xl sm:text-2xl font-black text-slate-900 tracking-tight`)
- **Scoreboard Numbers**: `32px – 44px` (`text-3xl sm:text-4xl font-black font-mono tabular-nums text-slate-900`)
- **Event & Team Titles**: `18px – 22px` (`text-lg sm:text-xl font-extrabold text-slate-900`)
- **Body & Participant Names**: `16px – 18px` (`text-base sm:text-lg font-semibold text-slate-900`)
- **Metadata & Subtext**: `14px – 15px` (`text-sm font-medium text-slate-500`)
- **Zero Text Wrapping**: Headings and action labels are allocated sufficient horizontal width and whitespace to render on a single line on 360px phones.

---

## 3. Button & Action Hierarchy

- **Primary CTA**: `h-12 sm:h-14 bg-blue-600 text-white font-extrabold text-base px-6 rounded-xl hover:bg-blue-700 shadow-xs whitespace-nowrap`
- **Secondary Action**: `h-12 bg-white border border-slate-300 text-slate-800 font-bold text-sm sm:text-base px-5 rounded-xl hover:bg-slate-100 whitespace-nowrap`
- **Tertiary Action**: `h-10 text-slate-600 hover:text-slate-900 font-bold text-sm px-3 rounded-lg whitespace-nowrap`
- **Danger Action**: `h-12 bg-red-50 border border-red-200 text-red-800 font-bold text-sm sm:text-base px-5 rounded-xl hover:bg-red-100 whitespace-nowrap`

---

## 4. Status & Competition Language

- **`● LIVE NOW`**: Emerald pulse indicator (`bg-emerald-500 animate-pulse text-emerald-900 bg-emerald-100 border-emerald-300`)
- **`UP NEXT`**: Warm amber timeline tag (`bg-amber-100 text-amber-900 border-amber-300`)
- **`COMPLETED / FINAL`**: Slate finished tag (`bg-slate-100 text-slate-700 border-slate-300`)
- **`Points Gap`**: High-contrast difference relative to leader (`-6 PTS`, `-19 PTS`, `-25 PTS`)

---

## 5. Navigation & Shell

- **App Header**: Compact mobile header (`[SPORTS MEET 2026]` + `● LIVE`), zero text wrapping on 360px.
- **Bottom Navigation**: Fixed mobile bottom bar (`h-16 z-40 bg-white border-t border-slate-200`).
- **Modal Layering**: `ModalSheet` renders at `z-[100]` with `document.body.style.overflow = 'hidden'` and sticky bottom action bar.
