# Screen Audit — Home, Paths, Lesson, Quiz, Profile

_2026-08-12 · Audited against [`../devspace-doctrine.md`](../devspace-doctrine.md) v1.0._

Every finding cites `file:line`. Every contrast ratio was computed, not estimated. Section
references like **§3** point at the doctrine.

**Verdict summary**

| Screen | Dominant element correct? | Cards visible (limit 3) | Four-discipline test | Worst violation |
|---|---|---|---|---|
| Home | **No** — a counter outweighs the mission | **7** | **Fails** | Streak number is the largest object on the page |
| Paths | Partly | 5+ | **Fails** | Retired royal blue as the primary interactive color |
| Lesson | **Yes** | 1–2 | Passes structurally | Code pane leaks into shared chrome |
| Quiz | Split — lesson yes, Practice no | 1 (lesson) / N (Practice) | **Fails** | Fake IDE furniture in the shared component |
| Profile | **No** — identity is a placeholder string | 6 | Passes | `<h1>` is hardcoded `Learner` |

---

## 1. Home

`src/main.jsx:451-591` (rendered inline; there is no Home component or router).

### 1.1 Dominant purpose

**Should be:** *Continue where you stopped.* One object, unmistakably the largest thing on
the page.

**Currently:** the mission card is large (`min-h-[530px]`, `main.jsx:533`) and its title
uses `clamp(28px,4vw,42px)` — genuinely dominant in area. But it competes with, and on one
measure loses to, the sidebar.

The decisive number: the page `<h1>` "Your next mission" is **30px** (`main.jsx:530`) while
the streak counter is **38px** (`main.jsx:455`). **The single largest text node on Home is a
streak count.** A utility (§3) is out-typing the page heading. That is the mechanical reason
Home reads as a dashboard rather than an invitation to continue.

### 1.2 Element inventory

| Element | `file:line` | Question it plants | Verdict |
|---|---|---|---|
| Streak card — 38px count, bolt, 7-day dot row | `main.jsx:452-491` | "Am I about to lose something?" | **Demote** to one line in the supporting layer |
| 7-day bolt strip | `main.jsx:468-490` | "Which days did I miss?" | **Delete** from Home — belongs in the streak drawer (§8) |
| Premium upsell card | `main.jsx:493-504` | "Am I being sold to before I've learned anything?" | **Delete** from Home. Doctrine §13 defers Premium — it has no product model |
| League card | `main.jsx:506-525` | "How do I compare to strangers?" | **Demote** to a line; Leaderboard is not a primary task (§13) |
| League medal well (card **inside** the league card) | `main.jsx:516-521` | — | **Delete** — nested card chrome, §12 #5 |
| Mission card | `main.jsx:533-560` | "What do I do next?" | **Keep** — this is the dominant object |
| Level badge | `main.jsx:535` | "What level am I?" | Merge into the mission line |
| Region dots + "Region N of M" | `main.jsx:548-555` | "How far am I?" | **Keep**, merged into one line |
| Primary CTA | `main.jsx:556-558` | "Can I start now?" | **Keep** |
| `ShortSessionRow` | `main.jsx:563-568` | "Anything quick I could do?" | **Keep** as supporting |
| Devy FAB + hint bubble | `main.jsx:575-590` | "Is something demanding my attention?" | **Demote** — §9 forbids Devy occupying a corner by default |
| Toast | `main.jsx:610` | — | Keep (transient) |

