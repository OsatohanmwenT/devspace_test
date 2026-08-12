# The Devspace Doctrine

_Version 1.0 · 2026-08-12 · **This is the single source of truth for Devspace's visual and
experience design.** It supersedes `design-direction.md`, `devspace-product-design-direction.md`,
and `devspace-design-tokens.css`. Where any older document conflicts with this one, this
one wins._

Research basis: `docs/research/ui-reference-study.md`. Every number in §4–§7 and §11 traces
to a measurement or a cited source there.

---

## 0. Why this document exists

Devspace has been designed one screen at a time. Each screen was reasonable alone; together
they produced a product that reads as a developer dashboard. The recurring failure is a
single reflex: when a page looked empty, we asked **"what else can we add?"**

That reflex is now measurable in the codebase:

- ~240 of ~300 sized text nodes render at ≤15px. Only 6 render at ≥30px.
- 26 distinct ad-hoc font sizes, including `text-[14.5px]`. No type scale exists.
- 62 bordered card surfaces. Home shows 7 at once, some nested.
- 13 near-black surface values doing the work of 4 — two of them ΔL 0.0002 apart.
- 1,223 hardcoded hex literals; no tokens, no CSS variables.

This document replaces the reflex with a question and a set of constraints. It is written
to be **falsifiable**: a screen either satisfies these rules or it does not, and in most
cases you can check with a ruler or a contrast calculator rather than an opinion.

---

## 1. The feeling

Someone using Devspace spends the rest of their day in WhatsApp, Instagram, X, Spotify,
maybe Duolingo. When they open Devspace it must not feel like entering an enterprise LMS,
and it must not feel like a children's coding game.

The target: **"This is my space for becoming better at what I want to do."**

Three qualities, in priority order:

**Focused** → the screen knows what it wants me to do.
**Personal** → this is mine; it reflects me, not a template.
**Alive** → returning tomorrow doesn't feel like opening school software.

### Negative definition (equally binding)

Devspace must never feel like:

- an admin dashboard or analytics console
- a GitHub profile, an IDE, or a terminal
- a children's game
- an enterprise learning management system
- a habit-tracking app whose real subject is the counter rather than the learning

**Professionalism is the floor.** Playfulness is permitted above that floor, never in place
of it. Completing a Product Management path must feel credible enough to tell an employer
about.

---

## 2. The audience rule

**Nothing fundamental may assume the learner writes code.**

Devspace is for people finding and growing into a career: product managers, designers,
marketers, data analysts, video editors, motion designers, developers. Developers are one
audience, not the audience. Early technical content is a fact about our current catalogue,
not a licence for a technical product identity.

### The four-discipline test

Every pattern, component and screen must be validated against four paths, not one:

`Backend Development` · `Product Management` · `Digital Marketing` · `Motion Design`

If a component only makes sense for one of them, **it is not finished** — it is a
discipline-specific interaction wearing the costume of a general one. Either generalise the
surrounding experience and swap the interior, or move it behind a content-type branch.

This test is mandatory in every design review and every screen audit. "N/A" is not a valid
answer.

### Consequences that already follow

- A code editor pane is a *lesson interaction type*, never shared chrome. Today
  `LessonQuestion.jsx:71` renders a `script.py` filename tab in the **shared** question
  component, so a Product Management learner would see fake IDE furniture.
- Path progress visuals must read as sensibly for a marketing campaign module as for a
  Python module.
- Language stays discipline-neutral in shared surfaces: "lesson", "project", "checkpoint" —
  not "build", "compile", "ship".

---

## 3. The attention budget

**Every major screen gets one dominant purpose, one supporting layer, and utilities — in
that order of visual weight.**

The word "dominant" is literal: the dominant element should be the largest, highest-contrast
thing on the screen. If a utility is the biggest object, the screen is wrong regardless of
how good it looks.

