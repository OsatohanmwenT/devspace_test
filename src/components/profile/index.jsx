import { useState } from 'react'
import { ArrowLeftIcon, BookOpenIcon, BoltIcon, ChecklistIcon, CheckIcon, EyeIcon, InfoIcon, ShareIcon, TrophyIcon } from '../ui/icons'
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

const RULE = 'bg-[#333336] [[data-theme=light]_&]:bg-[#e6e6e2]'
const HAIRLINE = 'border-[#333336] [[data-theme=light]_&]:border-[#e6e6e2]'
const INK = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
// Softening these greys for the premium pass dropped them to 4.19:1 (dark)
// and 2.81:1 (light) at 12px. Dates and field labels are content, not
// decoration, so they hold AA: 4.74:1 and 4.55:1 respectively.
const FAINT = 'text-[#86868a] [[data-theme=light]_&]:text-[#767674]'
const SURFACE = 'border border-[#333336] [[data-theme=light]_&]:border-[#e6e6e2] bg-[#1b1b1d] [[data-theme=light]_&]:bg-white'

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

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function LayersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m3 13 9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.35-9.5-8.5C.5 8 2 4.5 5.5 4.5 8 4.5 9.5 6 12 8.5c2.5-2.5 4-4 6.5-4 3.5 0 5 3.5 3 7-2.5 4.15-9.5 8.5-9.5 8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function BarChartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 20V12M11 20V6M17 20v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function TrendingUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m3 17 6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FlagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 4h11l-3 4 3 4H6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

