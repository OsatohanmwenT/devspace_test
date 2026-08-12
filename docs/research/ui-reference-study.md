# UI Reference Study

_Research input for `docs/devspace-doctrine.md`. Completed 2026-08-12._

This is not a mood board. Every observation here is recorded as a number or a mechanism we
can adopt, and every claim is labelled by evidence strength:

- **[primary]** — read directly from the source's own published guidance.
- **[secondary]** — from a credible third-party teardown of the product's shipped design.
- **[derived]** — computed by us from the source's published values.

Contrast ratios below were computed with the WCAG 2.1 relative-luminance formula
(script retained in the session scratchpad; formula reproduced in §6 so any claim can be
re-derived).

---

## 1. Apple Human Interface Guidelines [primary]

Read 2026-08-12 from `developer.apple.com/design/human-interface-guidelines/` —
`design-principles`, `dark-mode`, `accessibility`, `layout`.

### The simplicity distinction we needed

Apple's Simplicity principle states it outright: **"Simplicity isn't minimalism. Aim for a
focused, useful experience that keeps the important things close by and lets the others
fall away."** Its supporting points are *Include just what's necessary*, *Be concise*, and
*Establish hierarchy* — "Prioritize recognizable controls and a consistent structure that
helps people understand where they are and what comes next."

This resolves the argument directly. Removing widgets from Home is not minimalism-for-its-
own-sake; leaving them in is not richness. The test is whether each element is *necessary*.

### The Delight principle constrains mascots

**"Don't mistake delight for decoration."** Apple: "people are trying to accomplish a task,
so don't let pursuit of delight for its own sake get in the way of your product's core
purpose." Also *Create defining moments* — "From a simple button press to an error message,
consider whether each moment is an opportunity to add a touch of character."

Read together: character belongs at **defined moments**, not spread evenly. This is the
source of the Devy rule in the doctrine (§9).

### Typography and contrast numbers

Custom type-size recommendations, iOS/iPadOS:

| | Default size | Minimum size |
|---|---|---|
| iOS, iPadOS | **17 pt** | **11 pt** |
| macOS | 13 pt | 10 pt |

Apple explicitly adds: "If you're using a custom font with a thin weight, aim for larger
than the recommended sizes."

WCAG AA values Apple's own Accessibility Inspector applies:

| Text size | Weight | Minimum contrast |
|---|---|---|
| Up to 17 pt | All | **4.5:1** |
| 18 pt | All | 3:1 |
| Any | Bold | 3:1 |

And for Dark Mode specifically: "At a minimum, make sure the contrast ratio between colors
is no lower than 4.5:1. **For custom foreground and background colors, strive for a
contrast ratio of 7:1, especially in small text.**"

That 7:1 target matters for Devspace, because every Devspace color is a custom color.

Also: **"Convey information with more than color alone."** Offer "distinct shapes or icons,
in addition to color."

Control sizing: iOS default **44×44 pt**, minimum 28×28 pt. Spacing guidance: "about 12
points of padding around elements that include a bezel… about 24 points" for un-bezeled
elements.

### Dark mode: base and elevated

The mechanism, stated plainly: "In Dark Mode, the system uses **two sets of background
colors — called base and elevated** — to enhance the perception of depth when one dark
interface is layered above another. The base colors are dimmer, making background
interfaces appear to recede, and the elevated colors are brighter, making foreground
interfaces appear to advance."

Note the count: **two**, not thirteen.

Apple also warns the two appearances are not mirrors: dark-mode colors "aren't necessarily
inversions of their light counterparts: while many colors are inverted, some are not." And
it advises "Avoid using hard-coded color values or colors that don't adapt" — precisely the
failure mode in Devspace's 1,223 inline hex literals.

### Illustration adaptation

Apple ships three captioned illustrations making one point: an illustration on a light
background, "on a dark background, the same illustration has poor contrast and many details
are lost," and then the same illustration "adjusted for better contrast on a dark
background." Its instruction: "If an asset looks good in only one mode, modify the asset or
create separate light and dark assets."

Also: "Soften the color of white backgrounds… consider slightly darkening the image to
prevent the background from glowing in the surrounding Dark Mode context."

### Layout

Two sentences we should treat as rules:

- **"Make essential information easy to find by giving it sufficient space. People want to
  view the most important information right away, so don't obscure it by crowding it with
  nonessential details."**