| Screen | Dominant | Supporting | Utilities |
|---|---|---|---|
| **Home** | Continue where you stopped | Where am I / how am I doing | streak, league, Devy |
| **Paths** | Where am I going next | Region and milestone structure | search, filters, browse |
| **Lesson** | The content | Progress | exit, cheatsheet, Devy |
| **Quiz** | One question, one interaction | Position in the set | — |
| **Profile** | Who this person is and what they can do | Work and competencies | private stats |

### The replacement question

Not *"what else can we add?"* but:

> **"What does the person need to understand or do here?"**

Everything then competes for a limited attention budget. Home does not need to
simultaneously present learning path, region, progress, streak, XP, leaderboard, Devy,
recommendations, daily goal, recent activity, projects, skills and statistics. Even if every
one is individually useful, presenting them together makes them **collectively** less
useful.

Apple states the same constraint: "don't obscure [the most important information] by
crowding it with nonessential details."

### The supporting layer is usually a line, not a row of cards

`12 day streak · 68% through region · #14 this week` is one line of text. It does not need
three cards. See §7.

---

## 4. Typography

### The scale

A 1.25 major third from a 16px base. **These are the only sizes.**

| Token | Size | Line height | Use |
|---|---|---|---|
| `display` | 39px | 1.05 | One per screen, maximum. The dominant object's title |
| `title` | 31px | 1.15 | Page heading |
| `heading` | 25px | 1.25 | Section heading |
| `subheading` | 20px | 1.35 | Sub-section, card title |
| `body` | **16px** | 1.55 | **Default. All prose, all lesson content** |
| `label` | 13px | 1.45 | UI labels, secondary metadata |
| `micro` | 11px | 1.4 | Absolute floor. Non-essential metadata only |

Line heights are part of the token. There are seven values, not the current twelve
arbitrary ones.

### Hard rules

1. **Body text is 16px.** Apple's iOS default for custom type is 17pt; 16px is the web
   equivalent and it is the floor for anything a person reads to learn. Today the most
   common size in Devspace is 13px.
2. **11px is a floor, not a size to design toward.** Permitted only for non-essential
   metadata — never for content, never for anything that carries meaning on its own.
   Apple's stated iOS minimum is 11pt.
3. **No arbitrary sizes.** If a value isn't in the table, it doesn't ship. `text-[14.5px]`
   is the tell that we were eyeballing.
4. **Each screen has at most one `display` element**, and it belongs to the dominant object
   from §3.
5. **Uppercase tracked micro-labels: maximum two per screen.** Beyond that the interface
   reads as telemetry. Currently 32 uppercase uses, 16 of them at 10–11px.
6. **Weight is hierarchy's last resort, after size and space.** Prefer a 400–600 band.
   `font-bold` is reserved for genuine emphasis, not for making 13px legible — the fix for
   small-and-weak is bigger, not heavier. Apple: thin weights need *larger* sizes, and
   Linear's whole system sits in a low weight band.

### Families

- **Display face** — `Rethink Sans`. Headings only.
- **Text face** — `DM Sans`. Everything else.
- **Mono** — `JetBrains Mono`. **Code only.** Never for labels, numbers, timers, IDs, or
  atmosphere. Monospace outside code is a developer-identity signal (§12).
- **Drop `Public Sans`.** It is loaded from Google Fonts and applied nowhere. Removing it
  removes a render-blocking request.

---

## 5. Surfaces and elevation

### The correct metric

Adjacent dark surfaces are **not** measured with WCAG contrast ratio. We calibrated against
Linear, whose ladder steps compute to 1.05–1.17:1 and whose borders sit at 1.22:1 — a
system nobody accuses of looking flat. Elevation is specified in **luminance delta (ΔL)**.

The 3:1 rule (WCAG 1.4.11) applies to boundaries that **identify a component or its state**
— inputs, controls, selected states, focus rings. It does not apply to decorative
separators. Applying it everywhere produces glaring boxes; applying it nowhere produces
what we have.

### Dark appearance ladder