**Card surfaces simultaneously visible: 7** (streak, premium, league, the nested medal well,
mission, Devy panel, toast) against a limit of **3** (§7.3). Several are nested (§12 #5).

### 1.3 Doctrine violations

| § | Violation | Evidence |
|---|---|---|
| §3 | Utility out-weighs dominant element | 38px streak (`:455`) vs 30px `<h1>` (`:530`) |
| §7.3 | 7 card surfaces, limit 3 | listed above |
| §12 #5 | Card inside a card | `main.jsx:516-521` inside `:506` |
| §11 | `#7d7d80` on `#1f1f1f` = **4.02:1** at 11–13px, fails 4.5:1 | `:458`, `:474` (+17 further sites) |
| §5 | Border `#404040` on `#1f1f1f` = **1.59:1**; dark mode has no shadow layer | `:452`, `:506`, `:533` |
| §6 | Retired violet `#6f66ec` as the active-nav indicator | `:346` |
| §4.1 | Body text at 13px, below the 16px floor | `:462`, `:498`, `:510`, `:522` |
| §4.5 | `tracking-[.04em]` micro-label at `text-xs` | `:537` |
| §7 | Off-grid structural spacing `p-[22px]`, `gap-[18px]` | `:451`, `:452`, `:493`, `:506` |
| §13 | Premium surfaced on Home while explicitly deferred | `:493-504` |

### 1.4 Non-developer test

**Fails — but for structural, not content, reasons.** Nothing on Home is intrinsically
developer-specific: mission, region, streak and league are discipline-neutral. The failure
is that Home's *information model* is built around a gamified progression
(XP → league → streak) that suits a code-drilling product. A Motion Design learner returning
to a 12-hour project milestone is served poorly by a daily-streak-and-league frame, which
implicitly assumes short repeatable exercises.

`currentPath.emblem` (`:543`) is a per-path PNG, so the illustration slot generalises —
provided §9.4 is honoured and emblems exist for all four disciplines. Today only five
emblems exist, all for technical paths.

### 1.5 Highest-leverage change

**Make the mission the only large object, and collapse the sidebar into one line of
supporting text.** Replace the three sidebar cards with
`12 day streak · 68% through region · #14 this week` as a single line beneath the mission
title. This alone takes 7 card surfaces to 2, removes the nested well, removes the deferred
Premium surface, and makes the dominant element actually dominant — without designing
anything new.

---

## 2. Paths

`src/components/paths/index.jsx`, `LearningPathDetail.jsx`, `ExplorePathCard.jsx`,
`CurrentPathCard.jsx`, `GuidebookView.jsx`.

### 2.1 Dominant purpose

**Should be:** *Where am I going next.* The current path continues; browsing is secondary.

**Currently:** roughly correct in structure — `CurrentPathCard` sits above "Explore paths"
(`index.jsx:37-39`). But the 3-up explore grid (`:60`) occupies far more area than the
current path, so browsing visually outranks continuing. The header is well-formed: 30px
`<h1>` with a 17px subtitle (`:33-34`) — one of the few places in the app with a real
type ratio.

### 2.2 Element inventory

| Element | `file:line` | Question | Verdict |
|---|---|---|---|
| `Paths` h1 + subtitle | `index.jsx:32-35` | "Where am I?" | **Keep** — good hierarchy |
| `CurrentPathCard` | `index.jsx:37` | "What am I already doing?" | **Keep** — promote in weight |
| "Explore paths" + count | `index.jsx:40-43` | "What else exists?" | Keep |
| All / Career / Skill filter | `index.jsx:45-50` | "Which kind do I want?" | Keep, restyle |
| Search input | `index.jsx:51-58` | "Can I find a specific thing?" | Keep |
| 3-up explore grid | `index.jsx:60-62` | "Which of these 30 do I pick?" | **Demote** — shrink or paginate; it currently outweighs the current path |

Cards visible: `CurrentPathCard` + up to 3 visible `ExplorePathCard`s + the filter/search
row ≈ **5+**, over the limit of 3 (§7.3).

### 2.3 Doctrine violations

| § | Violation | Evidence |
|---|---|---|
| §6 | `#4169e1` — the generic royal blue explicitly rejected — is the primary interactive color for filters and focus rings | `index.jsx:48`, `:57` |
| §11 | `#7d7d80` on canvas at 13px = **4.02:1** | `index.jsx:42` |
| §5 | Search input border `#4a4a4a` on `#252525`; interactive boundaries need 3:1 | `index.jsx:57` |
| §4.1 | 13px used for controls and metadata | `index.jsx:42`, `:48`, `:57` |
| §7.5 | `rounded-md` on controls alongside `rounded-2xl` cards elsewhere — no consistent radius set | `index.jsx:48`, `:57` |
| §7 | Off-grid `gap-[7px]`, `gap-[30px]` | `index.jsx:31`, `:32` |
| §5.4 | Hardcoded hex throughout | 21 literals in `ExplorePathCard.jsx` alone |

### 2.4 Non-developer test

**Fails, and this is the most consequential failure in the audit.**

The catalogue *does* contain `Digital Marketing`, `Data Analyst` and
`Technical Project Coordinator` (`src/data/paths.js`) — 31 career paths and 4 skill paths.
But:

1. **Only `Machine Learning Engineer` is authored.** Everything else routes to `PathPreview`
   (`index.jsx:18-25`) because it isn't in `pathShelves`. So every non-technical path is a
   promise, and the one fully-built path is the most technical one available.
2. **The region/lesson metaphor is untested outside code.** `LessonPedestalIcon`
   (`ui/icons.jsx`) and the pedestal/roadmap layout in `LearningPathDetail.jsx` have only
   ever rendered against Python content. Whether "regions" reads sensibly for
   `Customer & Campaign Foundations` is genuinely unknown — the structure is plausible but
   unproven, which under §2 means **not finished**.
3. The `Digital Marketing` path currently contains a single stub region
   ("Customer & Campaign Foundations / How digital marketing works").

This is not a visual problem. It is the audience rule failing at the content layer, and no
amount of restyling fixes it.

### 2.5 Highest-leverage change

**Author one complete non-technical path end-to-end** — `Digital Marketing` or
`Product Management` — through region, lesson and quiz. Until that exists, §2 cannot be
verified for any shared component, and every "does this work for non-developers?" question
stays theoretical. This is a content commitment, not a design task, and it gates the rest
of the doctrine.

---

## 3. Lesson

`src/components/lesson/LessonView.jsx`, `LessonArticle.jsx`, `LessonProgressStrip.jsx`.

### 3.1 Dominant purpose

**Should be:** *The content.* **Currently: correct.** This is the best screen in the product
against the doctrine and should be the reference the others copy.

What it gets right, explicitly:

- A `grid-rows-[56px_1fr_92px]` shell (`LessonView.jsx`) — chrome is bounded, content takes
  all remaining space. §10.5 satisfied.
- Progress is a thin segment strip, visible but subtle. §10.4 satisfied.
- Devy is a slide-in rail invoked on demand, not a permanent corner occupant. §9.1
  satisfied — unlike Home.
- Prose renders at `clamp(19px,2.2vw,24px)` (`LessonQuestion.jsx:93`). This is the **only
  place in the app** where reading text exceeds the 16px floor comfortably, and it is why
  the lesson feels calmer than everything else.
- Full-screen overlay removes the global header entirely (`main.jsx:328`). Navigation
  genuinely recedes.

### 3.2 Element inventory

| Element | Question | Verdict |
|---|---|---|
| Exit `X` | "How do I leave?" | Keep |
| `LessonProgressStrip` | "How much is left?" | Keep |
| Cheatsheet button | "Can I look something up?" | Keep |
| Content area | "What am I learning?" | Keep — dominant |
| Devy avatar button | "Can I get help?" | Keep |
| Streak status line in footer | "Am I safe?" | **Demote** — reintroduces the counter into a screen whose job is content (§3, §8) |
| Primary action | "How do I go on?" | Keep |

Card surfaces: 1–2. **Within limit.**

### 3.3 Doctrine violations

| § | Violation | Evidence |
|---|---|---|
| §12 #1 | `#1e1e1e` VS Code-style pane used for content blocks | `LessonArticle.jsx:78` |
| §5 | Same 13-blacks problem: `#181818`, `#1e1e1e`, `#121214` all appear as content surfaces | `LessonArticle.jsx` |
| §8 | Streak status in the lesson footer — the counter following the learner into the lesson | `LessonView.jsx` footer |
| §5.4 | 22 hex literals in `LessonArticle.jsx`, 22 in `LessonQuestion.jsx` | — |
| §3 | 3-second artificial `LessonLoading` delay before content | `main.jsx:276` |

### 3.4 Non-developer test

**Passes structurally, fails at the interior.** The shell — header, progress, content,
footer, Devy — is entirely discipline-neutral and is exactly the frame §10.3 calls for. The
failure is what goes inside it (see §4 below), not the frame.

The `LessonLoading` 3-second delay is worth flagging separately: it is a fabricated wait.
Under §3 and Apple's *Agency* principle ("get them directly to the task at hand"), it should
go.

### 3.5 Highest-leverage change

**Extract the lesson shell as the canonical frame** and document it as the reference
implementation. Then make the interior a swappable slot (§10.3). This is the structural move
that lets Product Management and Motion Design content exist without redesigning anything.

---

## 4. Quiz

`src/components/lesson/LessonQuestion.jsx`, `LessonQuiz.jsx`, `lessonFlow.js`,
`questionState.js`, `pythonHighlight.js`.

### 4.1 Dominant purpose

**Should be:** *One question, one interaction, one Continue* (§10).

**The lesson flow already does this.** `lessonFlow.js:1-19` (`expandActivity`) flattens each
quiz activity into one flow step per question, and `LessonView.jsx:210-221` renders exactly
one `<LessonQuestion>` per step, with each progress segment mapping to one question.

**Practice does not.** `LessonQuiz.jsx:39-49` maps every question into a vertical stack
behind a single "Check answers" button that requires all questions answered
(`LessonQuiz.jsx:18`). The file's own comment (`:6-7`) acknowledges the divergence.

So this is **a divergence to reconcile, not a pattern to invent.** The correct fix is to
make Practice consume the lesson flow's pacing — the proven implementation already exists.

### 4.2 Element inventory — `LessonQuestion.jsx`

| Element | `file:line` | Question it plants | Verdict |
|---|---|---|---|
| Prose question at `clamp(19px,2.2vw,24px)` | `:93` | "What's being asked?" | **Keep** — correctly dominant |
| Blanks / fill interaction | `:98` | "What goes here?" | Keep |
| **VS Code pane wrapper** `bg-[#1e1e1e]` | `:68` | "Am I in the right product?" | **Delete from shared chrome** |
| **`PY` language badge** in VS Code blue `#569cd6` | `:70` | "Is this only for programmers?" | **Delete** |
| **Mono filename tab** `script.py` | `:71` | "Why am I looking at a file?" | **Delete** |
| Syntax-highlighted `<pre>` at `leading-[1.9]` | `:73` | "What is this code doing?" | **Keep** — but only inside a code-type interaction |

### 4.3 Doctrine violations

| § | Violation | Evidence |
|---|---|---|
| §12 #1 | Fake IDE chrome — pane, title bar, language badge, filename tab | `LessonQuestion.jsx:68-72` |
| §12 #4 | Monospace outside code — the *filename* is chrome, not code | `:71` |
| §10.1 | Practice renders all questions at once | `LessonQuiz.jsx:39-49` |
| §5 | **The code pane never themes.** Its light-mode border is `#3a3a3a` and its fill stays `#1e1e1e` in both appearances | `:68` |
| §11 | 9px badge text — below the 11px floor | `:70` |
| §4.1 | `LessonQuiz` intro at 17px is fine, but the check hint is 13px | `LessonQuiz.jsx:61` |
| §5.4 | 22 hex literals | — |

### 4.4 Non-developer test

**Fails, and this is the sharpest single failure in the product.**

`LessonQuestion.jsx` is the **shared** question component — every discipline's questions
route through it. `CodeFill` (`:66-89`) is one of its branches, so the component that must
serve Product Management, Digital Marketing and Motion Design ships a Python-specific code
editor complete with a VS Code title bar and a `script.py` filename.

The rendering path is content-gated (a question only enters `CodeFill` if it has
`segments`), so a marketing question would not *render* the pane today. But the doctrine
issue under §2 stands: the shared component's visual vocabulary is a code editor, the only
authored interaction types are code-shaped, and `pythonHighlight.js` sits alongside as a
first-class sibling. There is currently **no** non-code interaction type — no
prioritisation exercise, no metric judgement, no timing critique.

`ProseFill` (`:91`) is the discipline-neutral branch and is the model to build from.

### 4.5 Highest-leverage change

**Strip the IDE furniture from the shared component and make interaction type an explicit,
named slot.** Concretely: the code pane, title bar, `PY` badge and filename become part of a
`CodeInteraction` type registered alongside `ProseInteraction` and (new) at least one
non-code type. The frame — question, interaction, Continue — stays identical. This is the
change that makes §2 real rather than aspirational.

---

## 5. Profile

`src/components/profile/index.jsx` (509 lines).

### 5.1 Dominant purpose

**Should be:** *Who this person is and what they can do* — shareable as
`devspace.../wesley`.

**The conceptual work is already done and this is worth stating plainly:** Profile is
already a CV, not a stats dashboard. It renders About, Experience (dated résumé rows with
bullets), Achievements, Skills, Education and Interests. The `SectionCard`/`ExperienceEntry`
/`DateCell` primitives are well-made, and the in-file comment at `:318-320` shows the right
instinct — "the résumé sections below stay bar-free so evidence still reads as evidence."

**But the dominant element is a placeholder.** `:305-307`:

```jsx
<h1 className="... text-[30px] ...">
  Learner
</h1>
```

The name is **hardcoded**, despite `src/lib/profile.js:17` already normalising a real `name`
field onto the profile object. The single most important element on a personal profile — the
thing that makes it *yours* (§1, "Personal") — is a literal string that is the same for
every user. No styling change matters until this is fixed.

### 5.2 Element inventory

| Element | `file:line` | Question | Verdict |
|---|---|---|---|
| Diagonal gradient banner | `:279-286` | "Is this decoration or information?" | **Delete** — §12 #8 |
| Avatar with `LV n` amber pill | `:288-301` | "What level am I?" | **Demote** — the game layer on a public identity |
| `<h1>Learner</h1>` | `:305-307` | "Whose profile is this?" | **Fix** — must render the real name |
| "Aspiring {role}" | `:308-311` | "What do they do?" | **Keep** — promote; this is the second-most important line |
| Path + joined date | `:312-315` | "How long have they been here?" | Keep, demote to metadata |
| XP meter with gradient fill | `:321-336` | "How much have they played?" | **Delete from public view** — §12 #9 |
| "Edit profile" button | `:338-344` | "Can I change this?" | **Dead code** — see below |
| About / Experience / Achievements / Skills / Education / Interests | `:348+` | "What can they actually do?" | **Keep** — this is the product |
| Sidebar: Learning record | — | "What are their numbers?" | **Move** to a private view |
| Sidebar: Streak badges (3-col grid) | — | "How many badges?" | **Delete** — §12 #9 |
| Sidebar: Standing / league | — | "How do they rank?" | **Move** to private |
| Sidebar: Profile quests | — | "What's incomplete?" | **Move** to private — quests are an editing concern |
| Sidebar: Next checkpoint | — | "What's next?" | **Move** to private |

Card surfaces: header + up to 5 `SectionCard`s + 4 sidebar widgets ≈ **6+ visible**, limit 3.

### 5.3 The dead Edit button

`:338` renders the button only `{onEditProfile && ...}`. But `main.jsx:427-435` passes
`onSaveProfile`, `onStartLearning` and `isLoading` — **`onEditProfile` is never passed**.
Consequences:

- The Edit button never renders. Profile is permanently read-only.
- `saveProfileFields` in `main.jsx` is unreachable.
- `isLoading` is ignored, so the loading skeleton `main.jsx:135-144` sets up a 650ms timer
  for never appears.

This is a prop-contract mismatch, not a design issue, but it makes "Profile quests" — which
prompts the user to complete their profile — actively misleading, since there is no way to
complete it.

### 5.4 Doctrine violations

| § | Violation | Evidence |
|---|---|---|
| §1, §3 | Dominant element is a hardcoded placeholder | `:306` |
| §12 #8 | `repeating-linear-gradient` decorative banner | `:283` |
| §12 #8 | `bg-gradient-to-r` on the XP meter | `:332` |
| §12 #9 | Public XP, level pill, streak badge grid | `:296`, `:321-336`, sidebar |
| §5.3 | Invents `#1b1b1d`/`#333336` as its card while every other screen uses `#1f1f1f`/`#404040` | `:39` |
| §6 | Retired `#6f66ec` and `#8b7cf6` throughout | `:280`, `:290`, `:332` |
| §7.3 | 6+ card surfaces | — |
| §4.5 | 12px uppercase `tracking-[.07em]` label | `:323` |
| §11 | 11px bold on amber pill; 12px metadata | `:296`, `:326` |
| §4.1 | 13px body text | `:312`, `:340` |

### 5.5 Non-developer test

**Passes — the best result in the audit.** The résumé structure (About, Experience, Skills,
Education, Achievements) is the same structure a marketer, PM or motion designer would use.
`ROLE_LABELS` (`:211`) already maps roles generically. Skills render as neutral chips, and
Experience derives from region goals, which are content-driven rather than code-shaped.

One gap: there is no **Selected work** section. For motion designers, marketers and PMs — and
frankly for developers — proof-of-work is the most credible section a profile can have, and
it maps directly to the deferred **Build** activity type (§13). The doctrine's target
hierarchy (name → role → intro → Skills → Selected work → Learning → Achievements) currently
has no home for its highest-value item.

### 5.6 Highest-leverage change

**Render the real name, then move the entire sidebar to a private view.** Those two changes
convert a learning dashboard into a shareable professional identity without touching the
résumé sections that already work. Fix the `onEditProfile` prop contract at the same time —
a profile you cannot edit cannot be personal.

---

## 6. Prioritised remediation backlog

Ordered by leverage. **This is the input to the next pass; nothing here was executed in this
audit.**

| # | Change | Doctrine | Target files | Why this rank |
|---|---|---|---|---|
| 1 | **Token foundation** — `@theme` block: surface ladder, brand ramp, type scale, 4pt spacing, radii | §4, §5, §6, §7 | `src/tailwind.css` | Nothing else is enforceable while 1,223 hex literals exist. Every other item gets cheaper after this |
| 2 | **Render the real profile name**; fix the `onEditProfile` prop contract | §1, §3 | `profile/index.jsx:306`, `main.jsx:427` | One-line fix; the product currently cannot be personal at all |
| 3 | **Strip IDE furniture from the shared question component**; make interaction type a named slot | §2, §12 #1 | `LessonQuestion.jsx:66-89` | The sharpest audience violation, in the most-shared component |
| 4 | **Collapse Home's sidebar into one supporting line**; delete the nested well and the deferred Premium card | §3, §7 | `main.jsx:451-527` | Takes 7 card surfaces to 2 and fixes the dominant-element inversion |
| 5 | **Author one complete non-technical path** end-to-end | §2 | `src/data/paths.js` | Gates verification of §2 for every shared component. Content work, so start it early |
| 6 | **Move Profile's sidebar to a private view**; add a Selected work section | §3, §12 #9 | `profile/index.jsx` | Converts Profile into something shareable |
| 7 | **Make Practice adopt the lesson flow's one-question pacing** | §10 | `LessonQuiz.jsx`, `lessonFlow.js` | The proven implementation already exists; this is reuse, not new design |
| 8 | **`Card`/`Section` primitive** absorbing the repeated card string; enforce the 3-radius set | §5.3, §7.5 | new `ui/Card.jsx`; 62 call sites | Kills per-screen surface drift (Profile's `#1b1b1d`) structurally |
| 9 | **Fix the 19 sub-4.5:1 text sites**; add a dark-mode shadow layer; raise interactive borders to 3:1 | §5, §11 | app-wide | Mechanical once item 1 lands |
| 10 | **Retire `#4169e1`** and the five other blues in favour of the brand ramp | §6 | `paths/index.jsx:48,57` + app-wide | Mechanical once item 1 lands |
| 11 | **Type-scale migration** — 207 arbitrary sizes to 7 tokens; raise body to 16px | §4 | app-wide | Highest visible impact on "too dense", but large; do after item 1 |
| 12 | **Consolidate the five Devy components**; delete the 4 orphaned assets | §9.6, §9.7 | `lesson/Devy*.jsx`, `public/assets/` | Cleanup |
| 13 | **Remove the 3-second artificial lesson delay** | §3 | `main.jsx:276` | Small, and it is a fabricated wait |
| 14 | **Commission subject illustrations for all four disciplines** | §9.4 | `public/assets/` | Blocked on item 5; only five technical emblems exist today |

### Sequencing note

Items 1, 2, 3 and 4 are independent of each other and can run in parallel. Items 9, 10 and
11 are mostly mechanical **after** item 1 and should not be attempted before it. Item 5 is
content work with a long lead time — start it at the same time as item 1, because items 3
and 14 cannot be validated without it.