- On grouping: "you might use **negative space**, background shapes, colors, materials, or
  separator lines to show when elements are related." Negative space is listed *first*,
  ahead of background shapes.

Plus *Place items to convey their relative importance* — people read top-to-bottom,
leading-to-trailing, so the most important item goes near the top and leading edge.

---

## 2. Duolingo home / path redesign [primary]

Source: `blog.duolingo.com/new-duolingo-home-screen-design/`.

The stated problem was **learner uncertainty about what to do next** — learners were unsure
whether they were using the product optimally, and the company framed the opportunity as
guiding learners to "the right lesson at the right time," grounded in learning-science
research.

What they *removed*: the branching skill tree, the separate Stories tab, crown-based
progress. What they *added*: a single linear path that interleaves material for spaced
repetition, with guidebooks attached to units.

**The transferable principle is subtractive, and it is not the circles.** The redesign
reduced the number of decisions a learner has to make before starting. Devspace should
steal the decision-reduction, not the visual metaphor — see §7.

Note the direction of travel: Duolingo solved "I don't know what to do next" by showing
*less* branching, not more information about progress.

---

## 3. Linear [secondary]

From published teardowns of Linear's shipped design system.

Reported dark ladder: `#08090a → #0f1011 → #161718 → #23252a` — canvas → surface →
elevated, four steps total. Borders are hairline and very low-contrast:
`rgba(255,255,255,0.05)`–`rgba(255,255,255,0.08)`. Type sits in a low weight band
(≈400–510) rather than bold, with tight tracking. Radii ≈6px and 12px.

### The calibration that changed our rule [derived]

We computed the WCAG ratios of Linear's own ladder:

| Step | Ratio | ΔLuminance |
|---|---|---|
| `#08090a → #0f1011` | 1.05:1 | 0.0024 |
| `#0f1011 → #161718` | 1.06:1 | 0.0034 |
| `#161718 → #23252a` | 1.17:1 | 0.0100 |
| border 8% white over `#0f1011` | 1.22:1 | — |

**Adjacent dark surfaces in a design system widely regarded as excellent sit at 1.05–1.17:1,
and its borders at 1.22:1.** So a blanket "all borders must meet 3:1" rule is wrong, and
WCAG contrast ratio is the wrong instrument for measuring surface elevation. WCAG 1.4.11's
3:1 non-text requirement applies to boundaries that *identify a UI component or its state*
(inputs, controls, selected states, focus) — not to decorative separators.

Elevation should therefore be specified in **luminance delta**, with the 3:1 rule reserved
for interactive boundaries. The doctrine adopts this split.

### What this means for Devspace [derived]

We sorted Devspace's 13 near-black surfaces by luminance:

| Hex | Luminance | ΔL from previous |
|---|---|---|
| `#121214` | 0.00612 | — |
| `#171717` | 0.00857 | 0.00245 |
| `#181818` | 0.00913 | **0.00057** |
| `#1a1a1a` | 0.01033 | 0.00120 |
| `#1b1b1d` | 0.01106 | **0.00073** |
| `#1d1d20` | 0.01244 | 0.00139 |
| `#1e1e1e` | 0.01298 | **0.00054** |
| `#1f1f1f` | 0.01370 | **0.00072** |
| `#262626` | 0.01938 | 0.00568 |
| `#262629` | 0.01958 | **0.00020** |
| `#2e2e2e` | 0.02732 | 0.00774 |
| `#303030` | 0.02956 | 0.00224 |
| `#404040` | 0.05127 | 0.02171 |

**This corrects the assumption we started with.** Devspace's canvas→card step
(`#121214`→`#1f1f1f`) is ΔL 0.00758 — *larger* than any of Linear's first two steps. The
dark-mode failure is therefore **not** a missing surface step. It is three other things:

1. **Thirteen values doing four jobs**, several separated by imperceptible deltas
   (`#262626`→`#262629` is ΔL 0.0002; `#1e1e1e`→`#1f1f1f` is 0.0007). These are not
   elevation levels, they are drift.
2. **The same role rendered in different colors on different screens.** Profile's card is
   `#1b1b1d`/`#333336`; every other screen's card is `#1f1f1f`/`#404040`.
3. **The border carries all the structure and is nearly invisible.** `#404040` on `#1f1f1f`
   computes to **1.59:1**. Linear can afford a 1.22:1 border because its layout leans on
   space and a short ladder; Devspace stacks 7 bordered cards per viewport and asks a
   1.59:1 hairline to separate all of them.

