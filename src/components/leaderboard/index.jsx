import { useEffect, useState } from 'react';
import { getLeague } from '../../data/leagues';
import { can, CAPABILITIES } from '../../lib/entitlements';
import { getAllTimeStandings, getBoardWindow, getStandings, getZoneSummary, USER_ID } from '../../lib/leagueSim';
import { getWeekIndex, now } from '../../lib/week';
import { InfoTooltip } from '../ui/InfoTooltip';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardTabs } from './LeaderboardTabs';
import { LeagueLadder } from './LeagueLadder';
import { LeagueResultBanner } from './LeagueResultBanner';
import { LeagueJoinPrompt, LockedBoardSkeleton } from './LockedLeaderboard';
import { PageArrival } from '../ui/PageArrival';

const TABS = ['This week', 'All time', 'By path']
const TICK_MS = 60 * 1000
const PX_TO_JOIN = 10
const ALL_TIME_PREVIEW_ROWS = 5

function ZoneDivider({ label, color }) {
  return (
    <div
      className="flex items-center gap-2.5 mx-1 my-1.5 text-[11px] font-bold tracking-[.08em] uppercase"
      style={{ color }}
      role="separator"
      aria-label={label}
    >
      <span className="flex-1 h-px opacity-50" style={{ background: color }} />
      {label}
      <span className="flex-1 h-px opacity-50" style={{ background: color }} />
    </div>
  )
}

function HiddenRows({ count, locked, onExpand }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="w-full py-2 text-[11px] font-semibold tracking-[.06em] uppercase text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] focus-visible:outline-offset-2"
    >
      ··· {count} more{locked ? ' · Premium' : ''}
    </button>
  )
}

