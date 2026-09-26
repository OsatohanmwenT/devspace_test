import { useState } from 'react'
import { ArrowLeftIcon, BookOpenIcon, BoltIcon, ChecklistIcon, CheckIcon, EyeIcon, InfoIcon, ShareIcon, SparkleIcon, TrophyIcon } from '../ui/icons'
import { ActionButton } from '../ui/ActionButton'
import {
  BRANCHES,
  projectInterestOptions,
  motivationOptions,
  experienceOptions,
  immediateNeedOptions,
  stackOptions,
  startingPointOptions,
} from '../../data/onboarding'
import { explorePaths } from '../../data/paths'
import { getLeague } from '../../data/leagues'
import { AVAILABILITY_OPTIONS, getDisplayUrl, getProfileLinks, getProfileProgress, getRoleLabel, normalizeProfile } from '../../lib/profile'
import { getBadges, getFeaturedBadges, toggleFeaturedBadge } from '../../lib/badges'
import { getAvatarDataUri } from '../../lib/avatarStyles'
import { TierMedal } from '../leaderboard/TierMedal'
import { EditProfileModal } from './EditProfileModal'
import { BadgesDrawer } from './BadgesDrawer'
import { BadgeCoin } from './BadgeCoin'
import { getBannerTheme, LinkIcon, ProfileBanner } from './profileTheme'
import { CoinIcon } from '../ui/GameIcon'

const labelMap = (options) => Object.fromEntries(options.map((option) => [option.value, option.label]))

const BRANCH_LABELS = labelMap(BRANCHES)
const INTEREST_LABELS = labelMap(projectInterestOptions)
const MOTIVATION_LABELS = labelMap(motivationOptions)
const EXPERIENCE_LABELS = labelMap(experienceOptions)
const NEED_LABELS = labelMap(immediateNeedOptions)
const STACK_LABELS = labelMap(Object.values(stackOptions).flat())
// Keyed by role, since each role ladders through its own starting points.
const STARTING_POINT_LABELS = Object.fromEntries(
  Object.entries(startingPointOptions).map(([role, options]) => [role, labelMap(options)]),
)

const RULE = 'bg-[#333336] [[data-theme=light]_&]:bg-[#e6e6e2]'
const HAIRLINE = 'border-[#333336] [[data-theme=light]_&]:border-[#e6e6e2]'
const INK = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
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