Four steps. Not thirteen.

| Token | Hex | ΔL from previous |
|---|---|---|
| `surface-canvas` | `#0E0E12` | — |
| `surface-default` | `#17171C` | 0.00428 |
| `surface-raised` | `#212128` | 0.00685 |
| `surface-overlay` | `#2B2B34` | 0.00925 |

Steps are uniform and each exceeds Linear's two smallest. Modals, popovers and menus use
`surface-overlay`; cards use `surface-default`; the page uses `surface-canvas`.

### Light appearance ladder

Designed independently, **not inverted**. Apple: dark colors "aren't necessarily inversions
of their light counterparts."

| Token | Hex | Note |
|---|---|---|
| `surface-canvas` | `#FAFAF8` | Warm off-white. The warmth lives here |
| `surface-default` | `#FFFFFF` | Cards are lighter than canvas — the inverse of dark |
| `surface-raised` | `#FFFFFF` | Distinguished by shadow, not by fill |
| `surface-overlay` | `#FFFFFF` | Distinguished by shadow |

Light mode is a mostly-clean neutral canvas where warm tones appear **deliberately**, not
every surface rendered cream.

### Borders by role

| Token | Dark | vs surface | Light | vs surface | Must meet 3:1? |
|---|---|---|---|---|---|
| `border-hairline` | `#2E2E38` | 1.33:1 | `#EDEDE8` | 1.17:1 | No — decorative |
| `border-default` | `#3A3A46` | 1.59:1 | `#DCDCD5` | 1.38:1 | No — decorative |
| `border-interactive` | `#6E6E7C` | **3.56:1** | `#8A8A82` | **3.48:1** | **Yes** |
| `border-focus` | `#8274F1` | **4.86:1** | `#19079B` | **13.59:1** | **Yes** |

### Elevation rules

1. **Surface step first, border second, shadow third.** A raised element changes its
   background before it grows a border.
2. **Dark mode gets a shadow layer.** Today 17 of ~30 shadow uses are gated to light mode
   only, so dark mode has *no* depth cue except a 1.59:1 hairline. Dark shadows are
   deeper and softer, never the light values reused.
3. **One role, one color, everywhere.** A card is `surface-default` on every screen. Today
   Profile invents `#1b1b1d`/`#333336` while every other screen uses `#1f1f1f`/`#404040`.
4. **All colors are tokens.** No hex literal in a component. This is what makes the rest of
   this section enforceable rather than aspirational.

---

## 6. Brand and color

### `#19079B` is the Devspace brand color

It anchors identity and primary action. It is **not** to be replaced by generic royal,
cobalt or periwinkle blue.

