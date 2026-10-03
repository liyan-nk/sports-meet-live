# SPORTS MEET LIVE 2026 — DESIGN SYSTEM SPECIFICATION (PHASE 10 REVISED)

## 1. CORE DESIGN PRINCIPLES

> **"SPORTS MEET LIVE IS A DIGITAL SCOREBOARD AND EVENT-DAY COMPANION FOR A COLLEGE SPORTS MEET — NOT AN ADMIN DASHBOARD WITH SPORTS CONTENT INSIDE IT."**

1. **Light-First Editorial Identity**: A daylight-readable, high-contrast light presentation built on warm crisp backdrops, deep navy typography, and purposeful sports accent colors.
2. **Scoreboard & Rank Dominance**: Competitors, scores, and standings hierarchy take visual precedence over containers, borders, and UI chrome.
3. **Composition & Whitespace over Card-Boxing**: Divide sections using intentional vertical rhythm (32px–56px whitespace), subtle hairline dividers, and alignment rather than wrapping every item in bordered cards or pills.
4. **Purposeful Space Allocation over Dogmatic Wrapping Rules**: Solve text cramming through composition layout, progressive disclosure, and hierarchy rather than forcing `whitespace-nowrap` on every label.
5. **Full-Screen Task Architecture for Complex Operations**: Use full-bleed/full-screen mobile task views for multi-step admin data entry (e.g. Add Result) so virtual keyboards never collide with submit actions.

---

## 2. SEMANTIC COLOR SYSTEM (LIGHT-FIRST)

Color is strictly reserved for **semantic meaning, competition states, and live indicators**.

| Color Token | Hex / Slate Equivalent | Semantic Purpose |
| :--- | :--- | :--- |
| `color-bg-app` | `#f8fafc` (slate-50 / warm light background) | Primary daylight app backdrop |
| `color-bg-surface` | `#ffffff` (white / crisp surface) | Surface elevation for standings table & active panels |
| `color-bg-subtle` | `#f1f5f9` (slate-100) | Subtle row hover / secondary surface fill |
| `color-text-main` | `#0f172a` (slate-900 / deep charcoal navy) | Primary headings, team names, large scores |
| `color-text-secondary` | `#475569` (slate-600) | Subtitles, event categories, time anchors |
| `color-text-muted` | `#94a3b8` (slate-400) | Subtle meta, inactive tabs, timestamps |
| `color-accent-sports` | `#1e40af` (blue-800 / classic deep sports blue) | Primary buttons, brand mark, active navigation line |
| `color-gold-podium` | `#d97706` (amber-600 / rich gold) | 1st place rank, overall meet leader highlight |
| `color-status-live` | `#16a34a` (emerald-600) | `● LIVE NOW` pulse badge & active event indicator |
| `color-status-upcoming`| `#0284c7` (sky-600) | `UP NEXT` schedule events |
| `color-status-completed`| `#64748b` (slate-500) | `FINAL` / `COMPLETED` results |
| `color-danger` | `#dc2626` (red-600) | Destructive actions, delete confirmation |

---

## 3. TYPOGRAPHY SYSTEM

Typography creates hierarchy without requiring artificial boxes. Numeric values use tabular monospace (`font-mono tabular-nums`).

| Scale | Size (Mobile / Desktop) | Weight | Line Height | Case / Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Score Display** | `36px` / `52px` | `800` | `1.0` | `font-mono`, tabular | Standings leader points, hero score |
| **Hero Title** | `26px` / `36px` | `800` | `1.1` | Uppercase, `tracking-wide` | Event detail titles, meet status banner |
| **Headline** | `20px` / `24px` | `700` | `1.2` | Sentence case | Section titles (Standings, Schedule, Results) |
| **Body** | `15px` / `16px` | `400` | `1.5` | Sentence case | Standard description, athlete names, inputs |
| **Meta / Tag** | `12px` / `13px` | `600` | `1.4` | Uppercase, `tracking-wider` | Category tags (`TRACK`, `FIELD`), time badges |
| **Rank Number** | `24px` / `32px` | `900` | `1.0` | `font-mono`, tabular | Leaderboard rank (`01`, `02`, `03`, `04`) |

---

## 4. SPACING RHYTHM & INTERACTION HIERARCHY

- **Mobile Page Margins**: `20px` (320px–390px phones), `24px` (412px+ phones), `32px` (Desktop).
- **Section Rhythm**: `40px` to `56px` vertical gaps between major stories (Meet Status -> Leaderboard -> Schedule -> Results).
- **List Row Gap**: `12px` to `16px` vertical separation.
- **Touch Target**: Minimum `48px` height for all primary buttons, tab triggers, and form inputs.
- **Interaction Hierarchy**:
  1. **Primary Action**: Solid deep blue (`bg-blue-800 text-white font-semibold h-12 px-6 rounded-lg`).
  2. **Secondary Action**: Light surface container (`bg-slate-100 hover:bg-slate-200 text-slate-800 h-12 px-4 rounded-lg`).
  3. **Tertiary Action**: Text link / quiet icon (`text-slate-600 hover:text-slate-900 text-sm font-medium`).
  4. **Danger Action**: Solid red (`bg-red-600 text-white h-12 px-4 rounded-lg font-semibold`).

---

## 5. DESIGN ANTI-PATTERNS (FORBIDDEN IN PRODUCTION)

1. **Card-Everything UI**: Wrapping every section and item inside bordered boxes with heavy rounded corners.
2. **SaaS Dark Dashboard Aesthetic**: Defaulting to dark navy/grey grid cards that look like administrative tools.
3. **Pill & Badge Overload**: Decorating every label with colorful rounded pill backgrounds.
4. **Fixed Keyboard-Obscuring Footers**: Using fixed bottom bars inside modals that get hidden by software keyboards.
5. **Cramped Horizontal Rows**: Squeezing icons, titles, points, edit buttons, and delete buttons onto one row.
6. **Shrinking Text to Force Fit**: Reducing font size to 10px or less just to prevent wrapping.
7. **Random Decorative Colors**: Using purple, orange, or yellow gradients for non-semantic visual noise.
8. **Excessive Bold & All-Caps**: Making every single label bold uppercase, destroying typography hierarchy.

---

## 6. DESIGN REFERENCE PRINCIPLES

- **Scoreboard Hierarchy**: Rank -> Team Name -> Points -> Gap (clear visual order).
- **Broadcast-Style Composition**: Visual rhythm moving from live event context down to standings and upcoming timetable.
- **Progressive Disclosure**: Detailed participant lists and admin actions accessed via tap-to-open views or full-screen task flows.
- **Daylight Readability**: Contrast ratios meeting WCAG AAA standard on mobile phone screens outdoors.
