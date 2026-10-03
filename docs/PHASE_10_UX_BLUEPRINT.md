# SPORTS MEET LIVE 2026 — PHASE 10 UX ARCHITECTURE & PRODUCT BLUEPRINT (REVISED)

> **DOCUMENT STATUS**: REVISED PRODUCT BLUEPRINT & DESIGN SPECIFICATION  
> **DATE**: October 3, 2026  
> **AUTHOR**: Antigravity AI & Product Engineering  

---

## 1. PRODUCT THESIS & DIRECTIVE

**SPORTS MEET LIVE 2026 IS A DIGITAL SCOREBOARD AND EVENT-DAY COMPANION FOR A COLLEGE SPORTS MEET — NOT AN ADMIN DASHBOARD WITH SPORTS CONTENT INSIDE IT.**

### The Core Mandate
- **Daylight Light-First Aesthetics**: Built for students and competitors holding phones outdoors at a sports field. High contrast, warm light slate background, deep navy typography, crisp visual score numbers, and gold/emerald semantic indicators.
- **Broadcast Information Flow**: The Home experience reads like a live sports broadcast—answering *What is happening now?*, *Who is leading?*, *What was the latest result?*, and *What is coming next?*.
- **Score & Rank Dominance**: Rank (`01`), Team Name, and Points (`53 PTS`) visually dominate every standings table without artificial card boxes.
- **Full-Screen Task Architecture**: Complex multi-step admin workflows (e.g. Add Result, Create Event) utilize full-screen mobile task views rather than constrained bottom sheets, completely eliminating virtual keyboard collisions.

---

## 2. DESIGN REFERENCE PRINCIPLES

Extracted from real-world sports live-score applications, broadcast graphics, and Apple Human Interface Guidelines:

1. **Scoreboard Typography Hierarchy**: Dominant tabular score numerals (`36px–52px`), strong team titles, and clean whitespace dividers rather than grid cards.
2. **Broadcast-Style Event Rhythm**: Sequence information logically (Meet Status -> Featured Live Event -> Standings -> Recent Results -> Schedule).
3. **Progressive Disclosure**: Keep high-level views clean; reveal participant lists, detailed event breakdowns, and admin tools upon deliberate interaction.
4. **Touch & Keyboard Ergonomics**: Minimum 48px touch targets, full-screen mobile overlays for data entry, and keyboard-aware viewport handling.

---

## 3. DESIGN ANTI-PATTERNS (MANDATORY FORBIDDEN LIST)

The production UI is **STRICTLY FORBIDDEN** from introducing:

❌ **Card-Everything UI**: Wrapping every list item and metadata block in bordered containers with rounded corners.  
❌ **SaaS Dark Dashboard Aesthetic**: Dark grid templates that resemble administrative database viewers.  
❌ **Pill & Badge Overload**: Decorating every label with colored pill backgrounds.  
❌ **Keyboard-Obscuring Fixed Footers**: Fixed bottom action bars inside modals that get covered by mobile virtual keyboards.  
❌ **Cramped Horizontal Rows**: Squeezing icons, titles, points, edit buttons, and delete buttons onto a single row.  
❌ **Shrinking Text to Force Fit**: Reducing font size to 10px or less just to prevent wrapping.  
❌ **Dogmatic "Zero Wrap" Tricks**: Blindly applying `whitespace-nowrap` everywhere instead of allocating proper vertical space.  
❌ **Arbitrary Decorative Gradients**: Adding purple, yellow, or blue gradients for non-semantic visual noise.  

---

## 4. INFORMATION ARCHITECTURE & ROUTING

