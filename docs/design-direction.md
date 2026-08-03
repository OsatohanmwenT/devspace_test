# Design Direction: Nav, IA, Visual Style, Gamification

_Living reference doc capturing the state of the UI/IA brainstorm as of 2026-07-31. Update sections as decisions get made — don't let this go stale._

## How to read this doc

- **Decided** — settled, build against it.
- **Open** — genuinely undecided, needs a call before the related work starts.
- **For later** — real issues found in the code, deliberately not touched yet.

---

## 1. Navigation

**Current reality**: a single top nav, built inline in `src/main.jsx`, currently containing Home, Paths, and Leaderboard. There is no router; navigation is local `useState`. A hamburger menu holds Settings, Account, and a theme toggle, but Settings and Account are toast-only stubs.

There is also a dead sidebar in `src/components/layout/AppSidebar.jsx`. It is not imported and references icons that do not exist, so it would crash if mounted.

There is no notification bell in the codebase.

**Open**: top nav (redesigned to scale beyond two items) versus a left sidebar. The top nav fits the UI better, while a sidebar would make adding pages and links easier. Decide alongside the final page inventory.

**For later**: notification makes sense only once there is content to notify about, such as a streak at risk, league movement, or a new resource.

---

## 2. Page inventory

| Page | Status | Notes |
| --- | --- | --- |
| Home | Built | Inline in `main.jsx` |
| Paths | Built | `src/components/paths/index.jsx` |
| Path detail / roadmap | Built, content-disconnected | See §3 |
| Lesson view | Built | |
| Settings | Built, orphaned | Never rendered |
| Leaderboard | Built | Still needs a real progression loop |
| Practice | Not built | Smaller knowledge/skill checks |
| Assessments | Not built | |
| Profile | Not built | Settings account area is the closest existing analogue |
| Resources | Not built | May house learning support materials |
| Build | Not built | Larger guided real-world project work, potentially assisted by Devy |

**Open**: Resources may overlap with Paths if it also houses career and skill paths. Resolve the name and scope before building either direction further.

---

## 3. Career path structure

**Target hierarchy**: career path → concept grouping / region (for example, Intro to Python) → lesson tiles (Variables, Input and Output, and so on).

**Current reality**: `src/data/paths.js` has two disconnected structures:

- `currentPath.cards`: six ML-specific regions.
- `detailLevels`: nine generic Learning to Code levels with unrelated lessons.

`LearningPathDetail.jsx` renders `detailLevels`, not `currentPath.cards`, so the live detail view does not reflect the chosen path region. `PathRoadmap.jsx` correctly uses `currentPath.cards` but is unused and references missing icons.

**For later**: reconnect the region and lesson structures, or replace `detailLevels` with lesson data owned by each region.

---

## 4. Gamification

**Current reality**: streak and XP are placeholder state, and the league card is decorative. There is no real ranking, other learners, pixel count, or XP accrual model.

**For later**: build a real system before expanding the UI. Useful reference patterns include a streak-day row, current/best streak detail, weekly XP activity, league rank, and a countdown. The existing league card should not imply a working league before this exists.

---

## 5. Visual style

**Decided**: flat, solid colors over repeated linear gradients. Existing gradients in `--surface-card`, `--surface-tile`, and `.premium-card` are out of date with that direction.

**Current baseline**: `ActionButton` mostly uses flat color with a tactile offset shadow. Its premium variant is the exception, with an explicit gradient. Shine and inner-shadow should be used sparingly, ideally only for high-priority CTAs with a defining border.

**Open**: blue should remain the anchor accent but needs a final palette that feels lighter and softer, with room for other accent hues rather than a monochrome deep-blue system.

**For later**: `C:\Users\OSATO OSARENKHOE\Downloads\devspace-design-tokens-v2.css` is color brainstorming, not a token set to merge. The live app's consumed tokens remain the source to consolidate around.

---

## 6. Illustration style / Devy

**Open**: determine whether Uxcel-inspired flat illustration treatment fits `devy.svg` once a few flat UI screens exist to react to.

**For later**: Devy appears in several overlapping forms: the home nudge, `DevyCorner`, `DevyChatRail`, `LessonView`, and `DevyPanel`. Consolidate these helper surfaces when the assistant experience is scoped.

---

## 7. Open questions

- Top nav versus sidebar.
- Resources versus Paths naming and scope.
- Final color system.
- Devy illustration direction.
- Home-page gaps after the outstanding page structure is decided.

## 8. Flagged code issues

- `AppSidebar.jsx` is dead and has broken icon imports.
- `PathRoadmap.jsx` is dead and has broken icon imports.
- `currentPath.cards` and `detailLevels` are disconnected.
- Settings exists but is not rendered.
- Streak and XP use placeholder state.
- League presentation is decorative rather than data-backed.
- Devy has overlapping implementations.

## 9. Home page audit

- Header streak and XP chips use placeholder values.
- The streak card duplicates the header state and its detail action is not correctly wired.
- Premium remains a dead end until a real offering exists.
- League remains a dead end until the leaderboard/progression loop exists.
- Devy's hint is interactive but hardcoded rather than personalized to the current lesson.
- The mission CTA now opens a lesson, but lesson content is still hardcoded regardless of the selected lesson ID.

## 10. Home page gaps and opportunities

**Could add without depending on other pages**: profile identity in the header, an entry to search learning content, a broader Devy entry point, and activity/recency signals.

**Depend on other pages**: quick practice, achievements/certificates, and navigation to the planned Practice, Assessments, Resources, Build, and Profile destinations.

**Structural flag**: the data model supports one active path only. Multiple concurrent skill and career paths will require a model change, not just a layout change.
