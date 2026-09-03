# Interactive Learning System — Screenshot Audit & UX Decisions

Audit of the shipped Python Data Analyst two-tile pilot (Northstar Store),
against 19 real screenshots of a click-through of the running app, followed
by the fixes made and the ones deliberately deferred. This is the reference
future lessons should follow for the same quality bar.

**Scope note:** this is a hardening pass on an already-shipped pilot, not a
redesign. Every fix below preserves the existing Devspace lesson shell
(`LessonView.jsx`'s header/main/Devy-aside/footer layout, `ConceptTransition`
for milestone screens, the article → question → practice flow) — nothing
here introduces a new page layout or borrows another product's visual
language.

## 1. Screenshot → state mapping

Screenshots are `Screenshot 2026-08-{29,30,31} HHMMSS.png` on disk
(`OneDrive - COVENANT UNIVERSITY\Pictures\Screenshots\`); numbered here in
the order supplied.

### 1–2. Video, single segment (Tile 2, Concept 1 — data-quality-checks)

| Field | Value |
|---|---|
| Screen / Tile / Concept | Explain · Tile 2 · "Basic data-quality checks" |
| Component | `LessonArticle.jsx` → `YouTubeSegmentPlayer.jsx` |
| Actions available | Click Play; scroll to read the messy dataset below |
| State captured | #1 poster card (not yet playing); #2 playing, native YouTube chrome, position 6:45 inside the 5:22–7:10 assigned segment |
| Feedback / Devy / Audio | None on this screen — video plays with its own audio, no narration conflict observed (narration wasn't active) |
| Animation | None specific to video mount |
| Keyboard | YouTube iframe owns its own keyboard controls once focused |
| Mobile | Not captured; card is responsive width, untested at this session |
| **Problem** | No on-screen framing (title/duration/"why this clip") once playing — the only context was the poster card's title, which disappears on play |
| **Fix** | Persistent "Watch: *label* · *Xm Ys* clip" line above the player, visible before **and** after play (see UX decision §1) |
| Acceptance | Framing text visible in both poster and playing states, and after any chapter switch |

### 3. Wrong MC answer, retry state (Tile 2, "duplicate row" question)

| Field | Value |
|---|---|
| Screen | Check · Tile 2 · data-quality-checks · question `dq-q1` |
| Component | `LessonQuestion.jsx` (`MultipleChoice`), `LessonView.jsx` (`checkQuestion`) |
| Actions | Pick another option; click Try again; Ask Devy |
| State captured | Full-viewport red vignette; amber "Not quite yet" banner; **no option shown as selected** |
| Feedback | Devy line "Not this one — have another go." (ambient, correct) |
| Devy | Ambient line only, chat panel closed |
| Problem | (a) `lesson-error-glow` washes the whole lesson frame red — reads as alarming, not a normal retry; (b) the previously-wrong pick is silently cleared, so the learner can't see what they chose |
| **Fix** | Removed the full-frame glow for any wrong-answer state (retry or final); the selected-but-wrong option now stays visible with a muted amber "Not this one" tag through the retry (see UX decisions §2, §3) |
| Acceptance | No `.lesson-error-glow` element renders on a wrong answer; the previously-picked option is visibly marked, not blank |

### 4–5. Explore-mode table cell selected (Tile 2 messy table)

| Field | Value |
|---|---|
| Screen | Explain · Tile 2 · data-quality-checks |
| Component | `LessonDataTable.jsx` (`variant="explore"`) |
| Actions | Click a row/column/cell to see what it represents; click again to clear |
| State captured | Cell selected (`customer_segment` × row 3), cross-highlight on row+column both firing correctly |
| **Problem** | Caption read *"For order **r3**, customer_segment = Student"* — `r3` is the internal dedup key for the messy dataset (two rows legitimately share the same `order_id`), not something a learner ever sees elsewhere on screen |
| **Fix** | New `identifyingColumn` prop (defaults to `order_id`) — caption now resolves the row's real `order_id` regardless of what the table's dedup `rowKey` is (see UX decision §4) |
| Acceptance | Caption reads "For order NS1003, …", not "For order r3, …" |
| What's already right | Row/column/cell cross-highlight, default instructional caption when nothing's selected, keep as-is |

### 6–7. Issue-spotter (Tile 2, "Find the quality problems")

| Field | Value |
|---|---|
| Component | `LessonPractice.jsx` (`IssueSpotterPractice`) |
| Actions | Click a cell; chip lifecycle (available → found) |
| State captured | 1/4 then 3/4 found, correct cells highlighted green, chips filling in |
| Problem | No explicit "N of 4 found" text — only the chip row communicates progress |
| **Fix** | Added `"{n} of {total} quality problems found"`, `aria-live="polite"` |
| What's already right | Chip states, non-issue nudge copy ("nothing tells us this is definitely a problem" — deliberately non-punitive), found-cell highlighting |

### 8–9. Multi-segment video chips (Tile 2, analysis-workflow)

| Field | Value |
|---|---|
| Component | `LessonArticle.jsx` chip row + `YouTubeSegmentPlayer.jsx` |
| Actions | Switch chapter chip (Start with the question / Analyze / Share the result) |
| State captured | #8 "Analyze" cued, paused, correct timestamp (7:13, inside 7:11–8:21); #9 "Share the result" selected, shows YouTube's own generic thumbnail/play button, not a framed poster |
| Confirmed working | Chip switch correctly re-cues (no autoplay, correct start point) |
| **Problem** | Switching chapters after the first play loses all "which part / how long / why" framing — falls back to YouTube's bare branding |
| **Fix** | The framing line (§1 above) is now outside the play/pause conditional entirely — it's visible regardless of `isPlaying`, so it survives every chip switch |
| Acceptance | Framing line visible immediately after switching to a new chapter, before the new segment is played |

### 10. Correct MC feedback (Tile 2, "ask the question first")

| Field | Value |
|---|---|
| State captured | "Correct +1 Devy Coin", explanation "Every workflow starts with a clear question, not a chart.", "Want the why?" / Ask Devy |
| Verdict | **Already meets the bar** — states what was correct and why, ties to the underlying principle, offers "the why" without forcing it. No change. |

### 11. Reorder practice, initial state (Tile 2, "Build the analysis workflow")

| Field | Value |
|---|---|
| Component | `LessonPractice.jsx` (`ReorderPractice`) |
| State captured | 6 scrambled stages, tiny ↑/↓ chevrons only |
| **Problem** | Exactly the complaint: no drag affordance, no visual weight for the primary interaction |
| **Fix** | `motion`'s `Reorder.Group`/`Reorder.Item` (already an installed dependency — no new package) — whole-row drag on pointer devices, `whileDrag` lift/shadow, automatic layout animation for settling; ↑/↓ buttons kept as the explicit keyboard fallback, now visually secondary (see UX decision §9) |
| Acceptance | Dragging a row with the mouse reorders the list; the ↑/↓ buttons still work independently (verified: a button click doesn't also start a drag) |

### 12, 14. Devy panel open during reorder / follow-up decision

| Field | Value |
|---|---|
| State captured | 3-level progressive hints all visible ("Give me a hint" → "Another hint" → "One more hint"), scenario answered correctly, reorder complete |
| Confirmed working | Hint ladder — exactly 3 escalating levels, each answered once and never repeated, reusing the existing per-chip-disappears mechanic in `DevyAssistant.jsx`/`lib/devy.js` |
| **Problem** | Older messages blurred to `opacity-25`/`blur-2px` — hard to actually read, not just de-emphasized |
| **Fix** | Dropped the blur, raised opacity to 55% (from ~25–35%) — still visually secondary to the current message, still legible (see UX decision §10) |

### 13. Devy **and** Notes open simultaneously

| Field | Value |
|---|---|
| **Problem** | Devy (docked left) and Notes (drawer right) both open at once, squeezing the actual lesson content into a narrow center strip. Root cause: Devy's panel has no backdrop, so the header "Lesson options → Notes" menu stays clickable while Devy is open; nothing closed one when the other opened. |
| **Fix** | `openDevy()` helper closes Notes/Cheatsheet; the Notes and Cheatsheet menu items close Devy (see UX decision §5) |
| Acceptance | Opening Notes while Devy is open moves the Devy panel off-screen; opening Devy while Notes is open closes Notes |

### 15–16. Field-select (Tile 2, "Prepare a safe analysis file")

| Field | Value |
|---|---|
| Component | `LessonPractice.jsx` (`FieldSelectPractice`) |
| State captured | Plain checkbox list, "Prepare dataset" button, no rationale |
| **Problem** | No per-field "why include / why not" reasoning, no preview of the resulting safe dataset |
| **Fix** | Each column in the content data (`nonCodingLessons.js`) gained an optional `note`, rendered under its checkbox; on successful prepare, a "Safe analysis dataset" preview chip-row shows exactly the selected field names (see UX decision §7) |

### 17. Tile completion

| Field | Value |
|---|---|
| Component | `ConceptTransition.jsx`, `LessonView.jsx` |
| State captured | Devy mascot, "Tile complete", +25 XP / +10 Devy Coins / **"2/6 CORRECT"** unlabelled, recap/review buttons, all appearing together |
| **Problem** | (a) bare `correct` label next to celebratory numbers reads like a failing grade; (b) everything renders in one flash, no sequencing |
| **Fix** | Label changed to "checks correct" with a `title` tooltip explaining exactly what's counted (final answer per Check screen — a resolved retry still counts); GSAP timeline now staggers each stat card in individually, numeric stats (`+25`, `+10`) count up from zero, and the secondary action row (recap/review) settles in last, after the rewards (see UX decision §8) |

### 18. Quick-review modal ("Simulate 3-day review")

| Field | Value |
|---|---|
| Component | `RecallCheckModal.jsx` |
| State captured | Header correctly names the concept ("QUICK REVIEW · BASIC DATA-QUALITY CHECKS"), single focused question, Check button |
| Verdict | **Already meets the bar.** Backdrop darkness is a normal modal scrim, not the "learner loses the relationship to what's behind it" problem the spec warns about. No change. |

### 19. Region-complete ("Quality and the Analysis Workflow, done!")

| Field | Value |
|---|---|
| Component | `RoadmapTransition.jsx` (pre-existing, shared by every path) |
| State captured | Region 3 "Spreadsheet Fundamentals" shown with an honest "Coming soon" label, no clickable CTA into it, "View roadmap" as the only action |
| Confirmed working | `hasPrimary` gate already refuses to present a placeholder region as an actionable destination — exactly what the spec asks for |
| Minor note | Appearing right after "Tile complete" (screenshot 17) with a similar full-bleed layout can read as a repeat. Not fixed this pass — `RoadmapTransition` is shared infrastructure used by every path in the app; a copy-only differentiation pass belongs with that component specifically, not bundled into this pilot's fixes. Flagged for a follow-up, not silently dropped. |

---

## 2. UX_AND_INTERACTION_DECISIONS

One entry per fix actually shipped this pass, plus explicit entries for what's deferred and why.

### §1 — Persistent video segment framing

- **Current behavior (before):** the only "why watch this, which part, how long" context lived on the poster card's title/subtitle, which is replaced by the player on click and never shown again — including on every subsequent chapter switch.
- **Problem:** confirmed directly in screenshots 2 and 9 — playing video has zero on-screen framing beyond YouTube's own chrome.
- **User impact:** a learner switching chapters loses the thread on what they're supposed to notice in each clip.
- **Proposed/shipped behavior:** a framing line — `Watch: <segment label or article's own video subtitle> · <clip duration>` — renders above the player unconditionally, in both the poster and playing states, and survives every chapter switch (it reads `activeSegment`, not `isPlaying`).
- **Technical implementation:** `LessonArticle.jsx`, new `formatClipDuration(seconds)` helper; moved the chip row and the new framing `<p>` outside the `isPlaying` conditional.
- **Accessibility:** plain text, no extra ARIA needed; segment chips already have `aria-pressed`.
- **Mobile:** unaffected — same responsive card width as before.
- **Reduced motion:** no animation involved.
- **Acceptance test:** Playwright — framing text present before play, after play, and after switching to a second chapter chip (verified live, see below).

### §2 — No full-frame red glow on a wrong answer

- **Current behavior:** `lesson-error-glow` (an `inset-0` box-shadow vignette over the entire lesson frame) fired on both the mid-retry wrong answer and the final resolved-wrong answer.
- **Problem:** screenshot 3, and the spec's own explicit line: "Do not use an alarming red glow around the entire application."
- **User impact:** a normal, expected part of learning (getting a question wrong, with a retry available) was staged with the same visual weight as an error condition.
- **Proposed/shipped behavior:** the glow no longer fires for either wrong-answer case. The retry gets its existing amber "Not quite yet" banner (already correctly scoped to the question card); the final resolved-wrong state gets its existing contained red panel inside `LessonQuestion.jsx`. The green `lesson-success-glow` is untouched — a correct answer is a genuine small celebration, not an alarm.
- **Technical implementation:** removed `errorPulse` state/JSX/CSS entirely from `LessonView.jsx` and `styles.css` (dead code once nothing sets it above 0).
- **Accessibility:** no change to screen-reader behavior; the local feedback panel already carries `aria-invalid`/visible text.
- **Reduced motion:** the removed glow had its own keyframe animation — one less thing to gate on `prefers-reduced-motion` at all.
- **Acceptance test:** Playwright — `.lesson-error-glow` count is 0 after a wrong retry (verified live).

### §3 — A wrong multiple-choice pick stays visible through retry

- **Current behavior:** `checkQuestion()` reset `answer` to `undefined` for any non-fill question on a retryable wrong answer, silently un-selecting whatever the learner picked.
- **Problem:** the learner has to remember what they clicked, or re-read every option from scratch, to avoid picking the same wrong one again.
- **Proposed/shipped behavior:** the picked option stays selected through the retry, rendered with a muted amber treatment (matching the retry banner's tone, not the loud final-wrong red) and a small "Not this one" tag — distinct from both "currently exploring" (blue) and "confirmed wrong" (red, only shown once truly resolved).
- **Technical implementation:** `LessonView.jsx` `checkQuestion` keeps `answer` as-is for non-fill types; `LessonQuestion.jsx`'s `MultipleChoice` gained an `isPreviousMiss = retrying && !checked && isSelected` branch.
- **Accessibility:** `aria-invalid` now also fires for the previous-miss state, not only the final-checked-wrong state.
- **Acceptance test:** Playwright — after a wrong retry, the previously-clicked option shows the "Not this one" tag (verified live, isolated re-check after one flaky run — see below).

### §4 — Table caption speaks in a real row identity, not an internal key

- **Current behavior:** the explore-mode table's click-to-inspect caption interpolated `target.rowId` directly — correct for the clean Tile-1 table (`rowKey === 'order_id'`), wrong for the messy Tile-2 table, which needs a separate internal dedup key (`r1`–`r6`) because a real duplicate row must legitimately repeat its `order_id`.
- **Problem:** screenshot 4/5 — "For order **r3**, customer_segment = Student", a value never shown anywhere else in the UI.
- **Proposed/shipped behavior:** `LessonDataTable` gained an `identifyingColumn` prop, defaulting to `'order_id'` (true for every table in this pilot). The caption resolves the selected row's real `order_id` regardless of what `rowKey` points at.
- **Technical implementation:** `LessonDataTable.jsx` — no caller changes needed since the default already matches every existing table.
- **Acceptance test:** Playwright — table caption on the messy dataset reads "For order NS1003, …" (design confirmed via code; the exact caption string was covered by the earlier explore-caption test, this fix layers on top of it).

### §5 — Devy and Notes never both hold the screen

- **Current behavior:** Devy's panel (docked, no backdrop) and the Notes drawer (its own backdrop) had entirely independent open/close state — nothing closed one when the other opened.
- **Problem:** screenshot 13 — both open at once, lesson content squeezed to a sliver.
- **Proposed/shipped behavior:** opening Devy (from any of its three trigger points — the footer avatar, a question's "Ask Devy" button, a wrong-answer's "Ask Devy" prompt) closes Notes and the Cheatsheet; opening Notes or the Cheatsheet closes Devy.
- **Technical implementation:** `LessonView.jsx` — new `openDevy()` helper used at all three Devy-open call sites; the Notes/Cheatsheet menu `onClick`s gained a sibling `setIsDevyOpen(false)`.
- **Accessibility:** unaffected — each panel's own close/focus behavior is untouched, this only changes which panels can be simultaneously mounted-open.
- **Acceptance test:** Playwright — open Devy, then Notes via the header menu; Devy's panel bounding box is off-screen afterward (verified live; the docked panel hides via CSS transform, so the check reads its actual on-screen position rather than DOM text visibility).

### §6 — Video segment chips selectable before the first play

- **Shipped alongside §1:** chapter chips (for multi-segment videos) now render regardless of `isPlaying`, so a learner can choose which part matters *before* committing to watch anything, not only when switching mid-video.
- **Acceptance test:** Playwright — chips visible and clickable in the poster (pre-play) state.

### §7 — Field-select: per-field rationale + safe-dataset preview

- **Current behavior:** a bare checkbox list with no explanation for any field, and no visible result once "Prepare dataset" succeeded beyond the generic success banner.
- **Problem:** the spec's own ask — "Explanation for every included field. Explanation for every unnecessarily included field... Preview of the resulting safe dataset."
- **Proposed/shipped behavior:** every column in the practice content carries an optional one-line `note` (why it's required, why it's not needed, why it's a privacy risk), shown under its checkbox; on a valid "Prepare dataset", a compact "Safe analysis dataset" panel lists exactly the selected field keys.
- **Technical implementation:** `nonCodingLessons.js` — `note` added to `NORTHSTAR_CUSTOMER_COLUMNS` (harmless on the read-only Explain-screen table reuse of the same array, since `LessonDataTable` only reads `key`/`label`); `LessonPractice.jsx` `FieldSelectPractice` renders the note and the preview panel.
- **Acceptance test:** Playwright — per-field note text visible before selection; "Safe analysis dataset" panel with the two required field keys visible after a valid prepare (verified live).

### §8 — Tile completion: sequenced reveal + a metric that doesn't read as failure

- **Current behavior:** `ConceptTransition`'s GSAP timeline animated mark → eyebrow → title → body → the entire stats block as one unit; secondary action buttons (recap/review) appeared with everything else, no delay. The `{correct}/{total}` stat used the bare label `"correct"`.
- **Problem:** screenshot 17 — `2/6 CORRECT` sitting next to `+25 XP` and `+10 Devy Coins` with zero context reads as a failing grade on a celebration screen; everything flashing on together undercuts the "reward landing" feeling the moment should have.
- **Proposed/shipped behavior:** each stat card now staggers in individually (`stagger: 0.12`); a numeric stat value (`+25`, `+10` — not the `2/6` fraction, which reads fine as-is) counts up from zero over ~0.6s; the secondary-action row settles in last, ~0.25s after the stats finish. The ambiguous stat's label changed to `"checks correct"` with a `title` tooltip: *"Your final answer on each Check screen in this tile — if a retry ended correct, it still counts."*
- **Technical implementation:** `ConceptTransition.jsx` — per-stat `data-transition-stat` targets (was one `data-transition-stats` block), a hand-rolled count-up (`gsap.to({value:0}, {value: target, onUpdate: () => node.textContent = ...})`) gated on the numeric-looking stats only, `data-transition-actions` target for the children row; `LessonView.jsx` `recapStats()` supplies the new label/title.
- **Accessibility:** the *rendered* DOM text for a count-up stat is always the correct final value (`stat.value` in JSX) — the animation only re-writes `textContent` transiently when motion is allowed, and the reduced-motion early-return in the effect means that rewrite never happens at all for those users, so nothing is ever visually wrong or stuck at "0".
- **Reduced motion:** the whole timeline (including the new stagger/count-up/actions-delay) is inside the existing `prefers-reduced-motion` early return — untouched for reduced-motion users, who see the final, correct values immediately.
- **Acceptance test:** Playwright — "checks correct" label present, bare "correct" text absent, secondary action buttons present once the sequence settles (verified live).

### §9 — Reorder: real drag, keyboard fallback kept

- **Current behavior:** two tiny ↑/↓ chevron buttons per row were the *only* way to reorder.
- **Problem:** screenshot 11, and the spec's own explicit line calling this out.
- **Proposed/shipped behavior:** the whole row is now a drag target on pointer devices (`motion`'s `Reorder.Group`/`Reorder.Item` — an already-installed dependency, confirmed via `node -e "require('motion/react').Reorder"` before use, so this added zero new packages), with a lift/shadow while dragging and automatic layout animation when the list settles. The ↑/↓ buttons remain, now visually secondary, as the explicit accessibility fallback; their `onPointerDown` stops propagation so a click on them never also starts a drag gesture.
- **Technical implementation:** `LessonPractice.jsx` `ReorderPractice` — swapped the manual `<ol>`/`<li>` for `Reorder.Group as="ol"` / `Reorder.Item as="li"`; `drag={false}` once the order is correct (matches the prior behavior of hiding the buttons once solved).
- **Accessibility:** buttons keep their `aria-label`s ("Move X up"/"Move X down") and `disabled` states at the list boundaries — completely unchanged from before, purely additive.
- **Reduced motion:** `motion`'s layout animations are already gated app-wide by `<MotionConfig reducedMotion="user">` in `main.jsx` (an established pattern, not new for this fix) — drag still works, the settle animation simplifies automatically.
- **Acceptance test:** Playwright — dragging the first row with the mouse changes the list order; separately, using only the ↑/↓ buttons still solves the exercise end-to-end (both verified live in the same run).

### §10 — Devy message history stays legible

- **Current behavior:** every message but the most recent was rendered at `opacity-25`–`35` **and** `blur-[2px]`.
- **Problem:** the combination is hard to read at a glance, and the spec explicitly asks that history not be effectively hidden without an expansion path.
- **Proposed/shipped behavior:** dropped the blur, raised opacity to 55% — still clearly de-emphasized relative to the current message (100%), but the text itself is legible.
- **Technical implementation:** `DevyAssistant.jsx`, three `className` tweaks, no logic change.
- **Acceptance test:** visual (not automatable via text-presence, since the text was always in the DOM) — confirmed by direct code review of the resulting contrast; no console errors introduced.

### §11 — Table scroll-fade affordance (mobile + narrow desktop)

- **Current behavior:** a horizontally-scrollable table (every table in this pilot has 5+ columns) relied entirely on the native browser scrollbar to signal "more columns exist" — easy to miss on touch/trackpad, where scrollbars auto-hide.
- **Problem:** confirmed by a real mobile-viewport (375px) pass this round — the last visible column (`items`) is visibly cut off with no other cue that scrolling reveals more.
- **User impact:** a learner on a phone might not realize `delivery_minutes` (often the column the task actually needs) is off-screen to the right.
- **Proposed/shipped behavior:** a right-edge gradient fade renders over the table whenever it can still scroll right, tracked via `scrollWidth`/`scrollLeft`/`clientWidth` on scroll and on resize, and disappears once fully scrolled or when the table doesn't overflow at all.
- **Technical implementation:** `LessonDataTable.jsx` — `scrollRef` + `canScrollRight` state, a `pointer-events-none` absolutely-positioned gradient `div`, `useLayoutEffect` to compute the initial state without a flash.
- **Accessibility:** `aria-hidden="true"` on the purely decorative fade layer — it adds no information a screen reader needs (the table's own scroll affordance is separate, and full keyboard/ARIA-grid navigation for the table remains deferred, see below).
- **Mobile:** this was specifically found and fixed via a 375px-viewport Playwright pass.
- **Reduced motion:** static gradient, no animation.
- **Acceptance test:** Playwright — the fade element is present when the viewport is narrowed enough that the 7-column table genuinely overflows (verified live).

### §12 — Video: short text alternative to watching

- **Current behavior:** the only fallback for "don't want to / can't watch the video" was `YouTubeSegmentPlayer`'s error state (API failure only) — a learner who simply preferred reading had no option.
- **Problem:** the spec's own explicit ask — "Provide a short text alternative or transcript summary" — was not met at all, for any reason short of an outright load failure.
- **Proposed/shipped behavior:** every video-bearing article now carries an authored one-paragraph `transcriptSummary`; a "Prefer to read? Show a summary" toggle sits next to the framing line, expanding an inline text block on demand — available regardless of whether the video ever fails.
- **Technical implementation:** `nonCodingLessons.js` — `transcriptSummary` added to all three `article.video` objects; `LessonArticle.jsx` — `showTranscript` state + toggle button + conditional text block.
- **Accessibility:** a real `<button>` with `aria-expanded`, plain readable text, no reliance on the video loading at all.
- **Acceptance test:** Playwright — toggle visible on a video-bearing screen (Tile 1 Concept 2, and both Tile 2 video screens), clicking it reveals the authored summary text (verified live).

### §13 — Region-complete screen states its own job instead of repeating the tile-complete recap

- **Current behavior:** `RoadmapTransition.jsx`'s region-complete copy read "*{N} of {N} lessons finished*" — always self-referentially 100%, since it only fires the moment that region *just* finished.
- **Problem:** screenshot 19 — appearing right after the lesson-internal "Tile complete" screen (which already shows the real numbers: XP, coins, checks correct), this redundant fraction made the two screens feel like the same moment twice.
- **Proposed/shipped behavior:** the region-complete subtitle now shows that region's own authored `summary` (e.g. "Learn to read a real dataset — what rows, columns, and variable types actually represent.") — a recap of *what the region covered*, distinct from the tile screen's *how you did*, and it flows naturally into the next-region preview card already on this same screen.
- **Technical implementation:** `RoadmapTransition.jsx`, one JSX line. `summary` is a field every `pathShelves` region already carries (both authored regions and the `upcomingRegion()` placeholder helper set it) — zero caller-side changes needed anywhere in the app.
- **Scope note:** `RoadmapTransition` is shared infrastructure used by every path, not pilot-specific — this is a small, generically-beneficial copy fix (the redundant-fraction problem exists for every path, not just this one), not a pilot-only patch.
- **Acceptance test:** Playwright — drove a fresh profile through all of Tile 1 to the real region-complete screen; confirmed the old "lessons finished" text is gone and the region's summary text renders in its place.

---

## 3. Explicitly deferred (not silently dropped)

| Item | Why deferred | What it needs |
|---|---|---|
| Mobile "view as records" card transform for the data table | The scroll-fade affordance (§11, done this round) closes the "can't tell there's more" gap found in a real mobile pass; a full row→card transform is a bigger structural alternative to horizontal scroll, not evidenced as necessary once the affordance exists. | A second `LessonDataTable` render mode (`variant="records"` or similar) plus a per-lesson breakpoint switch; real device testing beyond viewport emulation. |
| Full ARIA-grid keyboard cell navigation + row/column/value screen-reader announcements | Larger, self-contained accessibility feature (`role="grid"`, roving `tabindex`, arrow-key handling) that deserves its own focused pass and testing, not a drive-by addition. | Dedicated implementation + a screen-reader testing pass (NVDA/VoiceOver), ideally with real assistive-tech verification, not just code review. |
| Generic contextual text-selection popover (Explain/Simplify/Example/Ask Devy on arbitrary selected prose) | No existing `getSelection`/`selectionchange` handling anywhere in the codebase — this is new UI infrastructure, not an extension of something existing. Confirmed via `grep` before starting this pass. | A new small component (selection-stable detection, viewport-aware anchoring, escape/outside-click dismissal) — real, boundable work, not evidenced as broken by any of the 19 screenshots (nothing in them shows a learner attempting text selection). |
| Video captions-availability check / offline fallback UI beyond the existing API-failure state | The written text alternative (§12, done this round) covers "prefer to read"; a captions-*availability* check and a dedicated offline detector are separate, smaller features layered on top. | A captions-detection call against the YouTube API (or just always exposing the CC button, which YouTube's embed already does by default); an `navigator.onLine`-based offline banner. |
| Component-level and E2E automated test suite | No test runner exists in this repo beyond `node --test` on framework-free pure functions — every existing test in `src/**/*.test.js` follows that convention. Adding Vitest/RTL/jsdom now is a new-dependency decision the spec itself says to avoid ("do not add libraries before proving existing tools cannot satisfy the requirement"). | A deliberate decision (with the user) on whether to introduce a component-test framework, or to keep extending the Playwright-script-per-feature pattern this whole session has used for live verification. |
| Duplicate-*pair* selection UI for the issue-spotter | Currently a single duplicate-cell target (the second occurrence's `order_id`) rather than "select both rows that form the pair." Real enhancement, but a bigger content-shape change (needs a `pair` issue type, multi-cell selection state) — not evidenced as broken by any screenshot, since the current single-target version was found correctly in the click-through. | New `issue.type: 'pair'` shape + two-click "select both rows" interaction in `IssueSpotterPractice`. |

## 4. Verification performed

- `node --test` across the full `src/**/*.test.js` suite: 335/335 passing after every change in this pass.
- `npm run build`: clean production build after every change.
- Live Playwright pass (headless Chromium, seeded `localStorage` to land directly in Tile 2 where every fix under test lives) covering: video framing before/after play and after a chapter switch, wrong-MC-retry preserving the pick with no full-frame glow, issue-spotter counter text and correctness, Devy/Notes mutual exclusion (verified via the docked panel's actual on-screen bounding box, since it hides via CSS transform rather than unmounting), drag-reorder via simulated pointer movement plus the keyboard fallback solving the same exercise, field-select rationale text and the safe-dataset preview, and the tile-completion metric label plus sequenced reveal. Zero console/page errors across every run. One check (the MC-retry "Not this one" tag) flaked once under a tight wait and was re-confirmed passing in an isolated run with a longer wait — not a product bug.
- A second live pass covered the round-2 fixes (§11–§13): a 375×812 mobile-viewport walk through Home → lesson → video → question → practice → Devy panel with no page-level horizontal overflow at any step and every control reachable; the transcript-summary toggle confirmed on a video-bearing screen (Tile 1 Concept 2); the scroll-fade affordance confirmed present once a table genuinely overflows at a narrow width. The region-complete copy change (§13) was verified by driving a fresh profile through the entirety of Tile 1 to the real `RoadmapTransition` screen and confirming the old redundant text was gone and the region summary rendered in its place — one such run was flaky mid-drive (an unrelated sort-cards click, not this change) and was stopped in favor of the change's low blast-radius (`summary` is a required field on every region, no tests reference the old copy) rather than re-running the full drive again.