```
                       ┌─────────────────────────┐
                       │   SPORTS MEET LIVE      │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
  ┌──────┴──────┐            ┌──────┴──────┐            ┌──────┴──────┐
  │ PUBLIC HOME │            │  STANDINGS  │            │   SCHEDULE  │
  └──────┬──────┘            └─────────────┘            └──────┬──────┘
         │                                                     │
         ├─ Meet Status Hero                                   ├─ Today Timetable
         ├─ Top 4 Leaderboard                                  ├─ Category Filters
         ├─ Latest Results Feed                                └─ Event Detail View
         └─ Next Up Timetable
                                                               ┌──────┴──────┐
  ┌─────────────┐                                              │   RESULTS   │
  │ ADMIN PORTAL│                                              └──────┬──────┘
  └──────┬──────┘                                                     │
         │                                                            ├─ Result Feed
         ├─ Dominant Action: [ RECORD RESULT ]                        ├─ Podium Breakdown
         ├─ Secondary Action: [ CREATE EVENT ]                        └─ Category Filter
         ├─ Management Utilities (Points, Rules, Posters)
         └─ Account Operations (Sync, Sign Out)
```

---

## 5. APP SHELL & NAVIGATION ARCHITECTURE

### A. Mobile Header Shell (320px – 430px)
- Compact `52px` header with `SPORTS MEET 2026` title and an inline `● LIVE` status indicator.
- Daylight-optimized white surface (`#ffffff`) with a clean bottom hairline border (`#e2e8f0`).

### B. Mobile Navigation
- Stable, quiet bottom bar (`56px` height) with 5 clean destinations (`Home`, `Standings`, `Events`, `Results`, `Admin`).
- Renders at `z-40`, providing clear active-tab state without dominating screen real estate.

---

## 6. REVISED ASCII WIREFRAMES

### A. PUBLIC HOME (BROADCAST FLOW)
```
┌─────────────────────────────────────────────────────────────┐
│ SPORTS MEET 2026                               ● LIVE NOW   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LIVE NOW                                                   │
│                                                             │
│  100M MEN                                                   │
│  TRACK • FINAL                                              │
│                                                             │
│  [ VIEW LIVE RESULT → ]                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  STANDINGS                                                  │
│                                                             │
│  01  VERTEX                                         53 PTS  │
│  ─────────────────────────────────────────────────────────  │
│  02  ASTRA                                          47 PTS  │
│                                                     −6 PTS  │
│  ─────────────────────────────────────────────────────────  │
│  03  ZENITH                                         34 PTS  │
│                                                    −19 PTS  │
│  ─────────────────────────────────────────────────────────  │
│  04  NOVA                                           28 PTS  │
│                                                    −25 PTS  │
│                                                             │
│  View Full Standings →                                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LATEST RESULT                                              │
│                                                             │
│  100M MEN • TRACK                                           │
│  🥇 1st  Liyan Koya           S3 CSE • VERTEX     +10 PTS   │
│  🥈 2nd  Nihal Ahmad          S5 ECE • ZENITH      +5 PTS   │
│  🥉 3rd  Shinas Mohammed      S1 ME  • ASTRA       +3 PTS   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  UP NEXT                                                    │
│                                                             │
│  14:00 PM  │ 200M WOMEN                                     │
│            │ Track Field 1 • Scheduled                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 🏠 Home   📊 Standings   📅 Events   🥇 Results   🔒 Admin  │
└─────────────────────────────────────────────────────────────┘
```