// Free learners get a taste of the all-time board — the top real rows, then a
// blurred stack — rather than a bare lock. Real numbers before the wall is
// what makes the upsell believable.
function AllTimePreview({ rows, onOpenPlans }) {
  return (
    <div className="relative">
      <ol className="grid list-none m-0 p-0">
        {rows.map((entry) => (
          <li key={entry.id}><LeaderboardRow entry={entry} isCurrentUser={entry.id === USER_ID} /></li>
        ))}
      </ol>
      <div className="relative mt-1 grid gap-2 overflow-hidden rounded-xl">
        <div className="grid gap-1.5 opacity-60 blur-[3px] select-none pointer-events-none" aria-hidden="true">
          {rows.map((entry, index) => <LeaderboardRow key={`ghost-${index}`} entry={entry} isCurrentUser={false} />)}
        </div>
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-transparent to-[#1f1f1f] [[data-theme=light]_&]:to-white">
          <div className="grid justify-items-center gap-2 text-center">
          <span className="text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">See every XP you&apos;ve earned.</span>
          <button
            type="button"
            onClick={() => onOpenPlans?.('all-time')}
            className="rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#262626] [[data-theme=light]_&]:bg-white px-4 py-2 text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:brightness-110"
          >
            Unlock all-time standings
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardView({
  weeklyXp = 0,
  xp = 0,
  leagueIndex = 0,
  lastLeagueResult,
  progress,
  onDismissResult,
  onStartPractice,
  onOpenPlans,
  hasSeenIntroduction,
  onDismissIntroduction,
}) {
  const [tab, setTab] = useState(TABS[0])
  const [expanded, setExpanded] = useState(false)
  const [clock, setClock] = useState(() => now())

  // Rival XP advances with the clock, so re-deriving on a timer makes the board
  // visibly move while the page is open.
  useEffect(() => {
    const id = window.setInterval(() => setClock(now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const league = getLeague(leagueIndex)
  // Until you've earned something this week you aren't really in the league —
  // showing a stranger's board with you last is the wrong first impression.
  const hasJoined = weeklyXp > 0

  const hasProTag = can(progress, CAPABILITIES.PRO_TAG)
  const hasAllTime = can(progress, CAPABILITIES.ALL_TIME_BOARD)
  const hasFullCohort = can(progress, CAPABILITIES.FULL_COHORT)

  const weekIndex = getWeekIndex(clock)
  const weekly = hasJoined
    ? getStandings(weekIndex, leagueIndex, weeklyXp, clock, { userTag: hasProTag ? 'PRO' : null })
    : []
  const summary = hasJoined ? getZoneSummary(weekly, leagueIndex) : null
  const progressStatus = summary?.inDemotion
    ? { label: `${summary.gapToSafety.toLocaleString()} px to safety`, tone: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]' }
    : summary?.inPromotion
      ? { label: summary.promotionCushion > 0 ? `Promotion zone · ${summary.promotionCushion.toLocaleString()} px clear` : 'Promotion zone · hold your place', tone: 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]' }
      : summary?.promotesAnyone
        ? { label: `${summary.gapToPromotion.toLocaleString()} px to promotion`, tone: 'text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]' }
        : { label: 'Holding your place', tone: 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]' }

  const userRole = weekly.find((entry) => entry.isCurrentUser)?.role
  const byPath = tab === 'By path'
    ? weekly.filter((entry) => entry.role === userRole).map((entry, index) => ({ ...entry, rank: index + 1 }))
    : []

  const allTimeFull = tab === 'All time' && hasJoined ? getAllTimeStandings(xp) : []
  const allTime = (() => {
    if (!hasAllTime) return allTimeFull
    const top = allTimeFull.slice(0, 20)
    return top.some((entry) => entry.isCurrentUser) ? top : [...top, allTimeFull.find((entry) => entry.isCurrentUser)]
  })()

  // Only the weekly board has cutoffs to window around; the other ranges are
  // flat lists, so they render every row they have.
  const rendered = (() => {
    if (!hasJoined || tab !== 'This week') return []
    return getBoardWindow(weekly, summary, { expanded: expanded && hasFullCohort })
  })()

  if (!hasSeenIntroduction) return <PageArrival
    ariaLabel="About the leaderboard"
    eyebrow="Your weekly league"
    title="See how your effort stacks up"
    body="Lessons and practice earn XP. Climb the standings each week to move up your league."
    actionLabel="View leaderboard"
    onContinue={onDismissIntroduction}
  />

  return (
    <section className="grid gap-8" aria-label="Leaderboard">
      {lastLeagueResult && (
        <LeagueResultBanner result={lastLeagueResult} progress={progress} onDismiss={onDismissResult} onOpenPlans={onOpenPlans} />
      )}

      {/* The header explains the league; the compact target strip below tells
          the learner what their next useful move is before they scan the rows. */}
      <div className="grid w-full justify-items-center gap-3 text-center max-w-[860px] mx-auto rounded-3xl bg-[#1a1a1c] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] px-6 py-5 max-[680px]:px-4">
        <LeagueLadder leagueIndex={leagueIndex} />
        <div className="flex items-center gap-2">
          <h1 className="m-0 mt-1 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-3xl font-semibold leading-tight">{league.name}</h1>
          <InfoTooltip label="How the leaderboard works" align="center">
            Everyone in your league is ranked by XP earned this week — practice, lessons, and streaks all count.
            Standings reset every Monday.{' '}
            {league.promoteCount > 0 ? `Finish in the top ${league.promoteCount} to move up a league.` : 'This is the top league, so there’s nowhere higher to climb.'}
            {' '}
            {league.demoteCount > 0 ? `Finish in the bottom ${league.demoteCount} and you’ll drop one.` : 'You can’t drop below this league.'}
          </InfoTooltip>
        </div>
        <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[15px] leading-[1.5]">
          {league.promoteCount > 0 && league.demoteCount > 0
            ? `Top ${league.promoteCount} advance · bottom ${league.demoteCount} drop`
            : league.promoteCount > 0
              ? `Top ${league.promoteCount} advance to ${getLeague(leagueIndex + 1).name}`
              : `Hold your place · bottom ${league.demoteCount} drop`}
        </p>
        {!hasJoined && <LeagueJoinPrompt pxToJoin={PX_TO_JOIN} onStartPractice={onStartPractice} />}
      </div>

      {!hasJoined ? (
        <LockedBoardSkeleton />
      ) : (
        <div className="grid w-full max-w-[860px] mx-auto gap-6">
          <LeaderboardTabs
            tabs={TABS}
            active={tab}
            onSelect={setTab}
            lockedTabs={hasAllTime ? [] : ['All time']}
            onLockedSelect={() => onOpenPlans?.('all-time')}
          />

          {tab === 'All time' && !hasAllTime ? (
            <AllTimePreview rows={allTime.slice(0, ALL_TIME_PREVIEW_ROWS)} onOpenPlans={onOpenPlans} />
          ) : (
            <ol className="grid list-none m-0 overflow-hidden rounded-3xl bg-[#1a1a1c] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] p-1.5" aria-label={`${league.name} standings`}>
              <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-3.5 px-4 pt-3 pb-2 text-[10px] font-semibold tracking-[.08em] uppercase text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
                <span>Learner</span>
                <span>px</span>
              </li>
              {(tab === 'This week' ? rendered
                : tab === 'By path' ? byPath.map((entry) => ({ type: 'row', entry }))
                : allTime.map((entry) => ({ type: 'row', entry }))
              ).map((item, index) => {
                if (item.type === 'gap') {
                  return (
                    <li key={`gap-${index}`}>
                      <HiddenRows
                        count={item.hiddenCount}
                        locked={!hasFullCohort}
                        onExpand={() => (hasFullCohort ? setExpanded(true) : onOpenPlans?.('full-cohort'))}
                      />
                    </li>
                  )
                }
                if (item.type === 'promotion-line') {
                  return <li key="promotion-line"><ZoneDivider label="Promotion zone ends" color="#04adc0" /></li>
                }
                if (item.type === 'demotion-line') {
                  return <li key="demotion-line"><ZoneDivider label="Demotion zone starts" color="#ff676d" /></li>
                }
                return (
                <li key={item.entry.id} className="border-t border-[#404040] first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
                    <LeaderboardRow entry={item.entry} isCurrentUser={item.entry.id === USER_ID} />
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}