// The eyebrow-and-rule header is the streak journey drawer's idiom, borrowed
// here on purpose: a section label should recede and let the record itself
// carry the page, which is also what makes a document read as considered
// rather than as a stack of equally loud dashboard cards. The icon badge is
// the one repeated spot of color — enough to keep eleven grey cards from
// blurring together, not enough to compete with the record itself.
// `plain` is the public-view treatment: a monospace "// Label" caption in
// place of the icon-badge eyebrow, so a shared visitor's page reads as a
// document being read over someone's shoulder rather than the learner's own
// app chrome — the icon badges and uppercase eyebrows are workspace furniture,
// not part of what's being shown off.
function SectionCard({ title, icon: Icon, children, className = '', plain = false }) {
  if (plain) {
    return (
      <section className={`grid gap-3 ${className}`}>
        <p className={`m-0 font-mono text-[12px] tracking-wide ${FAINT}`}>// {title}</p>
        <div className={`grid gap-5 rounded-2xl ${SURFACE} p-6 max-[480px]:p-5`}>{children}</div>
      </section>
    )
  }

  return (
    <section className={`grid gap-5 rounded-2xl ${SURFACE} p-7 shadow-[0_1px_2px_rgba(0,0,0,.24),0_8px_20px_-14px_rgba(0,0,0,.4)] [[data-theme=light]_&]:shadow-[0_1px_2px_rgba(20,20,20,.04),0_8px_20px_-14px_rgba(20,20,20,.12)] max-[480px]:p-5 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid size-7 flex-none place-items-center rounded-lg bg-[#1c2a4d] text-[#88bdf2] [[data-theme=light]_&]:bg-[#f0f5fd] [[data-theme=light]_&]:text-[#2563eb]" aria-hidden="true">
            <Icon className="size-[15px]" />
          </span>
        )}
        <h2 className={`m-0 text-[11px] font-bold uppercase tracking-[.09em] ${MUTED}`}>{title}</h2>
        <span className={`h-px flex-1 ${RULE}`} />
      </div>
      {children}
    </section>
  )
}

function Chip({ children }) {
  return (
    <span className={`inline-flex rounded-md bg-[#262629] [[data-theme=light]_&]:bg-[#f4f4f1] px-2.5 py-1.5 text-[13px] ${INK}`}>
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
          <p className="m-0 max-w-[62ch] pt-2 text-[14px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
            {region.summary}
          </p>
        )}
        {bullets.length > 0 && (
          <ul className="m-0 grid list-none gap-1.5 p-0 pt-2.5">
            {bullets.map((goal) => (
              <li key={goal} className="flex gap-2.5 text-[14px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
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
            ? 'bg-amber-400 text-amber-950 shadow-[0_0_0_3px_rgba(245,166,35,.18)]'
            : `border ${HAIRLINE} bg-[#212124] [[data-theme=light]_&]:bg-[#f4f4f1] ${FAINT}`
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
          complete ? 'bg-[#6699ec] text-white' : `border ${HAIRLINE}`
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
export default function ProfileView({ profile, progress, currentPath, pathProgress, onEditProfile, isPublicView: isPublicViewProp, onTogglePublicView }) {
  // Falls back to local state so the toggle still works if a caller doesn't
  // wire it up — the account menu's "Public profile" entry is the one that does.
  const [localPublicView, setLocalPublicView] = useState(false)
  const isPublicView = isPublicViewProp ?? localPublicView
  const setIsPublicView = onTogglePublicView ?? setLocalPublicView
  const [linkCopied, setLinkCopied] = useState(false)
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

  const shareUrl = `devspace.dev/u/${identity?.name?.trim() ? identity.name.trim().toLowerCase().replace(/\s+/g, '-') : 'learner'}`

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shareUrl}`)
    } catch {
      // Clipboard access can be denied; the visible URL below is the fallback.
    }
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1800)
  }

  return (
    <div className="grid gap-5" aria-label="Profile">
      {/* Toggling in-place rather than routing keeps this the same record the
          learner already sees — a public visitor just gets the trimmed view. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isPublicView ? (
          <button
            type="button"
            onClick={() => setIsPublicView(false)}
            className={`flex items-center gap-1.5 border-0 bg-transparent px-0 text-[13px] font-medium ${MUTED} hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700`}
          >
            <ArrowLeftIcon className="size-4" /> Back to your profile
          </button>
        ) : <span />}

        <div className="flex items-center gap-2">
          {isPublicView && (
            <span className={`flex items-center gap-1.5 rounded-full border ${HAIRLINE} bg-[#1b1b1d] [[data-theme=light]_&]:bg-white px-3 py-1.5 text-[12px] font-medium ${MUTED}`}>
              <EyeIcon className="size-3.5" /> Public view
            </span>
          )}
          <ActionButton
            variant={isPublicView ? 'primary' : 'neutral'}
            className="min-h-9 text-[13px]"
            onClick={isPublicView ? handleShare : () => setIsPublicView(true)}
          >
            {isPublicView ? (
              <span className="flex items-center gap-1.5"><ShareIcon className="size-4" /> {linkCopied ? 'Link copied' : 'Share profile'}</span>
            ) : (
              <span className="flex items-center gap-1.5"><EyeIcon className="size-4" /> Preview public profile</span>
            )}
          </ActionButton>
        </div>
      </div>

      {isPublicView && (
        <p className={`m-0 -mt-2 text-[12px] ${FAINT}`}>{shareUrl} · this is what others see when you share your profile</p>
      )}

    {isPublicView ? (
      <div className="grid w-full max-w-[820px] gap-6 mx-auto">
        {/* A breadcrumb and a name, not an avatar and a level meter — the
            game layer (XP, streaks-as-progress, level badges) is the
            learner's own dashboard furniture, not what they're showing off. */}
        <header className={`overflow-hidden rounded-2xl ${SURFACE}`}>
          <div className={`border-b px-6 py-2.5 ${HAIRLINE} bg-black/[.15] [[data-theme=light]_&]:bg-[#f7f7f4]`}>
            <span className={`font-mono text-[11px] tracking-wide ${FAINT}`}>devspace.dev / learner</span>
          </div>
          <div className="grid gap-2 px-7 py-6 max-[480px]:px-5">
            <h1 className={`m-0 font-rethink-sans text-[30px] font-medium leading-[1.1] tracking-[-.025em] ${INK}`}>Learner</h1>
            <p className="m-0 text-[15px] font-medium text-[#8f97f2] [[data-theme=light]_&]:text-[#4338ca]">
              Aspiring {roleLabel}{branchLabel ? <span className={FAINT}> · {branchLabel}</span> : null}
            </p>
            {about && (
              <p className={`m-0 max-w-[64ch] pt-1 text-[14px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]`}>
                {about}
              </p>
            )}
          </div>
        </header>

        {experienceRegions.length === 0 ? (
          <SectionCard title="Experience" plain>
            <p className={`m-0 max-w-[60ch] text-[14px] leading-[1.7] ${MUTED}`}>
              Nothing here yet. Finish a lesson and the region it belongs to appears as an
              entry, with the dates you worked through it and what it demonstrates.
            </p>
          </SectionCard>
        ) : (
          <SectionCard title="Experience" plain>
            <ol className="m-0 grid list-none gap-8 p-0">
              {experienceRegions.map((region) => (
                <ExperienceEntry key={region.id ?? region.title} region={region} pathTitle={currentPath?.title ?? ''} />
              ))}
            </ol>
          </SectionCard>
        )}

        {certifications.length > 0 && (
          <SectionCard title="Achievements" plain>
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
          <SectionCard title="Skills" plain>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => <Chip key={skill}>{skill}</Chip>)}
            </div>
          </SectionCard>
        )}

        {currentPath && (
          <SectionCard title="Education" plain>
            <div className={DATED_ROW}>
              <DateCell>{joinedYear ? `${joinedYear} – Present` : 'Present'}</DateCell>
              <div className="grid gap-1.5">
                <h3 className={`m-0 text-[15px] font-semibold tracking-[-.01em] ${INK}`}>{currentPath.title}</h3>
                <p className={`m-0 text-[13px] ${MUTED}`}>Devspace · {currentPath.level ?? 'Career path'}</p>
                <p className={`m-0 text-[12px] tabular-nums ${FAINT}`}>
                  {verifiedLessons} of {pathProgress?.lessonsTotal ?? 0} lessons · {certifications.length} of {pathProgress?.checkpointsTotal ?? 0} checkpoints
                </p>
                {startingPointLabel && (
                  <p className={`m-0 pt-2 text-[14px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]`}>
                    Placed at {startingPointLabel}.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {(interestLabels.length > 0 || needLabels.length > 0) && (
          <SectionCard title="Interests" plain>
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

        <div className="grid grid-cols-2 gap-6 max-[680px]:grid-cols-1">
          <SectionCard title="Learning record" plain>
            <dl className="m-0 grid gap-3">
              {record.map((item, index) => (
                <RecordRow key={item.label} label={item.label} value={item.value} isLast={index === record.length - 1} />
              ))}
            </dl>
          </SectionCard>

          {league && (
            <SectionCard title="Standing" plain>
              <div className="flex items-center gap-3">
                <TierMedal league={league} state="current" size={44} />
                <div className="grid gap-0.5">
                  <span className={`text-[15px] font-medium ${INK}`}>{league.name}</span>
                  <span className={`text-[13px] tabular-nums ${MUTED}`}>{weeklyXp} XP this week</span>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <SectionCard title="Streak badges" plain>
          <div className="grid grid-cols-6 gap-3 max-[560px]:grid-cols-3">
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
      </div>
    ) : (
    <div className="grid grid-cols-[minmax(0,1fr)_312px] items-start gap-5 max-[900px]:grid-cols-1">
      <section className="grid gap-5">
        <header className={`grid overflow-hidden rounded-2xl ${SURFACE} shadow-[0_1px_2px_rgba(0,0,0,.24),0_8px_20px_-14px_rgba(0,0,0,.4)] [[data-theme=light]_&]:shadow-[0_1px_2px_rgba(20,20,20,.04),0_8px_20px_-14px_rgba(20,20,20,.12)]`}>
          {/* A fine diagonal rule field rather than a soft gradient wash —
              closer to engraved stationery than to a hero banner. */}
          <div
            className="h-28 bg-[#6699ec]/12 [[data-theme=light]_&]:bg-[#6699ec]/8"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(102, 153, 236,.16) 0 1px, transparent 1px 9px)',
            }}
            aria-hidden="true"
          />
          <div className="grid gap-5 px-7 pb-7 max-[480px]:px-5 max-[480px]:pb-5">
            <div className="relative -mt-11 w-[88px]">
              <span
                className="grid size-[88px] place-items-center rounded-full bg-[#6699ec] font-rethink-sans text-[34px] font-medium text-white ring-4 ring-[#1b1b1d] [[data-theme=light]_&]:ring-white"
                aria-hidden="true"
              >
                L
              </span>
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-950 ring-4 ring-[#1b1b1d] [[data-theme=light]_&]:ring-white"
                aria-hidden="true"
              >
                LV {levelInfo.level}
              </span>
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)]">Level {levelInfo.level}</span>
            </div>

            <div className="grid gap-1.5">
              <h1 className={`m-0 font-rethink-sans text-[30px] font-medium leading-[1.1] tracking-[-.025em] ${INK}`}>
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
              <div className={`h-2 w-full overflow-hidden rounded-full bg-[#262629] [[data-theme=light]_&]:bg-[#f0f0ed]`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6699ec] to-[#2563eb] transition-[width] duration-500 ease-out"
                  style={{ width: `${levelInfo.percent}%` }}
                />
              </div>
            </div>

            {onEditProfile && (
              <div className="flex flex-wrap gap-2">
                <ActionButton variant="neutral" className="min-h-9 text-[13px]" onClick={onEditProfile}>
                  Edit profile
                </ActionButton>
              </div>
            )}
          </div>
        </header>

        {about && (
          <SectionCard title="About" icon={InfoIcon}>
            <p className={`m-0 max-w-[68ch] text-[14px] leading-[1.75] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]`}>
              {about}
            </p>
          </SectionCard>
        )}

        {experienceRegions.length === 0 ? (
          <SectionCard title="Experience" icon={BriefcaseIcon}>
            <p className={`m-0 max-w-[60ch] text-[14px] leading-[1.7] ${MUTED}`}>
              Nothing here yet. Finish a lesson and the region it belongs to appears as an
              entry, with the dates you worked through it and what it demonstrates.
            </p>
          </SectionCard>
        ) : (
          <SectionCard title="Experience" icon={BriefcaseIcon}>
            <ol className="m-0 grid list-none gap-8 p-0">
              {experienceRegions.map((region) => (
                <ExperienceEntry key={region.id ?? region.title} region={region} pathTitle={currentPath?.title ?? ''} />
              ))}
            </ol>
          </SectionCard>
        )}

        {certifications.length > 0 && (
          <SectionCard title="Achievements" icon={TrophyIcon}>
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
          <SectionCard title="Skills" icon={LayersIcon}>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => <Chip key={skill}>{skill}</Chip>)}
            </div>
          </SectionCard>
        )}

        {currentPath && (
          <SectionCard title="Education" icon={BookOpenIcon}>
            <div className={DATED_ROW}>
              <DateCell>{joinedYear ? `${joinedYear} – Present` : 'Present'}</DateCell>
              <div className="grid gap-1.5">
                <h3 className={`m-0 text-[15px] font-semibold tracking-[-.01em] ${INK}`}>{currentPath.title}</h3>
                <p className={`m-0 text-[13px] ${MUTED}`}>Devspace · {currentPath.level ?? 'Career path'}</p>
                <p className={`m-0 text-[12px] tabular-nums ${FAINT}`}>
                  {verifiedLessons} of {pathProgress?.lessonsTotal ?? 0} lessons · {certifications.length} of {pathProgress?.checkpointsTotal ?? 0} checkpoints
                </p>
                {startingPointLabel && (
                  <p className={`m-0 pt-2 text-[14px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]`}>
                    Placed at {startingPointLabel}.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {(interestLabels.length > 0 || needLabels.length > 0) && (
          <SectionCard title="Interests" icon={HeartIcon}>
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
        <SectionCard title="Learning record" icon={BarChartIcon}>
          <dl className="m-0 grid gap-3">
            {record.map((item, index) => (
              <RecordRow key={item.label} label={item.label} value={item.value} isLast={index === record.length - 1} />
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Streak badges" icon={BoltIcon}>
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
          <SectionCard title="Standing" icon={TrendingUpIcon}>
            <div className="flex items-center gap-3">
              <TierMedal league={league} state="current" size={44} />
              <div className="grid gap-0.5">
                <span className={`text-[15px] font-medium ${INK}`}>{league.name}</span>
                <span className={`text-[13px] tabular-nums ${MUTED}`}>{weeklyXp} XP this week</span>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Profile quests" icon={ChecklistIcon}>
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
          <SectionCard title="Next checkpoint" icon={FlagIcon}>
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
    )}
    </div>
  )
}
