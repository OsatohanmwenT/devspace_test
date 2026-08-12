import { CheckIcon } from '../ui/icons'
import { ActionButton } from '../ui/ActionButton'
import {
  roleOptions,
  BRANCHES,
  projectInterestOptions,
  motivationOptions,
  experienceOptions,
  immediateNeedOptions,
  startingPointOptions,
} from '../../data/onboarding'
import { explorePaths } from '../../data/paths'
import { getLeague } from '../../data/leagues'
import { STREAK_MILESTONES } from '../../lib/streak'
import { getProfileProgress, normalizeProfile } from '../../lib/profile'
import { TierMedal } from '../leaderboard/TierMedal'

const labelMap = (options) => Object.fromEntries(options.map((option) => [option.value, option.label]))

const ROLE_LABELS = labelMap(Object.values(roleOptions).flat())
const BRANCH_LABELS = labelMap(BRANCHES)
const INTEREST_LABELS = labelMap(projectInterestOptions)
const MOTIVATION_LABELS = labelMap(motivationOptions)
const EXPERIENCE_LABELS = labelMap(experienceOptions)
const NEED_LABELS = labelMap(immediateNeedOptions)
// Keyed by role, since each role ladders through its own starting points.
const STARTING_POINT_LABELS = Object.fromEntries(
  Object.entries(startingPointOptions).map(([role, options]) => [role, labelMap(options)]),
)

const RULE = 'bg-[var(--border-hairline)]'
const HAIRLINE = 'border-[var(--border-hairline)]'
const INK = 'text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]'
const MUTED = 'text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]'
// Softening these greys for the premium pass dropped them to 4.19:1 (dark)
// and 2.81:1 (light) at 12px. Dates and field labels are content, not
// decoration, so they hold AA: 4.74:1 and 4.55:1 respectively.
const FAINT = 'text-[var(--text-secondary)]'
const SURFACE = 'border border-[var(--border-hairline)] bg-[var(--surface-default)]'

// XP levels escalate so early levels arrive quickly and later ones mean
// something — the same reasoning behind the streak milestone spacing.
const LEVEL_THRESHOLDS = [0, 50, 150, 350, 700, 1200, 2000, 3200, 5000]

export function getLevel(xp = 0) {
  const index = LEVEL_THRESHOLDS.filter((threshold) => xp >= threshold).length
  const level = Math.max(1, index)
  const floor = LEVEL_THRESHOLDS[level - 1] ?? 0
  const next = LEVEL_THRESHOLDS[level] ?? null
  // Floored so the bar never shows a full meter while XP is still owed.
  const percent = next === null ? 100 : Math.floor(((xp - floor) / (next - floor)) * 100)
  return { level, floor, next, percent, remaining: next === null ? 0 : next - xp }
}