The fix is a short, consistently-applied ladder plus fewer simultaneous surfaces — not
brighter borders.

---

## 4. Notion, Spotify, Brilliant [secondary / inferred]

Recorded honestly: these have no published design guidance at the specificity we need, so
these are directional observations, not measured facts. They are included because they
anchor qualities the doctrine names, but **no numeric target in the doctrine rests on
this section alone.**

- **Notion** — hierarchy is carried almost entirely by type size, weight and vertical
  space. Cards are rare; most structure is a heading followed by content at a comfortable
  reading measure. The relevant lesson: a page can be dense with *information* while being
  sparse in *containers*.
- **Spotify** — "your library" reads as personal without reading as a toy. Personalization
  comes from content and imagery, not from mascots or badges layered onto chrome.
- **Brilliant** — a single interactive problem holds an entire viewport, with navigation
  reduced to progress plus one forward action. This is the pattern Devspace's lesson flow
  already implements and Practice does not.

## 5. Lindy and portfolio-class personal sites [inferred]

The target for Profile. The consistent traits: a large name, a one-line role, a short
paragraph, then work — with very little chrome, generous vertical space, and a type scale
whose top and bottom are far apart. Credibility comes from *what is shown* (real work,
plainly presented), not from ornament or counters.

The implication for Devspace Profile is a hierarchy question, not a styling question: name
and role must outrank everything, and quantitative progress artifacts (XP, coins, badge
grids, streak counters) do not belong in a view intended to be shared with another person.

---

## 6. Method note

Relative luminance per WCAG 2.1: for each 8-bit channel `C`, `c = C/255`, then
`c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`; `L = 0.2126R + 0.7152G + 0.0722B`.
Contrast ratio `= (L_lighter + 0.05) / (L_darker + 0.05)`.

Ratios quoted in this document and in the doctrine were computed with this formula rather
than estimated. One inherited figure was corrected in the process: the `#404040`-on-
`#1f1f1f` border ratio had been circulating as 1.4:1; it is **1.59:1**.

---

## 7. What Devspace should steal — and what it must not

### Steal

| From | What | Where it lands |
|---|---|---|
| Apple | "Simplicity isn't minimalism" as the arbiter of what stays on a screen | Doctrine §3, §8 |
| Apple | Base/elevated as a **short** ladder — two to four steps, not thirteen | Doctrine §5 |
| Apple | 17pt-class default body size; 11pt as an absolute floor | Doctrine §4 |
| Apple | 7:1 target for custom colors at small sizes; 4.5:1 as the hard floor | Doctrine §11 |
| Apple | Separate light/dark illustration assets when one doesn't survive both | Doctrine §9 |
| Apple | Negative space listed *before* background shapes as a grouping device | Doctrine §7 |
| Apple | "Don't mistake delight for decoration" | Doctrine §9 |
| Duolingo | Reduce the number of decisions before starting — by subtraction | Doctrine §3, §10 |
| Linear | Elevation measured in luminance delta; 3:1 reserved for interactive edges | Doctrine §5, §11 |
| Linear | Low weight band and restraint over bold-everything | Doctrine §4 |
| Brilliant | One interaction owns the viewport | Doctrine §10 |
| Lindy | Identity outranks metrics on a public profile | Doctrine §3 |

### Do not steal

- **Duolingo's path graphics.** The circles are their brand expression and read as a
  children's game. We take the decision-reduction principle only.
- **Duolingo's reward density.** Gems, chests, leagues and quests are a mature economy
  built over years. Devspace's equivalents are currently placeholders
  (`docs/observation.md` documents that the streak advances for zero-XP replays), so
  importing the surface area imports the noise without the loop.
- **Linear's density and its acid accent.** Linear is a professional tool for people who
  live in it daily and want maximum information per pixel. Devspace is a learning product
  someone opens for twenty minutes. Copying Linear's compactness is how we arrived at
  240 of 300 text nodes at ≤15px.
- **Linear's near-black canvas as an identity.** "Darkness as the native medium" suits an
  issue tracker. Devspace must work equally well in light.
- **Notion's chrome-free-ness applied to learning interactions.** Notion is a document
  surface; a quiz needs clear affordances and states.
- **Any of it uncritically.** Every borrowed pattern is re-tested against the four
  disciplines in Doctrine §2 before it ships.
