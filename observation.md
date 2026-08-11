# Observations

_Working record of discoveries and open questions. This is not a build specification; promote only validated decisions into the product direction._

## 2026-08-11 - The streak must make knowledge growth visible

### Core observation

A durable learning streak is evidence that the learner's knowledge has not stood still. It is not primarily a counter for daily activity, XP, path position, or generic progress.

- Snapchat streaks make a reciprocal relationship visible: both people keep choosing the connection.
- In DevSpace, the comparable value is visible learning development: "I know more, understand more deeply, or can do more than I could yesterday."
- Breaking the streak matters because it interrupts that daily learning continuity. The learner's accumulated knowledge and completed work must not disappear when the run pauses.

### Product implication for DevSpace

The system should answer: "What do I know now that I did not know, or could not do confidently, yesterday?" A qualifying day should make new, strengthened, or applied knowledge visible, not merely record app attendance.

Potential evidence, once a real learning-evidence model exists:

- Learn a new concept through a completed lesson.
- Demonstrate or reinforce understanding through a meaningful practice result.
- Apply knowledge in a Build milestone.
- Confirm a capability through an assessment checkpoint.

Repeated or zero-value activity should not preserve a streak merely because it occurred on a new day.

### Current-system assessment

The current implementation has a strong continuity layer:

- Current streak, longest streak, activity history, at-risk status, countdown, restores, and shields are present.
- The streak is visible in the header, Home, and its journey drawer.

It does not yet have the learning-evidence layer:

- The rule is "finish a lesson or practice round," not visible knowledge growth.
- `applyActivity` advances the streak for every recorded activity, including a practice replay worth zero XP.
- The streak does not tell the learner what knowledge was gained, strengthened, or applied today.
- Leagues provide comparison through weekly XP, but there is no social recognition around a learner's knowledge growth.
- Restores currently reward protection of the counter itself, making the reward loop self-referential.

### Design principle

Frame the streak as continuity of learning, never as the learner's accumulated knowledge:

> A missed day pauses the run; it does not erase the knowledge or capability already built.

Once the learning-evidence unit is defined, the interface can communicate it plainly:

> You strengthened your understanding of variables today.
>
> Your learning streak continues.

### Open questions

1. Which learning outcomes count as new knowledge, strengthened knowledge, or applied knowledge?
2. What quality threshold prevents empty streak preservation while allowing legitimate revision and practice?
3. How should the product show a learner what changed in their knowledge today?
4. Where should that evidence be visible across Home, lessons, Practice, Build, assessment, profile, and notifications?
5. What social mechanism, if any, can recognise learning growth without turning learning into empty competition?