### B. STANDINGS LEADERBOARD
```
┌─────────────────────────────────────────────────────────────┐
│ STANDINGS                                      12 EVENTS    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  01                                                         │
│  VERTEX                                             53 PTS  │
│  6 events completed                                         │
│  🥇 4 Gold   🥈 2 Silver   🥉 1 Bronze                      │
│                                                             │
│  ═════════════════════════════════════════════════════════  │
│                                                             │
│  02                                                         │
│  ASTRA                                              47 PTS  │
│  −6 PTS vs Leader                                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  03                                                         │
│  ZENITH                                             34 PTS  │
│  −19 PTS vs Leader                                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  04                                                         │
│  NOVA                                               28 PTS  │
│  −25 PTS vs Leader                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### C. EVENTS SCHEDULE TIMETABLE
```
┌─────────────────────────────────────────────────────────────┐
│ SCHEDULE                                   [ALL] TRACK FIELD│
├─────────────────────────────────────────────────────────────┤
│  LIVE NOW                                                   │
│                                                             │
│  14:00 PM                                                   │
│  200M WOMEN                                                 │
│  TRACK • MAIN TRACK                                         │
│  ● In Progress                                              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  UP NEXT                                                    │
│                                                             │
│  16:15 PM                                                   │
│  4X100M RELAY MEN                                           │
│  TRACK • UPCOMING                                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  COMPLETED TODAY                                            │
│                                                             │
│  09:00 AM                                                   │
│  100M MEN                                           FINAL ✓ │
│  🥇 Liyan (Vertex)  🥈 Nihal (Zenith)  🥉 Shinas (Astra)    │
│                                                             │
│  11:30 AM                                                   │
│  LONG JUMP MEN                                      FINAL ✓ │
│  🥇 Rahul (Astra)   🥈 Akhil (Nova)    🥉 Favaz (Vertex)    │
└─────────────────────────────────────────────────────────────┘
```

### D. EVENT DETAIL VIEW (`/events/:id`)
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Schedule                             TRACK • FINAL│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  100M MEN                                                   │
│  Final Race • Completed 09:15 AM                            │
│                                                             │
│  OFFICIAL PODIUM                                            │
│                                                             │
│  🥇 1ST PLACE                                      +10 PTS  │
│  LIYAN KOYA                                                 │
│  S3 CSE • VERTEX                                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🥈 2ND PLACE                                       +5 PTS  │
│  NIHAL AHMAD                                                │
│  S5 ECE • ZENITH                                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🥉 3RD PLACE                                       +3 PTS  │
│  SHINAS MOHAMMED                                            │
│  S1 ME • ASTRA                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### E. RESULTS FEED VIEW
```
┌─────────────────────────────────────────────────────────────┐
│ RESULTS FEED                               [ALL] TRACK FIELD│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  100M MEN                                          09:15 AM │
│  TRACK • FINAL                                              │
│                                                             │
│  01  Liyan Koya (Vertex)                           +10 PTS  │
│  02  Nihal Ahmad (Zenith)                           +5 PTS  │
│  03  Shinas Mohammed (Astra)                        +3 PTS  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  LONG JUMP MEN                                     11:45 AM │
│  FIELD • FINAL                                              │
│                                                             │
│  01  Rahul V (Astra)                               +10 PTS  │
│  02  Akhil P (Nova)                                 +5 PTS  │
│  03  Favaz K (Vertex)                               +3 PTS  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### F. ADMIN OPERATIONS DASHBOARD
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN OPERATIONS                               [AUTHORIZED] │
│ Signed in as: admin@example.com                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIMARY OPERATION                                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │   + RECORD RESULT                                     │  │
│  │   Enter event positions & publish live points         │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  SECONDARY ACTION                                           │
│  [ + Create New Event ]                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  MEET MANAGEMENT UTILITIES                                  │
│  • Starting Points Adjustments                              │
│  • Scoring Rules & Point Allocations                        │
│  • Victory Poster Generator                                 │
│  • Authorized Admin List                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ACCOUNT & DATA                                             │
│  [ Sync Realtime Data ]                   [ Sign Out ]      │
└─────────────────────────────────────────────────────────────┘
```

### G. ADD RESULT (FULL-SCREEN MOBILE TASK VIEW)
```
┌─────────────────────────────────────────────────────────────┐
│ ✕ CANCEL                     RECORD RESULT       STEP 1 OF 3│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SELECT EVENT                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 100M Men (Track • Final)                            ▼ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  1ST PLACE WINNER (+10 PTS)                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Athlete Name / Reg No                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  Team / House: [ VERTEX                                ▼ ]  │
│                                                             │
│  2ND PLACE WINNER (+5 PTS)                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Athlete Name / Reg No                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  Team / House: [ ZENITH                                ▼ ]  │
│                                                             │
│  3RD PLACE WINNER (+3 PTS)                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Athlete Name / Reg No                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  Team / House: [ ASTRA                                 ▼ ]  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [ PUBLISH RESULT & CALCULATE POINTS ]                      │
└─────────────────────────────────────────────────────────────┘
```

### H. CREATE EVENT (FULL-SCREEN MOBILE TASK VIEW)
```
┌─────────────────────────────────────────────────────────────┐
│ ✕ CANCEL                     CREATE EVENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EVENT TITLE                                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ e.g. 200m Women                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  CATEGORY                                                   │
│  (•) Track     ( ) Field     ( ) Team Sport                 │
│                                                             │
│  SCHEDULED TIME                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 14:00 PM                                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [ SAVE TO EVENT SCHEDULE ]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. TASK VIEW VS BOTTOM SHEET COMPARISON

