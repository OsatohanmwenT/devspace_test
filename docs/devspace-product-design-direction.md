# DevSpace Product & Visual Direction

This document is the build-ready direction for DevSpace. It supersedes earlier brainstorms when decisions conflict.

## Product structure

### Primary navigation

Use a scalable top navigation to preserve the clean product feel while making the core learner tasks easy to find.

- **Home**: the learner's current mission and recent progress.
- **Paths**: the learning hub for both career paths and skill paths.
- **Practice**: short exercises that test knowledge or a focused skill.
- **Build**: guided, real-world projects that are larger than a practice activity.

Keep secondary destinations in grouped menus:

- **Paths / Learn menu**: Assessments and Resources.
- **Profile menu**: profile, settings, theme, and account actions.
- **Header utilities**: streak, XP, notifications, and profile avatar.

Leaderboard is motivational context rather than a primary learner task. Keep it available from a header utility or profile menu until its loop is established.

### Learning hierarchy

`Career path -> concept region -> lesson tiles -> lesson`

For example: `Backend Developer -> Intro to Python -> Python Basics, Variables, Input and Output`.

Paths owns both career paths and skill paths. Resources is supplementary material such as references and guides; it is not a second name for Paths.

### Practice, Assessments, and Build

- **Practice**: a compact, repeatable knowledge check or focused skill exercise.
- **Assessments**: longer competency checks with a meaningful outcome.
- **Build**: a guided, portfolio-worthy project. Devy may translate a learner's goal into an MVP, milestones, and next steps.

## Visual system

### Foundation

- Design light mode first: warm off-white page background, white cards, and occasional soft-tint content panels.
- Use solid surfaces and visible 1px borders for structure.
- Do not use repeated linear gradients on cards, tiles, or decorative surfaces.
- Keep shadows restrained; spacing, border, and surface contrast should carry hierarchy.

### Brand and color

`#19079B` is the DevSpace brand color. It anchors identity and primary actions; do not replace it with generic royal, cobalt, or periwinkle blue.

Use non-brand accents by meaning and content family:

- Teal: data and AI content.
- Amber: streaks, progress, and achievements.
- Periwinkle or lilac: Devy and abstract learning moments.
- Green and red: success and error feedback only.

Neutral surfaces carry the UI; brand blue points to the important action.

### Components and Devy

- Primary CTAs may use a soft bezel: solid DevSpace-blue face, darker blue lower edge, defining border, and restrained pressed state.
- Secondary buttons, cards, nav items, and chips remain flat.
- States must be distinct without relying on color alone, with AA text contrast and visible keyboard focus.
- Use Devy as a contained illustration or assistant moment in guidance cards, lesson support, Build planning, empty states, and helpful feedback—not as decorative wallpaper.

## Build now

- Consolidate active tokens around the light-first, flat system and the real DevSpace blue.
- Remove remaining gradient-backed shared surfaces; use solid fills, borders, and restrained CTA bezel styling.
- Implement top navigation with grouped secondary destinations and a profile entry point.
- Repair path data/content routing so the selected path and region determine lesson tiles.
- Wire existing Settings and Leaderboard views to navigation before expanding Home.

## Build next

- Create Practice as a repeatable exercise experience.
- Create Build as a guided-project flow, with clear Devy-supported MVP and milestones.
- Create Assessments when results produce a meaningful competency outcome.
- Add Resources within the Paths / Learn area.
- Improve Home with real recency, quick-practice, and path-progress entry points after those destinations exist.

## Build later

| Item | Why it waits | Revisit when |
| --- | --- | --- |
| Notifications | No meaningful events exist yet. | Streak-risk, assessment-result, project, or leaderboard events exist. |
| Streaks, XP, and leagues | Current values are placeholders. | A real progression/accrual model is defined. |
| Certificates | There is no outcome worth credentialing yet. | Assessments and Build have completion criteria. |
| Premium | It has no product model or destination. | Plans, entitlement, and pricing are defined. |
| Sidebar | It introduces a second navigation pattern. | Header and menus no longer serve real destinations. |
| Full dark-mode parity | It expands the token and QA surface. | Light mode is complete and validated. |

## Known implementation work

- Unify the disconnected region and lesson structures in `src/data/paths.js`.
- Make `src/components/settings/index.jsx` reachable.
- Leave the unused `AppSidebar.jsx` dormant while the top-nav direction is active.
- Do not imply working streak, XP, or league systems before a real data model exists.
- Consolidate overlapping Devy helper surfaces when the assistant flow is scoped.

## Token brainstorming note

`C:\Users\OSATO OSARENKHOE\Downloads\devspace-design-tokens-v2.css` is reference material for color exploration only. It is not the production token source of truth and should not be merged wholesale. Active application tokens must follow this document.
