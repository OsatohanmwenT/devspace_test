# Devspace film: beat map

**Track:** Mixkit #371 "Cat Walk" by Arulo (EDM, 2:04), from `audio/tracks/371.mp3`.

**Grid** (fitted to 111 onsets in `audio/analyze.py`; mean error 2.4 ms):
- 130.00 BPM, one beat = **0.46153 s**
- Track beat 0 is at 0.4521 s
- **Drop at 88.604 s** (track beat 191). Low-end energy jumps about 60x.

**Film window:** the track is trimmed to start at **73.835 s** (track beat 159), so the drop lands on **film beat 32 = 14.769 s**. The film runs 96 beats = **44.307 s**. The song fades out naturally over film beats 80–94 and is silent by 96.

Film time for beat *n* is `n × 0.46153`.

| Film beats | Time (s) | What the music does | Scene |
|---|---|---|---|
| **Intro** −16–0 | 0.00–7.38 (absolute) | Breakdown (track from 66.45 s) | See *Intro* below. Every time in this table is measured from the end of the intro; add 7.385 s for the position in the final video |
| 0–8 | 0.000–3.692 | Breakdown: hats and pads, no bass | **Brand.** Navy circle springs into a pill, the real mark wipes open inside it, the wordmark wipes out from behind, and "A learning platform for **tech aspirants**." rises, with "tech aspirants" in white inside a blue→cyan highlight |
| 8–16 | 3.692–7.384 | Breakdown | **Meet Devy (Rive).** The text sinks back into its mask line, the mark closes back to the navy pill, which folds into a circle, travels left and squashes into the platform's silhouette. The live `all_devy.riv` platform wipes open inside it, and Devy pops out with `Timeline 1` (5.25→6.4 s: ears, duck, spring into the air, land arms-up). "Meet Devy." lands with him, then he waves (`Timeline 1` 9.6→11.3 s at 1.25×). "Your learning guide." |
| 16–20 | 7.384–9.231 | Breakdown | Q1 "What brings you here?" → *I want to build a professional career* → "That's a strong reason to start." |
| 20–24 | 9.231–11.077 | Breakdown | Q2 "Which of these sounds most like you?" → *Machine Learning Engineer* → "Machine Learning Engineer it is." |
| 24–28 | 11.077–12.923 | Breakdown | Q3 "Where are you starting from?" → *Complete beginner* → "We'll start at your level." |
| 28–32 | 12.923–14.769 | Build to the drop | Devy glides to centre (`idle_state` + `look_x`). "Building your route" rises, and the app's real status lines replace each other ("Mapping what you already know…", "Ordering the concepts…", "Finding where practice fits…") over three bobbing dots |
| **32** | **14.769** | **Drop** | Devy `launch`es; at take-off the warm blue flood bursts out of his platform (0.35 s). "Your learning path / Machine Learning Engineer it is. / Here’s a quick view of the skills you’ll build, step by step." The five ML stage cards burst out, then the app's own scan (last → first) lands on Python fundamentals ("Start here") |
| 36–38 | 16.615–17.538 | Full groove | The other cards slide behind Python fundamentals, the flood shrinks back into it, and the card opens into the lesson page. Devy rises into the footer with `bridge_home` |
| 37.5–42.5 | 17.3–19.6 | Full groove | "Check variables and expressions / What do computers use variables for?" → *To store information for later use* → green check → Devy hops, "Exactly right." → Continue |
| 42.5–52 | 19.6–24.0 | Full groove | Continue opens into the real "Try the calculation" lab (`yearly_hours.py`, starter `hours_per_week = 40`, `weeks_per_year = 52`). `yearly_total = hours_per_week * weeks_per_year` and `print(yearly_total)` type on fixed lines (2.5 s, uneven rhythm), task 1 ticks, Run → **2080**, task 2 ticks, Devy hops, "Nice — that’s it." |
| 52–60 | 24.0–27.7 | Full groove | The output panel opens into Lesson complete: crown/medal Devy (`lesson-complete.lottie`), "You did it. You built something real with Python.", Total XP **25** (LESSON_XP, counting up) / Perfect 100% / Speedy 2:41 one per beat |
| 59.6–64 | 27.5–29.5 | Full groove | Claim XP → the app's own curtain (two blue waves burst from the button, then open from the bolt) → 1-day streak: "A new streak! Practice every day to help it grow.", count 0 → 1, Thursday ticked |
| 64–68 | 29.538–31.384 | **One-bar break** | The page drops away; the weekday dots lift off and spring into 8 avatars over a 7% Devspace-mark motif. "Compete with friends in your league." |
| 68 | 31.384 | Bass returns | The Bronze League card arrives and the avatars dock into its rows (ranked by **Season Devy Coins**; You 3rd with 20, which is 4 concepts × 5 coins) |
| 70–72.6 | 32.3–33.5 | Full groove | Push in on the You row |
| 72.6–76.8 | 33.5–35.4 | Full groove | The You and Lucas Müller rows lift and open into "This week’s matchup": 20 vs 15 coins, tug bar, "You lead Lucas by 5", and the real rules footnote |
| 76.8–80 | 35.4–36.9 | Full groove | Private leagues slides in ("Race the people you actually know"); the cursor presses **Create a league** |
| 80–87.4 | 36.9–40.3 | Song fading | The button grows into the whole page (a pill until it meets the edges, with a push), its label grows to 132 px and lifts out. "Learn with y●●●●ur friends." on brand blue |
| 87.4–96 | 40.3–44.3 | Tail, then silence | The four faces gather into one navy dot, the blue page shrinks back into it, and the dot becomes the mark (same build as the opening). The wordmark wipes out, "A learning platform for tech aspirants.", and the **Start learning** pill. Hold |