| Criteria | Bottom Sheet Modal | Full-Screen Mobile Task View (Recommended) |
| :--- | :--- | :--- |
| **Viewport Space on 360px Phone** | Limited (50%–70% of screen) | 100% of visual viewport |
| **Virtual Keyboard Handling** | High collision risk; inputs get covered | Excellent; natural document scrolling |
| **Multi-field Complexity** | Cramped; requires nested scrolling | Spacious; clear vertical rhythm |
| **Action Button Reachability** | Can be covered by software keyboard | Always anchored cleanly at bottom of task view |
| **User Focus** | Partial background view causes distraction | 100% focused operational task flow |

**Decision**: Add Result and Create Event will use **Full-Screen Mobile Task Views** on mobile devices (<768px) and centered overlay dialogs on desktop.

---

## 8. TESTABLE VIRTUAL KEYBOARD ACCEPTANCE SCRIPT

At **360 × 800** viewport:

1. Open Admin operations page and tap **`+ RECORD RESULT`**.
2. Full-screen mobile task view mounts smoothly with `z-[100]`.
3. Tap **1st Place Athlete** input field.
4. Software keyboard slides up (~300px height).
5. The active focused input scrolls cleanly into view (`block: 'center'`).
6. Scroll down to **3rd Place Athlete** input field and tap.
7. Software keyboard remains active without screen distortion or shifting.
8. Scroll to bottom of task view; **`[ PUBLISH RESULT ]`** action button remains fully reachable and clickable.
9. Tap **`[ PUBLISH RESULT ]`**.
10. Result saves to Appwrite backend, standings recalculate dynamically.
11. Task view unmounts cleanly, virtual keyboard closes, document scroll unlocks.
12. Zero content remains displaced or shifted upward.
13. Mobile bottom navigation (`z-40`) never overlaps or blocks the form action button.

---

## 9. REVISED DESIGN SYSTEM SPECIFICATION SUMMARY

- **Theme**: Light-first editorial sports identity.
- **Palette**: Slate-50 background (`#f8fafc`), White surface (`#ffffff`), Slate-900 typography (`#0f172a`), Deep Sports Blue (`#1e40af`), Gold Amber (`#d97706`), Emerald Live (`#16a34a`).
- **Typography Scale**: Display `36px/52px font-mono`, Hero `26px/36px`, Headline `20px/24px`, Body `15px/16px`, Meta `12px/13px`.
- **Layout**: 40px–56px vertical section spacing, whitespace-driven hierarchy, zero card-boxing overload.

---

## 10. FINAL DESIGN QUESTION EVALUATION

> **"If I showed this application to a student without explaining it, would they immediately understand that it is a live college sports meet?"**

**YES.**  
The sequence of live events, prominent scoreboard standings (`01 VERTEX 53 PTS`), podium breakdowns (`🥇 1st`), clear timetable schedule, and daylight light-first presentation immediately communicate a **live college sports tournament experience**.