function formatMonth(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatLongMonth(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// A CV entry states a period and what was demonstrated in it. The dates come
// from real lesson completions rather than the region's authored order, so an
// entry can only claim a range the learner actually worked through.
function regionDateRange(region) {
  const stamps = region.lessons
    .map((lesson) => lesson.completedAt)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)

  if (stamps.length === 0) return null
  const first = formatMonth(stamps[0].toDateString())
  const last = formatMonth(stamps[stamps.length - 1].toDateString())
  return first === last ? first : `${first} – ${last}`
}

// The eyebrow-and-rule header is the streak journey drawer's idiom, borrowed
// here on purpose: a section label should recede and let the record itself
// carry the page, which is also what makes a document read as considered
// rather than as a stack of equally loud dashboard cards.
function SectionCard({ title, children, className = '' }) {
  return (
    <section className={`grid gap-5 rounded-2xl ${SURFACE} p-7 max-[480px]:p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <h2 className={`m-0 text-[11px] font-bold uppercase tracking-[.09em] ${MUTED}`}>{title}</h2>
        <span className={`h-px flex-1 ${RULE}`} />
      </div>
      {children}
    </section>
  )
}

function Chip({ children }) {
  return (
    <span className={`inline-flex rounded-md bg-[var(--surface-subtle)] px-2.5 py-1.5 text-[13px] ${INK}`}>
      {children}
    </span>
  )
}

// Dates own a column of their own — the résumé convention, and the thing that
// lets the eye scan a career by period rather than by reading every entry.
const DATED_ROW = 'grid grid-cols-[124px_minmax(0,1fr)] gap-6 max-[620px]:grid-cols-1 max-[620px]:gap-1'

function DateCell({ children }) {
  return <span className={`text-[12px] leading-[1.5] tabular-nums ${FAINT} max-[620px]:order-2`}>{children}</span>
}

function ExperienceEntry({ region, pathTitle }) {
  const range = regionDateRange(region)
  const isComplete = region.state === 'completed'
  const bullets = (region.goals ?? []).slice(0, 4)

  return (
    <li className={DATED_ROW}>
      <DateCell>{range ?? 'In progress'}</DateCell>
      <div className="grid gap-1.5">
        <h3 className={`m-0 text-[15px] font-semibold tracking-[-.01em] ${INK}`}>{region.title}</h3>
        <p className={`m-0 text-[13px] ${MUTED}`}>
          {pathTitle} · {isComplete ? 'Completed' : 'In progress'}
        </p>
        <p className={`m-0 text-[12px] tabular-nums ${FAINT}`}>
          {region.lessonsCompleted} of {region.lessonsTotal} lessons
          {region.checkpointsTotal > 0 ? `  ·  ${region.checkpointsTotal} checkpoint${region.checkpointsTotal === 1 ? '' : 's'}` : ''}
        </p>
        {region.summary && (
          <p className="m-0 max-w-[62ch] pt-2 text-[14px] leading-[1.65] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
            {region.summary}
          </p>
        )}
        {bullets.length > 0 && (
          <ul className="m-0 grid list-none gap-1.5 p-0 pt-2.5">
            {bullets.map((goal) => (
              <li key={goal} className="flex gap-2.5 text-[14px] leading-[1.55] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
                <span className={`mt-[9px] size-1 flex-none rounded-full ${RULE}`} aria-hidden="true" />
                {goal}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

// Earned badges keep the streak's amber; locked ones recede to the hairline
// palette so the wall reads as a collection with gaps, not a list of failures.
function StreakBadge({ tier, earned, current }) {
  return (
    <div className="grid justify-items-center gap-1.5" title={tier.label}>
      <span
        className={`grid size-12 place-items-center rounded-xl text-[13px] font-bold tabular-nums ${
          earned
            ? 'bg-[var(--accent-progress)] text-[var(--surface-canvas)]'
            : `border ${HAIRLINE} bg-[var(--surface-subtle)] ${FAINT}`
        }`}
        aria-hidden="true"
      >
        {tier.days}
      </span>
      <span className={`text-center text-[11px] leading-[1.3] ${earned ? MUTED : FAINT}`}>
        {earned ? tier.label : current > 0 ? `${tier.days - current} to go` : `${tier.days} days`}
      </span>
    </div>
  )
}

function QuestRow({ label, complete }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`grid size-5 flex-none place-items-center rounded-full ${
          complete ? 'bg-[var(--brand-cta)] text-white' : `border ${HAIRLINE}`
        }`}
        aria-hidden="true"
      >
        {complete && <CheckIcon className="size-3" />}
      </span>
      <span className={`text-[13px] ${complete ? `line-through ${FAINT}` : INK}`}>{label}</span>
    </li>
  )
}

function RecordRow({ label, value, isLast }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${isLast ? '' : `border-b ${HAIRLINE} pb-3`}`}>
      <dt className={`text-[13px] ${MUTED}`}>{label}</dt>
      <dd className={`m-0 text-[14px] font-semibold tabular-nums tracking-[-.01em] ${INK}`}>{value}</dd>
    </div>
  )
}

// A CV, not a dashboard: what this learner has covered, what it demonstrates,
// and when — sourced entirely from existing onboarding answers and real
// lesson-completion records rather than any new stored field.
export default function ProfileView({ profile, progress, currentPath, pathProgress, onEditProfile }) {
  const { xp, weeklyXp, streakDays, longestStreak, leagueIndex, earnedStreakMilestones } = progress
  const league = getLeague(leagueIndex)
  const levelInfo = getLevel(xp)
  const earnedTiers = earnedStreakMilestones ?? []
  const identity = normalizeProfile(profile)
  const roleLabel = ROLE_LABELS[profile?.role] ?? 'Learner'
  const branchLabel = BRANCH_LABELS[profile?.branch]
  const motivationLabel = MOTIVATION_LABELS[profile?.motivation]
  const experienceLabel = EXPERIENCE_LABELS[profile?.experience]
  const interestLabels = (profile?.projectInterest ?? []).map((value) => INTEREST_LABELS[value]).filter(Boolean)
  const needLabels = (profile?.immediateNeed ?? []).map((value) => NEED_LABELS[value]).filter(Boolean)
  const joinedDate = formatLongMonth(profile?.completedAt)
  const joinedYear = profile?.completedAt ? new Date(profile.completedAt).getFullYear() : null
  const startingPointLabel = STARTING_POINT_LABELS[profile?.role]?.[profile?.startingPoint]

  // `derivePathProgress` unions authored `state: 'completed'` seed data with
  // real completions, which places a new learner partway along the spine. On
  // Home that seeding is a harmless nudge; here it would have the CV assert
  // lessons and a passed checkpoint that never happened. This page counts
  // only what has a stored completion record of its own.
  const completedLessons = progress.completedLessons ?? {}
  const isVerified = (lesson) => Boolean(completedLessons[lesson.id])

  const authoredRegions = (pathProgress?.regions ?? [])
    .filter((region) => region.hasAuthoredContent)
    .map((region) => {
      const verified = region.lessons.filter(isVerified)
      return {
        ...region,
        lessonsCompleted: verified.length,
        state: verified.length === region.lessonsTotal && region.lessonsTotal > 0 ? 'completed' : 'current',
      }
    })

  // A CV lists work done, not work available. Only regions with real
  // completions earn an entry; locked material is not experience.
  const experienceRegions = authoredRegions.filter((region) => region.lessonsCompleted > 0)
  const verifiedLessons = authoredRegions.reduce((total, region) => total + region.lessonsCompleted, 0)
  // Skill chips are named technologies, not sentences — the region's `goals`
  // are full outcome statements, which read as CV bullets under Experience
  // but not as a skills list. The path's tool tags are the closest thing the
  // data has to named, claimable skills.
  const pathTools = explorePaths.find((entry) => entry.id === currentPath?.id)?.tools ?? []
  const coveredAreas = experienceRegions.map((region) => region.title)
  const skills = [...new Set([...pathTools, ...coveredAreas])]
  const certifications = authoredRegions.flatMap((region) =>
    region.lessons
      .filter((lesson) => lesson.isCheckpoint && isVerified(lesson))
      .map((lesson) => ({ ...lesson, completedAt: completedLessons[lesson.id].completedAt, regionTitle: region.title })),
  )

  const about = [
    motivationLabel ? `${motivationLabel}.` : null,
    experienceLabel ? `Starting from: ${experienceLabel.toLowerCase()}.` : null,
    currentPath ? `Currently working through the ${currentPath.title} path toward ${roleLabel}.` : null,
    profile?.dailyMinutes ? `Committed to ${profile.dailyMinutes} minutes of practice a day.` : null,
  ].filter(Boolean).join(' ')

  const profileQuests = getProfileProgress(identity, { lessonsCompleted: verifiedLessons })

  const record = [
    { label: 'Lessons completed', value: `${verifiedLessons} / ${pathProgress?.lessonsTotal ?? 0}` },
    { label: 'Checkpoints passed', value: `${certifications.length} / ${pathProgress?.checkpointsTotal ?? 0}` },
    { label: 'Total XP', value: `${xp}` },
    { label: 'Longest streak', value: `${longestStreak} days` },
  ]

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_312px] items-start gap-5 max-[900px]:grid-cols-1" aria-label="Profile">
      <section className="grid gap-5">
        <header className={`grid overflow-hidden rounded-2xl ${SURFACE}`}>
          <div className="h-28 bg-[var(--surface-brand-tint)]" aria-hidden="true" />
          <div className="grid gap-5 px-7 pb-7 max-[480px]:px-5 max-[480px]:pb-5">
            <div className="relative -mt-11 w-[88px]">
              <span
                className="grid size-[88px] place-items-center rounded-full bg-[var(--brand-cta)] font-['Rethink_Sans',Arial,sans-serif] text-[34px] font-medium text-white ring-4 ring-[var(--surface-default)] [[data-theme=light]_&]:ring-white"
                aria-hidden="true"
              >
                L
              </span>
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-950 ring-4 ring-[var(--surface-default)] [[data-theme=light]_&]:ring-white"
                aria-hidden="true"
              >
                LV {levelInfo.level}
              </span>
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)]">Level {levelInfo.level}</span>
            </div>

            <div className="grid gap-1.5">
              <h1 className={`m-0 font-['Rethink_Sans',Arial,sans-serif] text-[30px] font-medium leading-[1.1] tracking-[-.025em] ${INK}`}>
                Learner
              </h1>
              <p className={`m-0 text-[16px] leading-[1.45] ${INK}`}>
                Aspiring {roleLabel}
                {branchLabel ? <span className={FAINT}> · {branchLabel}</span> : null}
              </p>
              <p className={`m-0 pt-1 text-[13px] ${MUTED}`}>
                {currentPath ? `${currentPath.title} path` : 'No path selected'}
                {joinedDate ? ` · Joined ${joinedDate}` : ''}
              </p>
            </div>

            {/* The one meter on the page. Levels are the game layer; the
                résumé sections below stay bar-free so evidence still reads
                as evidence. */}
            <div className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-[12px] font-semibold uppercase tracking-[.07em] tabular-nums ${MUTED}`}>
                  {xp} XP
                </span>
                <span className={`text-[12px] tabular-nums ${FAINT}`}>
                  {levelInfo.next === null ? `${xp} XP · max level` : `${levelInfo.remaining} XP to level ${levelInfo.level + 1}`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--brand-cta)] transition-[width] duration-500 ease-out"
                  style={{ width: `${levelInfo.percent}%` }}
                />
              </div>
            </div>

            {onEditProfile && (
              <div className="flex flex-wrap gap-2">
                <ActionButton variant="secondary" className="text-[var(--type-label)]" onClick={onEditProfile}>
                  Edit profile
                </ActionButton>
              </div>
            )}
          </div>
        </header>

        {about && (
          <SectionCard title="About">
            <p className={`m-0 max-w-[68ch] text-[14px] leading-[1.75] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]`}>
              {about}
            </p>
          </SectionCard>
        )}

        {experienceRegions.length === 0 ? (
          <SectionCard title="Experience">
            <p className={`m-0 max-w-[60ch] text-[14px] leading-[1.7] ${MUTED}`}>
              Nothing here yet. Finish a lesson and the region it belongs to appears as an
              entry, with the dates you worked through it and what it demonstrates.
            </p>
          </SectionCard>
        ) : (
          <SectionCard title="Experience">
            <ol className="m-0 grid list-none gap-8 p-0">
              {experienceRegions.map((region) => (
                <ExperienceEntry key={region.id ?? region.title} region={region} pathTitle={currentPath?.title ?? ''} />
              ))}
            </ol>
          </SectionCard>
        )}

        {certifications.length > 0 && (
          <SectionCard title="Achievements">
            <ul className="m-0 grid list-none gap-5 p-0">
              {certifications.map((lesson) => (
                <li key={lesson.id} className={DATED_ROW}>
                  <DateCell>{formatMonth(lesson.completedAt) ?? ''}</DateCell>
                  <div className="grid min-w-0 gap-0.5">
                    <span className={`flex items-baseline gap-2 text-[14px] font-medium ${INK}`}>
                      <CheckIcon className="size-3.5 flex-none translate-y-[2px] text-amber-400" aria-hidden="true" />
                      {lesson.title}
                    </span>
                    <span className={`text-[12px] ${MUTED}`}>Checkpoint passed · {lesson.regionTitle}</span>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {skills.length > 0 && (
          <SectionCard title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => <Chip key={skill}>{skill}</Chip>)}
            </div>
          </SectionCard>
        )}

        {currentPath && (
          <SectionCard title="Education">
            <div className={DATED_ROW}>
              <DateCell>{joinedYear ? `${joinedYear} – Present` : 'Present'}</DateCell>
              <div className="grid gap-1.5">
                <h3 className={`m-0 text-[15px] font-semibold tracking-[-.01em] ${INK}`}>{currentPath.title}</h3>
                <p className={`m-0 text-[13px] ${MUTED}`}>Devspace · {currentPath.level ?? 'Career path'}</p>
                <p className={`m-0 text-[12px] tabular-nums ${FAINT}`}>
                  {verifiedLessons} of {pathProgress?.lessonsTotal ?? 0} lessons · {certifications.length} of {pathProgress?.checkpointsTotal ?? 0} checkpoints
                </p>
                {startingPointLabel && (
                  <p className={`m-0 pt-2 text-[14px] leading-[1.65] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]`}>
                    Placed at {startingPointLabel}.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {(interestLabels.length > 0 || needLabels.length > 0) && (
          <SectionCard title="Interests">
            <div className="grid gap-5">
              {interestLabels.length > 0 && (
                <div className="grid gap-2.5">
                  <span className={`text-[12px] ${FAINT}`}>Domains</span>
                  <div className="flex flex-wrap gap-1.5">
                    {interestLabels.map((label) => <Chip key={label}>{label}</Chip>)}
                  </div>
                </div>
              )}
              {needLabels.length > 0 && (
                <div className="grid gap-2.5">
                  <span className={`text-[12px] ${FAINT}`}>Focused on</span>
                  <div className="flex flex-wrap gap-1.5">
                    {needLabels.map((label) => <Chip key={label}>{label}</Chip>)}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </section>

      <aside className="grid gap-5">
        <SectionCard title="Learning record">
          <dl className="m-0 grid gap-3">
            {record.map((item, index) => (
              <RecordRow key={item.label} label={item.label} value={item.value} isLast={index === record.length - 1} />
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Streak badges">
          <div className="grid grid-cols-3 gap-3">
            {STREAK_MILESTONES.map((tier) => (
              <StreakBadge
                key={tier.days}
                tier={tier}
                earned={earnedTiers.includes(tier.days)}
                current={streakDays}
              />
            ))}
          </div>
        </SectionCard>

        {league && (
          <SectionCard title="Standing">
            <div className="flex items-center gap-3">
              <TierMedal league={league} state="current" size={44} />
              <div className="grid gap-0.5">
                <span className={`text-[15px] font-medium ${INK}`}>{league.name}</span>
                <span className={`text-[13px] tabular-nums ${MUTED}`}>{weeklyXp} XP this week</span>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Profile quests">
          <div className="grid gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-[13px] ${MUTED}`}>{profileQuests.percent}% complete</span>
              <span className={`text-[12px] tabular-nums ${FAINT}`}>
                {profileQuests.items.filter((item) => item.complete).length} / {profileQuests.items.length}
              </span>
            </div>
            <ul className="m-0 grid list-none gap-2.5 p-0">
              {profileQuests.items.map((item) => (
                <QuestRow key={item.label} label={item.label} complete={item.complete} />
              ))}
            </ul>
          </div>
        </SectionCard>

        {pathProgress?.nextCheckpoint && (
          <SectionCard title="Next checkpoint">
            <div className="grid gap-1">
              <span className={`text-[15px] font-medium ${INK}`}>{pathProgress.nextCheckpoint.lesson.title}</span>
              <span className={`text-[13px] ${MUTED}`}>
                {pathProgress.nextCheckpoint.lessonsUntil === 0
                  ? 'Up next'
                  : `${pathProgress.nextCheckpoint.lessonsUntil} lesson${pathProgress.nextCheckpoint.lessonsUntil === 1 ? '' : 's'} away`}
              </span>
            </div>
          </SectionCard>
        )}
      </aside>
    </div>
  )
}
