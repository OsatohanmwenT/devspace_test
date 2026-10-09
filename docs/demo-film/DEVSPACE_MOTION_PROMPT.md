# Devspace launch film: motion prompt

This is the food-ordering motion template rewritten for Devspace. It follows the founder direction in `Devspace_Demo_Codebase_Inspection_Prompt.md`: introduce Devspace, then Meet Devy, then onboarding answers and Devy's replies. The camera language comes from the Evy reference (`20261008-2242-30.5413173.mp4`), but the look follows the warm white keynote rules below.

Every product fact in this prompt was checked against the repo on the `new-look` branch (2026-10-08). File paths are relative to the repo root.

---

## 0. Studio setup (run before anything else)

```
Extract 2 frames per second from the reference (20261008-2242-30.5413173.mp4) with ffmpeg and put them on contact sheets. Break the video into beats: what happens on each beat, how each scene turns into the next, the camera moves, the colours and the fonts. Then write the same structure for Devspace, using the beat map below as the target.

Style: 2D only. Warm white background, black UI, one accent colour, one clean font (Geist). No 3D, no dark mode, no glows, no particles. Think Apple keynote, not a video game trailer.

Set up a motion design studio in film/ (not inside src/, so the app build is untouched). Install ffmpeg and Playwright with Chromium. Then render a 2 second test where a black circle grows into a pill on a spring, 60fps, and show me the first and last frame.

Download a royalty-free track at about 130 BPM with a clear drop from mixkit.co/free-stock-music. It must run at least 48 s from its start. Analyse it with numpy and give me the beat grid and the exact time of the drop. Then download one sound effect per event from mixkit.co/free-sound-effects and measure where each one peaks.
```

### What the reference does and what we keep

| Evy reference | Devspace version |
|---|---|
| "Hiring is tough." over scraps of messy UI | No problem-statement opening. The founder fixed the opening as the brand screen |
| "We just made it **easy**." with the key word recoloured | Brand line, with the key word filled by the accent: "A learning platform for **tech aspirants**." |
| Orb mascot: "Hi, I'm Evy." then "Your AI interviewer." | Real `wave.lottie` Devy: "Meet Devy." then "Your learning guide." |
| "Let me show you how this works." then the product | Onboarding answers and Devy's replies (the real `breakPrompts` copy) |
| Form fills, cursor clicks chips, CTA pill pressed | Answer chips selected, Continue pressed, "Building your route" |
| "Then you get everything" then the results table | Path cards, then a lesson, then the code lab Run, then Lesson complete |
| Avatars orbit the orb with a "3% to 50%" counter | DiceBear avatars gather into the league, then the head-to-head card |
| "Find y👥ur best candidates" | "Learn with y👥ur friends." with avatars standing in for the "o" |
| evy.io wordmark plus Book Demo | Devspace logo plus a call-to-action pill |

**Dropped from the reference:** dark backgrounds, glows, 3D card tilts and the light-streak "Feedback submitted" effect. The style rules ban them. We copy its pacing and its "one object becomes the next" logic instead.

---

<inputs>
Use these defaults unless I replace them. Ask only for what is missing.
- Product: Devspace, a learning platform for tech aspirants. The mascot is Devy.
- Logo: `public/assets/logo.svg` (129x19, mark plus "Devspace" wordmark). Split the mark from the wordmark for the end card.
- Devy: **`all_devy.riv`** (founder-supplied, copied to `film/assets/devy/`) is the main mascot source. It's drawn frame by frame through `film/lib/rive-seek.js`; the timeline plan is in `film/BEAT_MAP.md`. The Lottie clips below are kept only where the .riv has no equivalent (the crown/medal `lesson-complete`):
  - `public/assets/animations/wave.lottie`: the real wave. 540x720, 5.04 s, 1000 fps timebase, 121 image frames. Used in `src/components/onboarding/index.jsx:509` and `:648`, and in `FirstLessonWelcome.jsx:38`.
  - `public/assets/animations/thinking.lottie`: 720x720, 24 fps, 121 frames. Used in onboarding while the route is building.
  - `public/assets/animations/lesson-complete.lottie`: 720x720, 24 fps, 121 frames (the crown/medal celebration).
  - `public/assets/animations/listening.lottie` and `devy-idle-loop.lottie` for holds.
  - The clip registry is `src/components/ui/DevyLottie.jsx`.