But a single hex cannot serve every role: `#19079B` on the dark canvas computes to
**1.38:1** — invisible. So brand identity is carried by a **hue-locked ramp** (H=247°,
matching the anchor's own hue).

| Token | Hex | Role | Measured |
|---|---|---|---|
| `brand-base` | `#19079B` | Identity. Light-mode CTA fill, light-mode focus ring | white on it **13.59:1**; on `#FAFAF8` **13.01:1** |
| `brand-cta-dark` | `#4B37D9` | Dark-mode CTA fill | white on it **7.37:1** |
| `brand-on-dark` | `#8274F1` | Dark-mode brand text, links, active nav, focus ring | on `#17171C` **4.86:1**; on `#0E0E12` **5.24:1** |
| `brand-tint` | `#DDD9FD` | Tinted backgrounds, selected states in dark | on `#0E0E12` 14.14:1 |

Every value passes its intended use at AA. `brand-on-dark` is deliberately the lightest
value that still reads as the brand hue rather than lavender.

### Retired

`#6f66ec`, `#513deb`, `#888df2`, `#4169e1`, `#2f6fed`, `#8b7cf6` — six blues and violets
doing overlapping jobs. Also retired: `#37F712` neon green and `#7E4BDE` from the old token
file (§13). None of these are Devspace's brand.

### Accents carry meaning, never decoration

Each has a per-appearance value so both pass 4.5:1 as text:

| Meaning | Dark | Light | Measured (dark / light) |
|---|---|---|---|
| Data and AI | `#3FC8D6` | `#0F6F7B` | 8.88 / 5.87 |
| Streaks, progress, achievement | `#F0B429` | `#8A5A00` | 9.58 / 5.93 |
| Devy and abstract learning | `#B6ADF5` | `#5B45C9` | 8.75 / 6.69 |
| Success | `#5BC98A` | `#1F7A4C` | 8.65 / 5.32 |
| Error | `#F08A90` | `#B3242C` | 7.44 / 6.55 |

**Neutral surfaces carry the UI. Brand points at the one important action. Accents mean
something.** A color applied because a section looked plain is a bug.

### Gradients

No repeating or multi-stop gradients on cards, tiles, or decorative surfaces. A primary CTA
may use a restrained bezel — solid brand face, darker lower edge, defining border, subtle
pressed state. That is the only permitted depth ornament.

---

## 7. Spacing and containment

### One scale

4pt: `4, 8, 12, 16, 24, 32, 48, 64`. Nothing else ships.

Retired: the structural `18px`/`22px` constants, the 57 half-step gaps (`gap-1.5`,
`gap-2.5`), and the six off-grid arbitrary gaps (`3, 5, 7, 18, 22, 30px`).

Touch targets are **44×44** minimum (Apple's iOS default), with ~12px padding around
bezeled controls.

### Containment rules — these are the ones that fix "too much"

1. **No card exists to group two lines of text.** Use space and type. Apple lists negative
   space *before* background shapes as a grouping device.
2. **No card inside a card.** Currently violated on Home (bordered card → bordered well →
   bordered chip) and in `LessonQuestion.jsx`.
3. **Maximum 3 card surfaces visible in one viewport.** Home currently shows 7.
4. **A card must earn its border.** If removing the border loses nothing, it wasn't
   structure — it was habit.
5. **Radii: `8px` (controls), `12px` (cards), `full` (pills).** Three values. Retired:
   `rounded-[7px]`, `[10px]`, `[14px]`, `[18px]`, `[20px]`, `[24px]`, `[54px]`.

### Whitespace is structural

Whitespace is not leftover space and not a failure to fill. It is the primary tool for
hierarchy, ranking above borders and backgrounds. A screen that feels empty is usually a
screen whose **dominant element isn't dominant enough** — the answer is to make that
element larger, not to add neighbours.

---

## 8. Progressive disclosure

Depth beats breadth. When there is more to show than the attention budget allows, reveal it
on demand rather than laying it out.

- Progress is visible without turning a page into analytics. One honest indicator beats
  four precise ones.
- Detail belongs one interaction away — a drawer, an expansion, a dedicated view.
- Never show a number the learner can't act on.
- Anything showing a value that isn't yet real must not imply a working system.
  `docs/observation.md` records that the streak currently advances for a zero-XP practice
  replay; until a learning-evidence model exists, these surfaces stay modest.

---

## 9. Devy, illustration, and iconography

**Three separate systems. Do not make one asset do all three jobs.**

| System | Job | Where |
|---|---|---|
| **Devy** | Personality | Empty states, completion, onboarding, milestones, errors, celebrations, occasional Home moments |
| **Subject illustration** | Meaning | One crafted mark per discipline — marketing, PM, motion design, data, backend |
| **UI icons** | Structure | Navigation, controls, status |

### Rules

1. **Devy never fills an empty corner.** Apple: "Don't mistake delight for decoration."
   Devy appears at emotional moments or when assisting — not because a layout has a gap.
2. **Devy is contained**, never wallpaper or a background texture.
3. **Fewer, excellent, custom.** Generic AI-generated "cute coding illustration" assets
   cheapen the product. A small set of crafted assets beats a large stock set.
4. **Subject illustrations must cover all four disciplines** before the system is
   considered to exist. A set that only depicts code is a developer product's asset library.
5. **Illustrations are adapted per appearance, not reused blindly.** Apple demonstrates
   the same illustration losing detail on a dark background and requires modifying the
   asset or shipping separate light/dark variants. Content images with white backgrounds
   get softened in dark mode to stop them glowing.
6. **Consolidate the Devy surfaces.** Five components currently exist
   (`DevyAssistant`, `DevyChatRail`, `DevyCorner`, `DevyPanel`, plus the Home FAB). One
   assistant, one presentation per context.
7. **Orphaned assets get deleted or replaced, not left lying around.**
   `hero-illustration.svg`, `leagues-locked.svg`, `path-node.svg`, `ai-ml-career-map.png`
   have zero references in `src`.

---

## 10. Learning interaction pacing

### One thing at a time

```
Question 3 of 8
  ├─ one question
  ├─ one interaction
  └─ Continue
        ↓ transition
```

Not `Question 3 of 8` above four simultaneously visible question cards. The learner should
feel **movement**, not feel they are filling in a form.

### Rules

1. **One question, one interaction, one primary action per view.**
2. **Transitions convey progress.** Movement between questions is the feedback that
   something advanced.
3. **The interaction swaps per discipline; the surrounding experience does not.** A code
   editor, a prioritisation exercise, a campaign-metric judgement and a timing critique are
   all *interior* components inside one identical frame. This is what makes §2 achievable.
4. **Navigation recedes during learning.** Chrome is quiet, progress stays visible but
   subtle, content owns the screen. Lesson is currently the best screen in the product on
   this axis — it is the reference the others copy.
5. **Learning interactions get more space than navigation chrome.** Always.

Devspace's lesson flow already implements this: `lessonFlow.js` (`expandActivity`) expands
each quiz into one flow step per question. **Practice does not** — `LessonQuiz.jsx` renders
every question at once behind a single "Check answers". Practice must adopt the pattern the
lesson flow already proves.

---

## 11. Accessibility floor

Non-negotiable, and part of design — not a QA step afterwards.

| Requirement | Value |
|---|---|
| Body text contrast | **4.5:1** minimum |
| Custom colors at small sizes | **7:1** target (Apple's guidance for custom colors) |
| Large text (≥18px or bold) | 3:1 |
| Interactive boundaries, focus rings, state indicators | **3:1** |
| Touch targets | 44×44 |
| Text size floor | 11px, non-essential metadata only |

Plus:

- **State is never conveyed by color alone.** Pair with shape, icon, or text. Apple:
  "Offer visual indicators, like distinct shapes or icons, in addition to color."
- **Focus is always visible**, using `border-focus` from §5.
- **Both appearances are checked.** A pairing that passes in light can fail in dark.
- **Motion respects `prefers-reduced-motion`.**

Known current failures this floor outlaws: `#7d7d80` on `#1f1f1f` is **4.02:1** across 19
sites, mostly at 11–13px. `text-white/70` on the onboarding selected state is ~3.0:1 at
13px.

---

## 12. Anti-patterns

Banned, each traced to where it currently lives.

| # | Anti-pattern | Why | Currently at |
|---|---|---|---|
| 1 | **Fake IDE chrome** — filename tabs, VS Code panes as shared furniture | Hard-codes a developer identity into a general product | `LessonQuestion.jsx:71` (`script.py`), `#1e1e1e` panes in `DevyAssistant`, `CheatsheetDrawer`, `GuidebookView` |
| 2 | **Contribution heatmaps** | A GitHub artifact. Recolouring it amber doesn't change what it evokes | `StreakJourneyModal.jsx:113` (30-cell grid) |
| 3 | **10–11px uppercase tracked micro-labels in bulk** | Reads as telemetry/dashboard | 16 sites |
| 4 | **Monospace outside code** | Developer-identity signal | `LessonQuestion.jsx:71` |
| 5 | **Nested card chrome** | Visual noise; nothing gained | Home sidebar, `LessonQuestion.jsx` |
| 6 | **A card wrapping two lines of text** | Space and type would do it better | Widespread |
| 7 | **Dashboard-ification of Home and Profile** | Both should have one dominant object, not a widget grid | Home (7 surfaces), Profile (4-widget sidebar) |
| 8 | **Gradient decoration** | Cheapens surfaces; already banned in prior direction and still present | `profile/index.jsx:283` repeating-linear-gradient, `ActionButton` premium 3-stop |
| 9 | **Public XP / coins / badge grids on the shared profile** | Answers "how much has this person played?" not "what can they do?" | `profile/index.jsx` sidebar |
| 10 | **Hardcoded hex literals** | Makes every other rule unenforceable | 1,223 sites |
| 11 | **Adding a widget because a corner looks empty** | The original reflex this document exists to kill | — |

---

## 13. Product structure (carried forward)

Retained from `devspace-product-design-direction.md`, which this document supersedes.

### Navigation

Scalable top navigation: **Home · Paths · Practice · Build**.

Secondary destinations live in grouped menus — Paths/Learn menu holds Assessments and
Resources; the profile menu holds profile, settings, theme and account actions; header
utilities hold streak, XP, notifications and avatar.

Leaderboard is motivational context, not a primary learner task. It stays in a header
utility or the profile menu until its loop is established.

### Learning hierarchy

`Career path → concept region → lesson tiles → lesson`

Paths owns both career paths and skill paths. Resources is supplementary material, not a
second name for Paths.

**The region/lesson representation must satisfy §2** — it has to work as well for
`Digital Marketing` as for `Backend Development`.

### Activity types

- **Practice** — compact, repeatable knowledge check or focused skill exercise.
- **Assessments** — longer competency checks with a meaningful outcome.
- **Build** — a guided, portfolio-worthy project. Devy may translate a learner's goal into
  an MVP, milestones and next steps.

### Deferred

| Item | Why it waits | Revisit when |
|---|---|---|
| Notifications | No meaningful events exist | Streak-risk, assessment-result, project or leaderboard events exist |
| Streaks, XP, leagues | Current values are placeholders | A real progression model is defined (see `observation.md`) |
| Certificates | Nothing worth credentialing yet | Assessments and Build have completion criteria |
| Premium | No product model or destination | Plans, entitlement and pricing are defined |
| Sidebar navigation | Introduces a second nav pattern | Header and menus no longer serve |

### Superseded token sources

`devspace-design-tokens.css` described itself as "Monospace-driven, space-tech inspired
developer-first" with `#37F712` neon-green CTAs. That direction is **rejected in full** —
it is the developer-identity problem written down as a spec. It was never imported by any
source file. `§5` and `§6` of this document replace it entirely.

---

## 14. How to use this document

Before any screen ships, check it against:

- **§3** — Is there exactly one dominant purpose, and is the dominant element actually the
  biggest and highest-contrast thing on screen?
- **§2** — Does it survive the four-discipline test? Write the answer down; "N/A" is not
  valid.
- **§7** — How many card surfaces are visible at once? (Limit: 3.) Does any card exist
  only to group two lines?
- **§12** — Does it contain any listed anti-pattern?
- **§11** — Recompute the contrast pairings. Both appearances.

Before adding anything to a screen, answer §3's question out loud: **what does the person
need to understand or do here?** If the new element isn't part of that answer, it belongs
somewhere else or nowhere.

### Amending this document

This doctrine is meant to be stable. Amend it when evidence contradicts it — a usability
finding, a measured accessibility failure, a discipline it fails to serve — not when we see
an attractive interface. Record the reason for the change in the same edit.

---

_Working observations that are not yet doctrine live in `docs/observation.md` — notably the
open question of what makes a streak represent real learning growth rather than attendance.
That thinking should inform §8 as it matures._