## Sound effects

Each effect is placed so its attack lands on the event. The offset is `event_time − onset_s`. For swells (the impact and the page whoosh), the effect is placed by `peak_s` instead.

| Event | File | Onset (s) | Peak (s) | Place by |
|---|---|---|---|---|
| Chip tap (×4) | `sfx/chip-tap.mp3` (Mixkit 1109) | 0.000 | 0.069 | onset |
| Devy reply bubble (×4) | `sfx/bubble-pop.mp3` (2357) | 0.014 | 0.128 | peak |
| Typing (route, code) | `sfx/typing.mp3` (1396) | 0.090 | n/a | trimmed to the typed span |
| Drop | `sfx/drop-impact.mp3` (2902) | 0.145 | 1.304 | onset on beat 32 |
| Path strip | `sfx/cards-swoosh.mp3` (166) | 0.138 | 0.296 | peak |
| Run | `sfx/run-click.mp3` (3124) | 0.000 | 0.013 | onset |
| Lesson complete | `sfx/success.mp3` (2865) | 0.007 | 0.260 | onset |
| Claim XP | `sfx/coin.mp3` (2069) | 0.007 | 0.042 | onset |
| Avatar lands (×8) | `sfx/avatar-pop.mp3` (2356) | 0.035 | 0.048 | onset |
| Pill fills page | `sfx/page-whoosh.mp3` (1489) | 0.430 | 0.715 | peak at the edge contact |
| Mark appears | `sfx/sparkle.mp3` (3060) | 0.112 | 0.246 | peak |

The final mix is loudness-normalised to −14 LUFS (`loudnorm=I=-14:TP=-1:LRA=11`).

## Changes since the first draft
- The brand moment is now beats 0–8, up from 0–6, so the tagline holds long enough to read.
- Onboarding is three questions instead of four. "Which area feels closest…" (AI & Automation) was cut so each question gets about 2.3 s, and "Machine Learning Engineer it is." still says where the learner ended up.
- "Your start" became the app's real "Start here" label.