- Demo learner, kept the same all the way through:
  - Motivation: "I want to build a professional career"
  - Area: "AI & Automation"
  - Role: "Machine Learning Engineer"
  - Experience: "Complete beginner"
  - Daily time: one of the real `daily_time` options
- Devy's replies (real copy from `src/data/onboarding.js` `breakPrompts`):
  - "That's a strong reason to start."
  - "AI & Automation it is."
  - "Machine Learning Engineer it is."
  - "We'll start at your level."
  - "<time> a day. You've got this."
- Path ladder for `ml_engineer`: Python fundamentals, Math & statistics for ML, Core ML algorithms, Model training & evaluation, Deployment & MLOps.
- First lesson: "Writing Programs" (Python Foundations). The code lab is the real "Try the calculation" (`yearly_hours.py`): starter `hours_per_week = 40` and `weeks_per_year = 52`; the learner types `yearly_total = hours_per_week * weeks_per_year` and `print(yearly_total)`, which outputs `2080`.
- Avatars: DiceBear 9 via `src/lib/avatarStyles.js`, style `adventurer` (the Bronze default). Use 8 fixed seeds. Reuse the same seeds in the league and head-to-head scenes.
- Music: Mixkit #371 "Cat Walk" by Arulo. Measured at 130.00 BPM with the drop at 88.604 s; the film starts at 73.835 s of the track. See `film/BEAT_MAP.md`.
- End-card CTA: ask me for the URL and the button label. Until then the default is "Start learning".
</inputs>

<direction>
A 44 second product launch film, 1920x1080 at 60fps, 2D only, one continuous take. Every scene is made out of the previous one: nothing fades, blurs or cuts. Objects change shape instead:
- Text rises out of a mask line.
- An answer chip grows into Devy's reply bubble.
- The Continue button grows into the next screen.
- A path card becomes the lesson.
- The Run button's output becomes the XP number.
- Avatars collapse into league rows.
- The accent colour floods out of one object and later shrinks back into another.

The camera makes one move per scene on eased keyframes and never zooms in and out back to back.

Look:
- Canvas: warm white `#f5f5f2`.
- Film UI and type: black `#0e0e10`.
- One accent: brand blue → cyan (`#2350e6 → #19a9e6`, from the logo mark), used as a fill with white text on top. The drop flood is warm white washed with blue from the top: `#2350e6 → #3d7bf5 → #8fd3f2 → #f5efe6`. No neon green.
- Real product screens keep their own colours: Devy's artwork, the amber streak and XP colours, and the leaderboard tiers. They are product evidence, not film decoration.
- Font: Geist for all film type. Real UI recreations keep the app's own fonts (Rubik / Rethink Sans). The end-card product name may use a serif.

Banned: crossfades, blur-ins, 3D or perspective tilts, particles, glows (including an iridescent glow around the input), dark-mode screens, camera moves that reverse direction, holds longer than 1s (except the readable copy holds marked below, which are 1.2s at most), anything that looks like a template, invented metrics, reward amounts, user counts or testimonials.
</direction>

<structure>
130 BPM, 96 beats = 44.3 s (one beat = 0.4615 s). The song starts so that its drop lands on beat 32 (14.769 s). Film-beat timestamps are in `film/BEAT_MAP.md`.

Beats 0–6, brand (0–2.77 s):
- Warm white frame. A black pill draws itself, then springs open into the Devspace mark.
- The wordmark wipes out from behind it.
- "A learning platform for tech aspirants." rises word by word (88px Geist). On "tech aspirants" a blue→cyan fill wipes in first and the words rise inside it in white.
- Slow push in.