function regionDateRange(region) {
  const stamps = (region.lessons ?? [])
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

function SectionCard({ title, icon: Icon, action, children, className = '', plain = false }) {
  if (plain) {
    return (
      <section className={`grid gap-3.5 ${className}`}>
        <div className="flex items-center gap-2.5">
          <h2 className="m-0 font-rethink-sans text-[13px] font-bold uppercase tracking-[.08em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            {title}
          </h2>
          <span className={`h-px flex-1 ${RULE}`} />
          {action}
        </div>
        <div className={`grid gap-5 rounded-2xl ${SURFACE} p-6 max-[480px]:p-5 shadow-sm`}>{children}</div>
      </section>
    )
  }

  return (
    <section className={`grid gap-5 rounded-2xl ${SURFACE} p-7 shadow-[0_1px_2px_rgba(0,0,0,.24),0_8px_20px_-14px_rgba(0,0,0,.4)] [[data-theme=light]_&]:shadow-[0_1px_2px_rgba(20,20,20,.04),0_8px_20px_-14px_rgba(20,20,20,.12)] max-[480px]:p-5 ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="size-[17px] flex-none text-[var(--accent)]" />}
        <h2 className={`m-0 flex-1 font-rethink-sans text-[16px] font-semibold tracking-[-.01em] ${INK}`}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Chip({ children }) {
  return (
    <span className={`inline-flex rounded-md bg-[#262629] [[data-theme=light]_&]:bg-[#f4f4f1] px-2.5 py-1.5 text-[13px] font-medium ${INK}`}>
      {children}
    </span>
  )
}

const DATED_ROW = 'grid grid-cols-[124px_minmax(0,1fr)] gap-6 max-[620px]:grid-cols-1 max-[620px]:gap-1.5'

function DateCell({ children }) {
  return <span className={`text-[13px] font-medium leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] max-[620px]:order-2`}>{children}</span>
}

function ExperienceEntry({ region, pathTitle }) {
  const range = regionDateRange(region)
  const isComplete = region.state === 'completed'
  const bullets = (region.goals ?? []).slice(0, 4)

  return (
    <li className={DATED_ROW}>
      <DateCell>{range ?? 'In progress'}</DateCell>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={`m-0 text-[16px] font-semibold tracking-[-.01em] ${INK}`}>{region.title}</h3>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#168a46]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]">
                <CheckIcon className="size-3" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#2563eb]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]">
                In progress
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
          <span className={MUTED}>{pathTitle}</span>
          <span className={FAINT}>·</span>
          <span className={`tabular-nums ${FAINT}`}>
            {region.lessonsCompleted} of {region.lessonsTotal} module{region.lessonsTotal === 1 ? '' : 's'} completed
            {region.checkpointsTotal > 0 ? ` · ${region.checkpointsTotal} milestone${region.checkpointsTotal === 1 ? '' : 's'}` : ''}
          </span>
        </div>

        {region.summary && (
          <p className="m-0 max-w-[64ch] text-[14px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
            {region.summary}
          </p>
        )}

        {bullets.length > 0 && (
          <ul className="m-0 grid list-none gap-2 p-0 pt-1">
            {bullets.map((goal) => (
              <li key={goal} className="flex gap-2.5 text-[13.5px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
                <span className="mt-[8px] size-1.5 flex-none rounded-full bg-[var(--accent)]" aria-hidden="true" />
                {goal}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

function QuestRow({ label, complete }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`grid size-5 flex-none place-items-center rounded-full ${
          complete ? 'bg-[var(--accent)] text-white' : `border ${HAIRLINE}`
        }`}
        aria-hidden="true"
      >
        {complete && <CheckIcon className="size-3" />}
      </span>
      <span className={`text-[13px] ${complete ? `line-through ${FAINT}` : INK}`}>{label}</span>
    </li>
  )
}

const AVAILABILITY_LABELS = labelMap(AVAILABILITY_OPTIONS)
const QUIET_BUTTON = `inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold ${MUTED} hover:bg-[#262629] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:bg-[#f0f0ed] [[data-theme=light]_&]:hover:text-neutral-800`

function PencilIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L19 9a2.83 2.83 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ProfileAvatar({ identity, className }) {
  const name = identity?.name?.trim()
  if (identity?.photo) return <img src={identity.photo} alt="" aria-hidden="true" className={`object-cover ${className}`} />
  if (identity?.avatarStyle) {
    return <img src={getAvatarDataUri(identity.avatarStyle, name || 'you')} alt="" aria-hidden="true" className={`bg-[#262629] object-cover ${className}`} />
  }
  return (
    <span className={`grid place-items-center bg-[var(--accent)] font-rethink-sans font-medium text-white ${className}`} aria-hidden="true">
      {name ? name.charAt(0).toUpperCase() : 'L'}
    </span>
  )
}

// Phone and email are private until switched on, so the owner's contact card
// says which ones a visitor can see.
function VisibilityTag({ isPublic }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${isPublic ? 'bg-[#168a46]/15 text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]' : `bg-[#262629] [[data-theme=light]_&]:bg-[#f0f0ed] ${FAINT}`}`}>
      {isPublic ? 'Public' : 'Only you'}
    </span>
  )
}

// One hero for both audiences. The owner gets the edit button and XP bar; a
// visitor gets the verified stamp and only the contact details made public.
// Banner, badges and links are identical, so the visitor preview is honest.
function ProfileHero({ identity, theme, isPublic, shareUrl, headline, branchLabel, joinedDate, dailyMinutes, levelInfo, xp, stats, featuredBadges, links, onEdit, onOpenBadges }) {
  const name = identity?.name?.trim() || 'Learner'
  const contact = identity?.contact ?? {}
  const availability = AVAILABILITY_LABELS[identity?.availability]
  const website = links.find((link) => link.id === 'website')
  const iconLinks = links.filter((link) => link.id !== 'website')
  const showEmail = contact.email && (!isPublic || contact.showEmail)
  const showPhone = contact.phone && (!isPublic || contact.showPhone)
  const meta = [
    contact.location && { icon: 'location', label: contact.location },
    website && { icon: 'website', label: getDisplayUrl(website.url), href: website.url },
    joinedDate && { icon: 'calendar', label: `Joined ${joinedDate}` },
    dailyMinutes && { icon: 'bolt', label: `${dailyMinutes} min a day` },
  ].filter(Boolean)

  return (
    <header className={`grid overflow-hidden rounded-2xl ${SURFACE} shadow-[0_1px_2px_rgba(0,0,0,.24),0_8px_20px_-14px_rgba(0,0,0,.4)] [[data-theme=light]_&]:shadow-[0_1px_2px_rgba(20,20,20,.04),0_8px_20px_-14px_rgba(20,20,20,.12)]`}>
      <ProfileBanner theme={theme} image={identity?.bannerImage} className="h-40 max-[560px]:h-28">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
          {isPublic ? (
            <span className="truncate rounded-full bg-black/35 px-2.5 py-1 text-[11.5px] font-semibold text-white/90 backdrop-blur-md">{shareUrl}</span>
          ) : <span />}
          {isPublic ? (
            <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11.5px] font-semibold text-[#8ff0bd] backdrop-blur-md">
              <CheckIcon className="size-3" /> Verified by DevSpace
            </span>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-black/35 px-3.5 text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/50"
            >
              <PencilIcon className="size-3.5" /> Edit profile
            </button>
          )}
        </div>
      </ProfileBanner>

      <div className="grid gap-5 px-7 pb-6 max-[480px]:px-5 max-[480px]:pb-5">
        <div className="flex items-end justify-between gap-4">
          <div className="relative -mt-14 max-[560px]:-mt-11">
            <ProfileAvatar identity={identity} className="size-[108px] rounded-full text-[40px] ring-[5px] ring-[#1b1b1d] max-[560px]:size-[88px] max-[560px]:text-[34px] [[data-theme=light]_&]:ring-white" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[11px] font-bold text-white tabular-nums ring-4 ring-[#1b1b1d] [[data-theme=light]_&]:ring-white" aria-hidden="true">
              LV {levelInfo.level}
            </span>
            <span className="sr-only">Level {levelInfo.level}</span>
          </div>

          {featuredBadges.length > 0 && (
            <button type="button" onClick={onOpenBadges} className="group flex items-center rounded-full p-1" aria-label={`Featured badges: ${featuredBadges.map((badge) => badge.label).join(', ')}. See all badges`}>
              <span className="flex -space-x-2.5">
                {featuredBadges.map((badge) => (
                  <span key={badge.id} title={badge.label} className="rounded-full ring-[3px] ring-[#1b1b1d] transition-transform group-hover:-translate-y-0.5 [[data-theme=light]_&]:ring-white">
                    <BadgeCoin badge={badge} size={40} />
                  </span>
                ))}
              </span>
            </button>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h1 className={`m-0 font-rethink-sans text-[30px] font-semibold leading-[1.1] tracking-[-.025em] max-[480px]:text-[26px] ${INK}`}>{name}</h1>
            {identity?.pronouns && <span className={`text-[14px] ${FAINT}`}>{identity.pronouns}</span>}
          </div>
          <p className={`m-0 text-[16px] leading-[1.45] ${INK}`}>
            {headline}
            {branchLabel ? <span className={FAINT}> · {branchLabel}</span> : null}
          </p>
          {availability && (
            <span className="inline-flex items-center gap-2 justify-self-start rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/12 px-3 py-1 text-[12.5px] font-semibold text-[var(--accent)]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-50 motion-reduce:animate-none" />
                <span className="relative size-2 rounded-full bg-[var(--accent)]" />
              </span>
              {availability}
            </span>
          )}
          {meta.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 pt-1">
              {meta.map((item) => (
                <li key={item.label} className={`inline-flex min-w-0 items-center gap-1.5 text-[13px] ${MUTED}`}>
                  {item.icon === 'bolt' ? <BoltIcon className="size-3.5 flex-none" /> : <LinkIcon kind={item.icon} className="size-3.5 flex-none" />}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-[var(--accent)] hover:underline">{item.label}</a>
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {(iconLinks.length > 0 || showEmail || showPhone) && (
          <div className="flex flex-wrap items-center gap-2">
            {showEmail && (
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 text-[13px] font-semibold text-white transition-[filter] hover:brightness-110">
                <LinkIcon kind="email" className="size-4" /> Email me
              </a>
            )}
            {showPhone && (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className={`inline-flex min-h-9 items-center gap-2 rounded-lg border ${HAIRLINE} px-3 text-[13px] font-semibold ${INK} hover:border-[var(--accent)]`}>
                <LinkIcon kind="phone" className="size-4" /> {contact.phone}
              </a>
            )}
            {iconLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                className={`inline-flex min-h-9 items-center gap-2 rounded-lg border ${HAIRLINE} ${link.custom ? 'px-3' : 'w-9 justify-center'} text-[13px] font-semibold ${MUTED} transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]`}
              >
                <LinkIcon kind={link.custom ? 'link' : link.id} className="size-4 flex-none" />
                {link.custom ? <span className="max-w-[14ch] truncate">{link.label}</span> : <span className="sr-only">{link.label}</span>}
              </a>
            ))}
          </div>
        )}

        {!isPublic && (
          <div className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-[12px] font-semibold uppercase tracking-[.07em] tabular-nums ${MUTED}`}>{xp} XP</span>
              <span className={`text-[12px] tabular-nums ${FAINT}`}>
                {levelInfo.next === null ? 'Max level' : `${levelInfo.remaining} XP to level ${levelInfo.level + 1}`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#262629] [[data-theme=light]_&]:bg-[#f0f0ed]">
              <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out" style={{ width: `${levelInfo.percent}%` }} />
            </div>
          </div>
        )}

        <dl className={`m-0 grid grid-cols-4 border-t pt-4 ${HAIRLINE} max-[480px]:grid-cols-2 max-[480px]:gap-y-4`}>
          {stats.map((stat, index) => (
            <div key={stat.label} className={`flex flex-col gap-0.5 px-4 first:pl-0 max-[480px]:odd:pl-0 ${index > 0 ? `border-l ${HAIRLINE} max-[480px]:odd:border-l-0` : ''}`}>
              <dt className={`text-[12px] ${MUTED}`}>{stat.label}</dt>
              <dd className={`m-0 font-rethink-sans text-[22px] font-semibold tabular-nums tracking-[-.02em] ${INK}`}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}

// A slice of the collection: what's been earned, topped up with the badges
// closest to being earned, all as coins. The full set lives in the drawer.
function BadgeShelf({ badges, columns = 4, slots = 8, showLocked = true }) {
  const earned = badges.filter((badge) => badge.earned)
  const upcoming = showLocked
    ? badges.filter((badge) => !badge.earned).sort((a, b) => completion(b) - completion(a))
    : []
  const shown = [...earned.slice(-slots), ...upcoming].slice(0, slots)

  return (
    <ul className="m-0 grid list-none gap-x-2 gap-y-4 p-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {shown.map((badge) => (
        <li key={badge.id} className="grid justify-items-center gap-1.5 text-center" title={badge.earned ? badge.label : `${badge.label} — ${badge.description}`}>
          <BadgeCoin badge={badge} size={46} />
          <span className={`line-clamp-2 text-[11px] leading-[1.3] ${badge.earned ? MUTED : FAINT}`}>{badge.label}</span>
        </li>
      ))}
    </ul>
  )
}

const completion = (badge) => (badge.progress ? badge.progress.current / badge.progress.target : 0)

function nextBadge(badges) {
  return badges
    .filter((badge) => !badge.earned && badge.progress && badge.progress.current > 0)
    .sort((a, b) => completion(b) - completion(a))[0]
}

function ContactCard({ identity, links, onEdit }) {
  const contact = identity?.contact ?? {}
  const rows = [
    contact.email && { id: 'email', label: contact.email, href: `mailto:${contact.email}`, isPublic: contact.showEmail },
    contact.phone && { id: 'phone', label: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, isPublic: contact.showPhone },
    ...links.map((link) => ({ id: link.custom ? 'link' : link.id, key: link.id, label: link.custom ? link.label : getDisplayUrl(link.url), href: link.url, external: true })),
  ].filter(Boolean)

  return (
    <SectionCard
      title="Contact & links"
      icon={ChainIcon}
      action={rows.length > 0 && <button type="button" className={`${QUIET_BUTTON} -my-2 -mr-2`} onClick={onEdit}>Edit</button>}
    >
      {rows.length === 0 ? (
        <div className="grid gap-3">
          <p className={`m-0 text-[13.5px] leading-[1.6] ${MUTED}`}>Add your GitHub, portfolio and how to reach you — it's what turns a visit into a conversation.</p>
          <ActionButton variant="neutral" className="min-h-9 justify-self-start text-[13px]" onClick={onEdit}>Add links</ActionButton>
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-0.5 p-0">
          {rows.map((row) => (
            <li key={row.key ?? row.id}>
              <a
                href={row.href}
                {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`-mx-2 flex min-h-10 items-center gap-3 rounded-lg px-2 text-[13.5px] ${INK} hover:bg-[#262629] [[data-theme=light]_&]:hover:bg-[#f4f4f1]`}
              >
                <span className="grid size-7 flex-none place-items-center rounded-lg bg-[var(--accent)]/12 text-[var(--accent)]">
                  <LinkIcon kind={row.id} className="size-[15px]" />
                </span>
                <span className="min-w-0 flex-1 truncate">{row.label}</span>
                {row.isPublic !== undefined && <VisibilityTag isPublic={row.isPublic} />}
              </a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

function ChainIcon({ className }) {
  return <LinkIcon kind="link" className={className} />
}

function ShareProfileModal({ shareUrl, identity, theme, headline, skills = [], experienceCount = 0, checkpointCount = 0, earnedBadges = 0, onClose, onPreviewVisitor }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shareUrl}`)
    } catch {
      // Clipboard can be blocked; the link is still selectable in the field.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-modal-title" style={{ '--accent': theme.accent }}>
      <div className="w-full max-w-[520px] rounded-3xl border border-[#404040] bg-[#1f1f1f] p-6 text-left shadow-2xl [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white max-[480px]:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="share-modal-title" className="m-0 font-rethink-sans text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Share your profile</h2>
            <p className={`mt-1 mb-0 text-[13px] ${MUTED}`}>Verified projects, milestones, badges and skills — in one link.</p>
          </div>
          <button type="button" className="grid size-8 flex-none place-items-center rounded-lg text-[#9a9a9d] hover:bg-[#262626] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-neutral-800" onClick={onClose} aria-label="Close">
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* The card a recipient sees — same banner and accent as the profile. */}
        <div className={`mt-5 overflow-hidden rounded-2xl border ${HAIRLINE} bg-[#171717] [[data-theme=light]_&]:bg-[#fafaf8]`}>
          <ProfileBanner theme={theme} image={identity?.bannerImage} className="h-16" />
          <div className="grid gap-2 px-4 pb-4">
            <ProfileAvatar identity={identity} className="-mt-7 size-14 rounded-full text-xl ring-4 ring-[#171717] [[data-theme=light]_&]:ring-[#fafaf8]" />
            <div className="grid gap-0.5">
              <span className={`font-rethink-sans text-[16px] font-semibold ${INK}`}>{identity?.name?.trim() || 'Learner'}</span>
              <span className={`text-[13px] ${MUTED}`}>{headline}</span>
            </div>
            <p className={`m-0 text-[12px] tabular-nums ${FAINT}`}>
              {experienceCount} section{experienceCount === 1 ? '' : 's'} of work · {checkpointCount} milestone{checkpointCount === 1 ? '' : 's'} · {earnedBadges} badge{earnedBadges === 1 ? '' : 's'}
            </p>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="rounded-md bg-[#262629] px-2 py-0.5 text-[11px] font-medium text-[#d4d4d4] [[data-theme=light]_&]:bg-[#ececea] [[data-theme=light]_&]:text-[#495057]">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`https://${shareUrl}`}
            onFocus={(event) => event.target.select()}
            aria-label="Profile link"
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#404040] bg-[#171717] px-3.5 text-[13px] font-medium text-[#f4f4f2] outline-none [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-[#f8f9fa] [[data-theme=light]_&]:text-neutral-800"
          />
          <ActionButton variant="primary" className="min-h-11 px-4 text-[13px] font-semibold" onClick={copy}>
            {copied ? 'Copied' : 'Copy link'}
          </ActionButton>
        </div>

        <div className="mt-4 flex justify-end">
          <ActionButton variant="neutral" className="min-h-10 text-[13px]" onClick={onPreviewVisitor}>
            <span className="flex items-center gap-1.5"><EyeIcon className="size-3.5" /> See it as a visitor</span>
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

export default function ProfileView({ profile, progress, currentPath, pathProgress, onSaveProfile, isPublicView: isPublicViewProp, onTogglePublicView }) {
  const [localPublicView, setLocalPublicView] = useState(false)
  const isPublicView = isPublicViewProp ?? localPublicView
  const setIsPublicView = onTogglePublicView ?? setLocalPublicView
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [editSection, setEditSection] = useState(null)
  const [isBadgesOpen, setIsBadgesOpen] = useState(false)

  const { xp, seasonCoins, streakDays, longestStreak, leagueIndex } = progress
  const league = getLeague(leagueIndex)
  const levelInfo = getLevel(xp)
  const identity = normalizeProfile(profile)
  const theme = getBannerTheme(identity?.bannerTheme)
  const roleLabel = getRoleLabel(profile?.role)
  const branchLabel = BRANCH_LABELS[profile?.branch]
  const motivationLabel = MOTIVATION_LABELS[profile?.motivation]
  const experienceLabel = EXPERIENCE_LABELS[profile?.experience]
  const interestLabels = (profile?.projectInterest ?? []).map((value) => INTEREST_LABELS[value]).filter(Boolean)
  const needLabels = (profile?.immediateNeed ?? []).map((value) => NEED_LABELS[value]).filter(Boolean)
  const joinedDate = formatLongMonth(profile?.completedAt)
  const joinedYear = profile?.completedAt ? new Date(profile.completedAt).getFullYear() : null
  const startingPointLadder = profile?.role === 'frontend_developer'
    ? `frontend_developer_${profile.stack ?? 'foundations'}`
    : profile?.role === 'backend_developer'
      ? `backend_developer_${profile.stack ?? 'node'}`
      : profile?.role
  const startingPointLabel = STARTING_POINT_LABELS[startingPointLadder]?.[profile?.startingPoint]
  const frameworkStatus = profile?.role === 'frontend_developer'
    ? profile.frameworkDecision === 'pending'
      ? 'Choose your framework after JavaScript foundations.'
      : profile.stack ? `Framework focus: ${STACK_LABELS[profile.stack]}.` : null
    : null

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

  const experienceRegions = authoredRegions.filter((region) => region.lessonsCompleted > 0)
  const verifiedLessons = authoredRegions.reduce((total, region) => total + region.lessonsCompleted, 0)
  const pathTools = explorePaths.find((entry) => entry.id === currentPath?.id)?.tools ?? []
  const coveredAreas = experienceRegions.map((region) => region.title)
  const skills = [...new Set([...pathTools, ...coveredAreas])]
  const certifications = authoredRegions.flatMap((region) =>
    region.lessons
      .filter((lesson) => lesson.isCheckpoint && isVerified(lesson))
      .map((lesson) => ({ ...lesson, completedAt: completedLessons[lesson.id].completedAt, regionTitle: region.title })),
  )

  const cleanExperience = experienceLabel
    ? experienceLabel.replace(/^i've\s+/i, "I've ").replace(/^built\s+/i, "Built ")
    : null

  const generatedAbout = [
    motivationLabel ? `${motivationLabel}.` : null,
    cleanExperience ? `Starting level: ${cleanExperience.charAt(0).toUpperCase() + cleanExperience.slice(1)}.` : null,
    currentPath ? `Currently focusing on the “${currentPath.title}” learning track.` : null,
    profile?.dailyMinutes ? `Dedicated to ${profile.dailyMinutes} minutes of daily practice.` : null,
  ].filter(Boolean).join(' ')
  // Bio and headline are each either DevSpace's (built from real progress,
  // so it stays current on its own) or the learner's — never a mix.
  const about = identity?.bioSource === 'custom' && identity.bio.trim() ? identity.bio.trim() : generatedAbout
  const headline = identity?.headlineSource === 'custom' && identity.headline.trim() ? identity.headline.trim() : roleLabel

  const profileQuests = getProfileProgress(identity, { lessonsCompleted: verifiedLessons })
  const links = getProfileLinks(identity)

  const badges = getBadges({
    streakDays,
    longestStreak,
    earnedStreakMilestones: progress.earnedStreakMilestones ?? [],
    lessonsCompleted: Object.keys(completedLessons).length,
    milestonesPassed: certifications.length,
    regionsCompleted: authoredRegions.filter((region) => region.state === 'completed').length,
    practiceSessions: Object.keys(progress.completedSessions ?? {}).length,
    xp,
    highestLeagueIndex: progress.highestLeagueIndex ?? 0,
    seasonRewards: (progress.seasonRewardHistory ?? []).filter((entry) => entry?.amount > 0).length,
    profileComplete: profileQuests.percent === 100,
    linkCount: links.length,
  })
  const earnedBadges = badges.filter((badge) => badge.earned)
  const featuredBadges = getFeaturedBadges(badges, identity?.featuredBadges)
  const upNext = nextBadge(badges)

  const stats = [
    { label: 'Modules', value: verifiedLessons },
    { label: 'Milestones', value: certifications.length },
    { label: 'Badges', value: earnedBadges.length },
    { label: 'Best streak', value: `${Math.max(longestStreak ?? 0, streakDays ?? 0)}d` },
  ]

  const slug = identity?.name?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const shareUrl = `devspace.dev/u/${slug || 'learner'}`

  const openEdit = (section = 'look') => setEditSection(section)

  const heroProps = {
    identity,
    theme,
    shareUrl,
    headline,
    branchLabel,
    joinedDate,
    dailyMinutes: profile?.dailyMinutes,
    levelInfo,
    xp,
    stats,
    featuredBadges,
    links,
    onEdit: () => openEdit('look'),
    onOpenBadges: () => setIsBadgesOpen(true),
  }

  const viewAllBadges = (
    <button type="button" className={`${QUIET_BUTTON} -my-2 -mr-2`} onClick={() => setIsBadgesOpen(true)}>
      View all
    </button>
  )

  const experienceSection = (plain) => (
    <SectionCard title="Experience & Practical Projects" icon={BriefcaseIcon} plain={plain}>
      {experienceRegions.length === 0 ? (
        <p className={`m-0 max-w-[60ch] text-[14px] leading-[1.7] ${MUTED}`}>
          Nothing here yet. Complete a learning module and its practical application appears as an
          entry with verified dates and demonstrated competencies.
        </p>
      ) : (
        <ol className={`m-0 grid list-none p-0 ${plain ? 'gap-8' : 'gap-7'}`}>
          {experienceRegions.map((region) => (
            <ExperienceEntry key={region.id ?? region.title} region={region} pathTitle={currentPath?.title ?? ''} />
          ))}
        </ol>
      )}
    </SectionCard>
  )

  const milestonesSection = (plain) => certifications.length > 0 && (
    <SectionCard title="Milestones & Credentials" icon={TrophyIcon} plain={plain}>
      <ul className="m-0 grid list-none gap-4 p-0">
        {certifications.map((lesson) => (
          <li key={lesson.id} className={DATED_ROW}>
            <DateCell>{formatMonth(lesson.completedAt) ?? ''}</DateCell>
            <div className="grid min-w-0 gap-0.5">
              <span className={`flex items-baseline gap-2 text-[14px] font-semibold ${INK}`}>
                <CheckIcon className="size-3.5 flex-none translate-y-[2px] text-amber-400" aria-hidden="true" />
                {lesson.title}
              </span>
              <span className={`text-[12px] ${MUTED}`}>Milestone passed · {lesson.regionTitle}</span>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )

  const skillsSection = (plain) => skills.length > 0 && (
    <SectionCard title="Skills & Competencies" icon={LayersIcon} plain={plain}>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => <Chip key={skill}>{skill}</Chip>)}
      </div>
    </SectionCard>
  )

  const pathSection = (plain) => currentPath && (
    <SectionCard title="Learning Path & Curriculum" icon={BookOpenIcon} plain={plain}>
      <div className={DATED_ROW}>
        <DateCell>{joinedYear ? `${joinedYear} – Present` : 'Present'}</DateCell>
        <div className="grid gap-1.5">
          <h3 className={`m-0 text-[15px] font-semibold tracking-[-.01em] ${INK}`}>{currentPath.title}</h3>
          <p className={`m-0 text-[13px] ${MUTED}`}>Devspace · {currentPath.level ?? 'Track'}</p>
          <p className={`m-0 text-[12px] tabular-nums ${FAINT}`}>
            {verifiedLessons} of {pathProgress?.lessonsTotal ?? 0} modules · {certifications.length} of {pathProgress?.checkpointsTotal ?? 0} milestones
          </p>
          {startingPointLabel && (
            <p className="m-0 pt-2 text-[14px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">Placed at {startingPointLabel}.</p>
          )}
          {frameworkStatus && <p className="m-0 text-[14px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{frameworkStatus}</p>}
        </div>
      </div>
    </SectionCard>
  )

  const focusSection = (plain) => (interestLabels.length > 0 || needLabels.length > 0) && (
    <SectionCard title="Focus Areas & Interests" icon={HeartIcon} plain={plain}>
      <div className="grid gap-5">
        {interestLabels.length > 0 && (
          <div className="grid gap-2.5">
            <span className={`text-[12px] font-semibold uppercase tracking-[.08em] ${MUTED}`}>Domains</span>
            <div className="flex flex-wrap gap-2">
              {interestLabels.map((label) => <Chip key={label}>{label}</Chip>)}
            </div>
          </div>
        )}
        {needLabels.length > 0 && (
          <div className="grid gap-2.5">
            <span className={`text-[12px] font-semibold uppercase tracking-[.08em] ${MUTED}`}>Focused on</span>
            <div className="flex flex-wrap gap-2">
              {needLabels.map((label) => <Chip key={label}>{label}</Chip>)}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )

  const standingSection = (plain) => league && (
    <SectionCard title="Cohort Standing" icon={TrendingUpIcon} plain={plain}>
      <div className="flex items-center gap-3">
        <TierMedal league={league} state="current" size={44} />
        <div className="grid gap-0.5">
          <span className={`text-[15px] font-medium ${INK}`}>{league.name}</span>
          <span className={`text-[13px] tabular-nums ${MUTED}`}>{seasonCoins} <CoinIcon /> this season</span>
        </div>
      </div>
    </SectionCard>
  )

  return (
    <div className="grid gap-5" aria-label="Profile" style={{ '--accent': theme.accent }}>
      {isPublicView ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#162138] p-4 font-rubik text-sm text-[#dbe6ff] [[data-theme=light]_&]:border-[#bfdbfe] [[data-theme=light]_&]:bg-[#eff6ff] [[data-theme=light]_&]:text-[#1e3a8a]">
          <div className="flex min-w-0 items-center gap-2.5">
            <EyeIcon className="size-4 flex-none text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]" />
            <span>
              <strong>Visitor preview</strong>
              <span className="text-[#a8c2ef] [[data-theme=light]_&]:text-[#3b82f6]"> · This is what people see when you share your link.</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center justify-center gap-2 max-[540px]:w-full">
            <ActionButton variant="neutral" className="min-h-10 whitespace-nowrap text-xs max-[540px]:flex-1" onClick={() => setIsShareModalOpen(true)}>
              <span className="flex w-full items-center justify-center gap-1.5"><ShareIcon className="size-3.5" /> Share link</span>
            </ActionButton>
            <ActionButton variant="primary" className="min-h-10 whitespace-nowrap text-xs max-[540px]:flex-1" onClick={() => setIsPublicView(false)}>
              <span className="flex w-full items-center justify-center gap-1.5"><ArrowLeftIcon className="size-3.5" /> Back to profile</span>
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`text-xs ${MUTED}`}>Your verified skill profile, projects & achievements</span>
          <div className="flex items-center gap-2">
            <ActionButton variant="neutral" className="min-h-9 text-[13px]" onClick={() => setIsPublicView(true)}>
              <span className="flex items-center gap-1.5"><EyeIcon className="size-4" /> View as visitor</span>
            </ActionButton>
            <ActionButton variant="primary" className="min-h-9 text-[13px]" onClick={() => setIsShareModalOpen(true)}>
              <span className="flex items-center gap-1.5"><ShareIcon className="size-4" /> Share profile</span>
            </ActionButton>
          </div>
        </div>
      )}

      {isPublicView ? (
        <div className="mx-auto grid w-full max-w-[820px] gap-6">
          <ProfileHero {...heroProps} isPublic />

          {about && (
            <SectionCard title="About" plain>
              <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.7] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252]">{about}</p>
            </SectionCard>
          )}

          {experienceSection(true)}
          {milestonesSection(true)}

          {earnedBadges.length > 0 && (
            <SectionCard title={`Badges · ${earnedBadges.length}`} plain action={viewAllBadges}>
              <BadgeShelf badges={badges} columns={6} slots={12} showLocked={false} />
            </SectionCard>
          )}

          {skillsSection(true)}
          {pathSection(true)}
          {focusSection(true)}
          {standingSection(true)}

          <footer className="mt-2 text-center">
            <p className={`m-0 text-xs font-medium ${FAINT}`}>Verified by DevSpace · Certified competency & practical project milestones</p>
          </footer>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 max-[900px]:grid-cols-1">
          <section className="grid gap-5">
            <ProfileHero {...heroProps} isPublic={false} />

            {about && (
              <SectionCard
                title="About"
                icon={InfoIcon}
                action={<button type="button" className={`${QUIET_BUTTON} -my-2 -mr-2`} onClick={() => openEdit('about')}>{identity?.bioSource === 'custom' ? 'Edit' : 'Write your own'}</button>}
              >
                <p className="m-0 max-w-[68ch] text-[14px] leading-[1.75] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{about}</p>
                {identity?.bioSource !== 'custom' && (
                  <span className={`inline-flex items-center gap-1.5 text-[12px] ${FAINT}`}>
                    <SparkleIcon className="size-3.5 text-[var(--accent)]" /> Written by DevSpace from your progress
                  </span>
                )}
              </SectionCard>
            )}

            {experienceSection(false)}
            {milestonesSection(false)}
            {skillsSection(false)}
            {pathSection(false)}
            {focusSection(false)}
          </section>

          <aside className="grid gap-5">
            <SectionCard title="Badges" icon={TrophyIcon} action={viewAllBadges}>
              <div className="grid gap-4">
                <span className={`text-[13px] ${MUTED}`}>
                  <strong className={`font-semibold ${INK}`}>{earnedBadges.length}</strong> of {badges.length} collected
                </span>
                <BadgeShelf badges={badges} />
                {upNext && (
                  <div className={`flex items-center gap-3 rounded-xl border ${HAIRLINE} p-3`}>
                    <BadgeCoin badge={upNext} size={34} />
                    <div className="grid min-w-0 gap-0.5">
                      <span className={`text-[12px] ${FAINT}`}>Closest next</span>
                      <span className={`truncate text-[13px] font-semibold ${INK}`}>{upNext.label}</span>
                      <span className={`text-[12px] tabular-nums ${MUTED}`}>
                        {upNext.progress.target - upNext.progress.current} {upNext.progress.noun} to go
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <ContactCard identity={identity} links={links} onEdit={() => openEdit('links')} />

            {standingSection(false)}

            {profileQuests.percent < 100 && (
              <SectionCard title="Profile Quests" icon={ChecklistIcon}>
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
            )}

            {pathProgress?.nextCheckpoint && (
              <SectionCard title="Next Milestone" icon={FlagIcon}>
                <div className="grid gap-1">
                  <span className={`text-[15px] font-medium ${INK}`}>{pathProgress.nextCheckpoint.lesson.title}</span>
                  <span className={`text-[13px] ${MUTED}`}>
                    {pathProgress.nextCheckpoint.lessonsUntil === 0
                      ? 'Up next'
                      : `${pathProgress.nextCheckpoint.lessonsUntil} module${pathProgress.nextCheckpoint.lessonsUntil === 1 ? '' : 's'} away`}
                  </span>
                </div>
              </SectionCard>
            )}
          </aside>
        </div>
      )}

      {isShareModalOpen && (
        <ShareProfileModal
          shareUrl={shareUrl}
          identity={identity}
          theme={theme}
          headline={headline}
          skills={skills}
          experienceCount={experienceRegions.length}
          checkpointCount={certifications.length}
          earnedBadges={earnedBadges.length}
          onClose={() => setIsShareModalOpen(false)}
          onPreviewVisitor={() => {
            setIsShareModalOpen(false)
            setIsPublicView(true)
          }}
        />
      )}

      {isBadgesOpen && (
        <BadgesDrawer
          badges={badges}
          pinnedIds={identity?.featuredBadges ?? []}
          readOnly={isPublicView}
          onTogglePin={(id) => onSaveProfile?.({ featuredBadges: toggleFeaturedBadge(identity?.featuredBadges ?? [], id) })}
          onClose={() => setIsBadgesOpen(false)}
        />
      )}

      {editSection && (
        <EditProfileModal
          profile={identity}
          initialSection={editSection}
          highestLeagueIndex={progress?.highestLeagueIndex}
          generated={{
            about: generatedAbout,
            headline: roleLabel,
            skills,
            experience: experienceRegions.map((region) => region.title),
            milestones: certifications.length,
            badges: earnedBadges.length,
            badgesTotal: badges.length,
            pathTitle: currentPath?.title,
          }}
          onOpenBadges={() => {
            setEditSection(null)
            setIsBadgesOpen(true)
          }}
          onSave={(fields) => onSaveProfile?.(fields)}
          onClose={() => setEditSection(null)}
        />
      )}
    </div>
  )
}