## Changes after the stills review (2026-10-09)
- **No neon.** The drop flood is now warm white washed with brand blue from the top: `#2350e6 → #3d7bf5 → #8fd3f2 → #f5efe6`, taken from the logo mark's blue→cyan. The tagline highlight uses the same blue→cyan with white text.
- **Devy is Rive everywhere except Lesson complete.** `assets/devy/all_devy.riv` is drawn by `lib/rive-seek.js`: a fresh artboard on every frame, with timeline times set directly, so frames are deterministic. `wave.lottie` is no longer used. `lesson-complete.lottie` stays because the crown/medal pose isn't in the .riv.
- Meet Devy is now beats 8–16, and onboarding is beats 16–28 (3 questions × 4 beats).

## Rive timeline plan (`all_devy.riv`, one 500×500 artboard, 60 fps)
| Timeline | Use in the film |
|---|---|
| `Timeline 1` 5.25→6.4 s | The pop: ears, duck, spring into the air, land arms-up (Meet Devy) |
| `Timeline 1` 9.6→11.3 s | The wave (Meet Devy) |
| `idle_state` with `blink` on top | Holds beside the onboarding cards |
| `launch` | Hop of approval when an answer is picked; the take-off on the drop |
| `tower_launch` / `tower_return` | Platform drops away under the flood, and rises back for the outro mark |
| `bridge_home` | Platform rises in with Devy on it (end card) |
| `look_x` with `idle_state` | Devy glances toward the cursor or the card being chosen |
| `entrance_updown_pop`, `entrance_side_pop`, `entrance_rope`, `walk`, `flight`, `particles` | Not used yet. `particles` is banned by the style rules |

## Corrections from the real app (2026-10-09)
- The code lab output is **2080** (`40 × 52`, the real `variablesExpressionsGuidedEditor`), not 312. 312 came from an article example.
- League standing and head-to-head use **Season Devy Coins**, not XP. The film keeps the 25 XP on Lesson complete separate from the 20 coins in the league.
- Rival names, roles and avatars come from `src/data/rivals.js` through the app's own `resolveAvatar`. The standings numbers are demo values, labelled in `fixture.json`.

## Running it
```
node render.mjs devspace.html out/devspace-silent.mp4            # ~25 min, 60 fps, 8 subframes
node tools/page-eval.mjs devspace.html > audio/cues.json         # SFX cue sheet from the page
python tools/mix.py audio/cues.json out/mix.wav                  # music + SFX, -14 LUFS
ffmpeg -i out/devspace-silent.mp4 -i out/mix.wav -c:v copy -c:a aac -b:a 256k -shortest out/devspace.mp4
python tools/scan_pops.py out/devspace.mp4                       # single-frame pop scan
```

## Intro (added 2026-10-09): ambition → uncertainty → "Meet Devspace."
The intro is a 16-beat (7.385 s) screen-space layer in front of the original film. Every scene from the brand build on runs unchanged, shifted by `INTRO` in `seek()`. The music starts 16 beats earlier (track 66.45 s, still in the bass-less breakdown), so the drop still lands at the path-card burst (22.15 s in the final video).

Structure and pacing come from the reference's first 4 s: words land one at a time, the key word arrives grey and settles to ink, clutter flies in around the line, and one push through the headline clears the frame.

| Time (s) | Scene |
|---|---|
| 0.12–1.75 | "You want to get into **tech.**" (blue→cyan key word) rises word by word on the clean warm canvas |
| 1.85–4.15 | Line lifts away; "But with so many paths and resources, / where do you **start?**" rises. 11 fragments fly in from outside the frame along their line from centre: real career titles (Frontend Developer, Machine Learning Engineer, Data Analyst, DevOps Engineer, UI/UX Designer), the "Core ML algorithms" stage card, a tutorial card, tabs ("Python or JavaScript first?"…), a saved-for-later list |
| 4.15–6.0 | "What should you learn— / and how do you put it into **practice?**". The first pile is shouldered outward and the practice pile arrives: a `SyntaxError`, `command not found: npm`, "Project ideas?", an empty `my-first-project/`, a plan stuck at "Build something real?" |
| 6.0–6.62 | Punch-through: one push into the line (1× → 6×, log-space zoom, ease-in), whoosh |
| 6.62–8.5 | "Meet Devspace." rises; at 7.385 the navy dot below starts the original logo build, and the line sinks as the tagline rises |