Beats 6–12, Meet Devy (2.77–5.54 s):
- The mark's dot (or the full mark) springs into a circle, and `wave.lottie` plays from frame 0 inside it. The circle is the mask Devy rises out of.
- "Meet Devy." rises beside him, then "Your learning guide." replaces it, rising out of the same mask line.
- The camera trucks right to bring the onboarding card into frame. One move.

Beats 12–32, onboarding: answer, then reply (5.54–14.77 s). Four quick question cards. Each is a 4–5 beat rhythm:
1. The real question title appears: "What brings you here?" / "Which area feels closest to what you want to do?" / "Which of these sounds most like you?" / "Where are you starting from?"
2. The cursor taps the chosen answer.
3. The chip fills with the blue accent on a spring.
4. The chip grows into Devy's speech bubble with the matching reply ("That's a strong reason to start." / "AI & Automation it is." / "Machine Learning Engineer it is." / "We'll start at your level."). The small wave Devy beside it changes to the `listening` clip.
5. The bubble shrinks into the next card's progress segment.

The camera pans one direction only (left to right) across the four cards. On beat 28, Continue is pressed, Devy switches to `thinking.lottie`, and "Building your route" types out on one fixed line.

Beat 32, the drop (14.77 s):
- Devy `launch`es off his platform. At take-off, a circle of the warm blue gradient floods out of the platform edge to edge in about 0.35 s and clears the farthest corner.
- The five ML path cards (Python fundamentals → … → Deployment & MLOps) burst out from the centre in a strip, each with its real illustration.
- The strip slides onto "Python fundamentals", which lifts with a "Your start" pill.
- Title over it: "Machine Learning Engineer it is."

Beats 36–52, learn (16.6–24.0 s):
- The gradient shrinks back into the lifted card. The card grows into the "Writing Programs" lesson page, with the segmented progress bar at the top.
- One multiple-choice check: tap, correct, and Devy's footer line "Exactly right." rises in.
- The Continue footer grows into the code lab. `yearly_hours.py` types on three fixed lines with a real keystroke rhythm.
- Run is pressed and the output panel prints `2080`.
- Hold for 1.2 s so it can be read.

Beats 52–64, accomplishment (24.0–29.5 s):
- The output panel opens into the real Lesson complete splash (XP is a separate number: 25).
- `lesson-complete.lottie` (crown/medal Devy) plays.
- The Total XP / Perfect / Time cards pop in on springs, one beat apart.
- The "Claim XP" pill presses, and its fill sweeps right into the 1-day streak screen: the lightning illustration, the weekday dots filling and the speech bubble.
- XP values and the streak count must come from one consistent fixture (see Build step 8). Never invent them.

Beats 64–80, compete (29.5–36.9 s). This is the founder's requested avatar moment. Beats 64–67 are a one-bar break in the track, and the bass returns on beat 68:
- The streak's weekday dots spring into 8 DiceBear `adventurer` avatars spread across the warm white canvas.
- A restrained repeated Devspace mark sits behind them as a tiled backdrop at 6% black.
- "Compete with friends in your league." rises in the centre.
- The avatars converge, and each one docks into a row of the real league leaderboard: standings, the learner's highlighted row and the season timer.
- The camera pushes down the list once. Two rows lift out and slide together into the head-to-head card (learner on the left, rival on the right).
- A short glimpse of the Private leagues "Create league" pill.
- No cash amounts. Use the real copy only: "Head-to-head never touches your official coins, rank, or rewards."

Beats 80–96, outro (36.9–44.3 s). The song fades out under this section:
- The "Create league" pill grows into the whole page while the camera pushes into it. It stays a pill until it reaches the edges, and its label grows to headline size, then slides out.
- On the black page, "Learn with y●●●●ur friends." rises word by word (92px, white on black). The "o" is four of the same avatars overlapping.
- The avatars shrink into a single dot, the dot becomes the Devspace mark, and the wordmark wipes out from behind it.
- "made with Devy" appears above it, and the CTA pill springs in below.
- Final hold of 1 s.
</structure>

<build>
1. Put everything in one HTML file, 1920x1080, at `film/devspace.html`. Every style is computed from time inside `seek(t)`: no CSS transitions, no timers, no state between frames.
2. The camera is one transform on a container, keyed `[time, zoom, x, y]` with eased segments and zoom interpolated in log space.
3. Springs are closed-form step responses for every pop and settle.
4. Every handoff between layers is a shared element:
   - The answer chip carries its label into Devy's bubble.
   - The gradient flood carries a copy of the Continue label.
   - The output panel opens into the Lesson complete page.
   - The avatars keep the same seeds from the canvas to the league rows to head-to-head to the "o".
5. Devy clips must be driven by time. Load the `.lottie` files with `@lottiefiles/dotlottie-web` (already a dependency through dotlottie-react) and in `seek(t)` call `setFrame()` on each player. Never use autoplay.
   - The wave has a 1000 fps timebase, so the frame is `(t - start) * 1000`.
   - The other clips run at 24 fps.
   - Wait for each player's `load` event before the first `seek()`.
   - If `setFrame` does not reproduce identical pixels on two runs, fall back to extracting the clip to a PNG sequence once and indexing it.
6. Rebuild the real screens, don't screenshot-paste them. Copy layout, copy text and colours from the source components:
   - `src/components/onboarding/index.jsx` and `GeneratingPath.jsx`
   - `src/components/paths/*`
   - `src/components/lesson/LessonView.jsx`, `LessonCodeEditor.jsx` and `LessonCompleteSequence.jsx`
   - `src/components/leaderboard/index.jsx`, `LeagueDashboard.jsx` and `PrivateLeagues.jsx`

   Show the light theme only.
7. Generate the avatars with `getAvatarDataUri('adventurer', seed)` from `src/lib/avatarStyles.js` in a small Node script that writes `film/assets/avatars/*.svg`. Do not hand-draw faces, and do not animate the faces themselves. Only their wrappers move.
8. Put all demo numbers in one fixture: `film/fixture.json` (XP, accuracy, time, streak, league rank and rival). Take them from a real local run of the lesson or from `scripts/gamification-sim.mjs`, and label the fixture as demo data.
9. Sound: a downloaded Mixkit SFX for every event:
   - a soft tick per chip tap
   - a pop for each Devy reply bubble
   - typing for "Building your route" and the code
   - an impact on the drop
   - a swoosh for the path strip
   - a click for Run
   - a success tone for Lesson complete
   - a coin or chime for Claim XP
   - a light pop per avatar landing
   - a whoosh as the pill fills the page
   - a sparkle on the mark

   Place each by its measured peak and loudnorm the final mix to -14 LUFS.
10. Render with Playwright: 8 subframes per frame blended with ffmpeg tmix, 60fps. Then step through every fast moment frame by frame and scan the whole video for single-frame pops.
</build>

<gotchas>
- 4 subframes leave ghost copies on fast moves, so use 8 and slow the move down.
- A flood must clear the farthest corner and take about 0.35s, or it reads as a flash.
- Set z-index on every layer, or a card floats over the flood.
- Never let the camera chase a wrapping text cursor: fixed lines only (this applies to "Building your route" and `yearly_hours.py`).
- Declare every variable before the first `seek()` runs.
- Devy is image-sequence Lottie (121 embedded PNG frames). Preload every clip, or the first frames render blank.
- `wave.lottie` is 540x720 portrait and the others are square. Normalise them by Devy's body size, not by the canvas, or he jumps in size between clips.
- Keep one Devy variant per scene. The crown/medal version only appears at Lesson complete.
- Accent fills carry white text; never put the light end of the gradient behind white text.
- Do not invent copy. Every Devy line and question title must match `src/data/onboarding.js` and `src/components/onboarding/index.jsx` (`COPY`). Marketing lines (brand, "Meet Devy", "Compete with friends…", "Learn with y●ur friends") are the only new text.
</gotchas>

<start>
Ask me for any missing inputs (the CTA URL and label, a preferred track). Then show me the beat map with exact timestamps from the analysed track and 4 stills (Meet Devy, the drop, Lesson complete, the avatar "o" outro) before you write the full film.
</start>
