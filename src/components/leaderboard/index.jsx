import { useEffect, useState } from 'react';
import { getLeague } from '../../data/leagues';
import { can, CAPABILITIES } from '../../lib/entitlements';
import { getAllTimeStandings, getBoardWindow, getNextTarget, getStandings, getZoneSummary, USER_ID } from '../../lib/leagueSim';
import { findUsablePass } from '../../lib/leagueAccess';
import { getRewardPool } from '../../lib/rewardConfig';
import { cashZoneShareText, rankClimbShareText } from '../../lib/shareText';
import { getSeasonIndex, getSeasonNumber, now } from '../../lib/week';
import { InfoTooltip } from '../ui/InfoTooltip';
import { ShareButton } from '../ui/ShareButton';
import { CompetitorDrawer } from './CompetitorDrawer';
import { LeaderboardIntroduction } from './LeaderboardIntroduction';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardTabs } from './LeaderboardTabs';
import { LeagueLadder } from './LeagueLadder';
import { LeagueResultBanner } from './LeagueResultBanner';
import { LeagueJoinPrompt, LockedBoardSkeleton } from './LockedLeaderboard';
import { SeasonDeadline } from './SeasonDeadline';

const TABS = ['This season', 'All time', 'By path']
const TICK_MS = 60 * 1000
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
          <span className="text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">See every Devy Coin you&apos;ve earned.</span>
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

// "What do I need next?" — the one line that answers section 9: how many
// coins, to which rank, for what payoff. Recomputed from the same standings
// the board renders, so it can never say something the rows don't back up.
function NextTargetCard({ target, summary }) {
  if (summary.inRewardZone && !target) {
    return (
      <div className="rounded-2xl border border-[#2b5540] bg-[#16281f] [[data-theme=light]_&]:border-[#b6e3ca] [[data-theme=light]_&]:bg-[#e7f6ee] px-4 py-3.5">
        <strong className="block text-sm font-semibold text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]">You're in the top reward position</strong>
        <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Hold your place to lock it in when the season ends.</span>
      </div>
    )
  }

  if (!target) return null

  return (
    <div className="rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 py-3.5">
      <strong className="block text-sm font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        {target.coinsNeeded.toLocaleString()} 🪙 to #{target.rank}
      </strong>
      <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        {target.kind === 'reward' ? `Reach #${target.rank} → ₦${target.reward.toLocaleString()}` : `Reach #${target.rank}`}
      </span>
    </div>
  )
}

export default function LeaderboardView({
  seasonDevyCoins = 0,
  lifetimeCoins = 0,
  leagueIndex = 0,
  lastLeagueResult,
  progress,
  onDismissResult,
  onStartPractice,
  onOpenPlans,
  onViewOwnProfile,
  onViewRecap,
  hasSeenIntroduction = true,
  onDismissIntroduction,
}) {
  const [tab, setTab] = useState(TABS[0])
  const [expanded, setExpanded] = useState(false)
  const [clock, setClock] = useState(() => now())
  const [selectedEntry, setSelectedEntry] = useState(null)

  // Rival coins advance with the clock, so re-deriving on a timer makes the
  // board visibly move while the page is open.
  useEffect(() => {
    const id = window.setInterval(() => setClock(now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const league = getLeague(leagueIndex)
  // Until you've earned a Devy Coin this season you aren't really in the
  // league — showing a stranger's board with you last is the wrong first impression.
  const hasJoined = seasonDevyCoins > 0

  const hasProTag = can(progress, CAPABILITIES.PRO_TAG)
  const hasAllTime = can(progress, CAPABILITIES.ALL_TIME_BOARD)
  const hasFullCohort = can(progress, CAPABILITIES.FULL_COHORT)

  const seasonIndex = getSeasonIndex(clock)
  const seasonly = hasJoined
    ? getStandings(seasonIndex, leagueIndex, seasonDevyCoins, clock, { userTag: hasProTag ? 'PRO' : null })
    : []
  const summary = hasJoined ? getZoneSummary(seasonly, leagueIndex) : null
  const nextTarget = hasJoined ? getNextTarget(seasonly, leagueIndex) : null
  const progressStatus = summary?.inDemotion
    ? { label: `${summary.gapToSafety.toLocaleString()} 🪙 to safety`, tone: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]' }
    : summary?.inPromotion
      ? { label: summary.promotionCushion > 0 ? `Promotion zone · ${summary.promotionCushion.toLocaleString()} 🪙 clear` : 'Promotion zone · hold your place', tone: 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]' }
      : summary?.promotesAnyone
        ? { label: `${summary.gapToPromotion.toLocaleString()} 🪙 to promotion`, tone: 'text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]' }
        : { label: 'Holding your place', tone: 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]' }

  // A rank climb takes priority over the cash-zone card when both happen to
  // be true today — one moment shared at a time, not two competing for the
  // same button. Neither claims anything summary/user don't already say.
  const shareMoment = summary?.user?.delta > 0
    ? { text: rankClimbShareText({ positions: summary.user.delta, rank: summary.user.rank, league: league.name }), label: `Share your climb` }
    : summary?.inRewardZone
      ? { text: cashZoneShareText({ league: league.name, reward: summary.user.reward }), label: 'Share' }
      : null

  // Qualifying by rank and being allowed to actually compete there are two
  // different things once Pro is required — the tooltip has to say so, or
  // "finish top N" reads as a promise this league alone can't keep.
  const nextLeague = league.promoteCount > 0 ? getLeague(leagueIndex + 1) : null
  const hasNextLeagueAccess = !nextLeague?.proRequired
    || can(progress, CAPABILITIES.SILVER_PLUS_LEAGUES)
    || Boolean(findUsablePass(progress?.leaguePasses, nextLeague?.id, seasonIndex + 1))

  const userRole = seasonly.find((entry) => entry.isCurrentUser)?.role
  const byPath = tab === 'By path'
    ? seasonly.filter((entry) => entry.role === userRole).map((entry, index) => ({ ...entry, rank: index + 1 }))
    : []

  const allTimeFull = tab === 'All time' && hasJoined ? getAllTimeStandings(lifetimeCoins) : []
  const allTime = (() => {
    if (!hasAllTime) return allTimeFull
    const top = allTimeFull.slice(0, 20)
    return top.some((entry) => entry.isCurrentUser) ? top : [...top, allTimeFull.find((entry) => entry.isCurrentUser)]
  })()

  // Only the season board has zone cutoffs to window around; the other ranges
  // are flat lists, so they render every row they have.
  const rendered = (() => {
    if (!hasJoined || tab !== 'This season') return []
    return getBoardWindow(seasonly, summary, { expanded: expanded && hasFullCohort })
  })()

  const user = summary?.user

  // Gated after the hooks above so the board's timer/derivations keep their
  // stable hook order regardless of whether the intro is showing.
  if (!hasSeenIntroduction) return <LeaderboardIntroduction leagueIndex={leagueIndex} onComplete={onDismissIntroduction} />

  return (
    <section className="grid gap-8" aria-label="Leaderboard">
      {lastLeagueResult && (
        <LeagueResultBanner result={lastLeagueResult} progress={progress} onDismiss={onDismissResult} onOpenPlans={onOpenPlans} onViewRecap={onViewRecap} />
      )}

      {/* The hero makes rank and movement the dominant thing on the page —
          everything else (pool, deadline, promotion line) supports it rather
          than competing with it. */}
      <div className="grid w-full justify-items-center gap-3 text-center max-w-[860px] mx-auto rounded-3xl bg-[#1a1a1c] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] px-6 py-5 max-[680px]:px-4">
        <LeagueLadder leagueIndex={leagueIndex} />
        <div className="flex items-center gap-2">
          <h1 className="m-0 mt-1 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-3xl font-semibold leading-tight">{league.name}</h1>
          <InfoTooltip label="How the leaderboard works" align="center">
            Everyone in your league is ranked by Devy Coins earned this season — practice, lessons, and clean first-try answers all count, but repeating what you've already mastered does not.
            Seasons run 28 days.{' '}
            {league.promoteCount > 0 ? `Finish in the top ${league.promoteCount} to move up a league.` : 'This is the top league, so there’s nowhere higher to climb.'}
            {' '}
            {league.demoteCount > 0 ? `Finish in the bottom ${league.demoteCount} and you’ll drop one.` : 'You can’t drop below this league.'}
            {nextLeague?.proRequired && !hasNextLeagueAccess && (
              ` ${nextLeague.name} needs Devspace Pro (or an earned League Pass) to actually compete in — qualifying by rank still counts and is never lost, but you’ll stay here until you unlock it.`
            )}
          </InfoTooltip>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          <span>Season {getSeasonNumber(seasonIndex)}</span>
          <span aria-hidden="true">·</span>
          <SeasonDeadline timestamp={clock} />
          <span aria-hidden="true">·</span>
          <span>₦{getRewardPool(league.id).toLocaleString()} reward pool</span>
        </div>

        {hasJoined && user && (
          <div className="mt-2 grid w-full max-w-[520px] gap-3">
            <div className="flex items-center justify-center gap-3">
              <span className="font-rethink-sans text-[32px] font-semibold leading-none text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">#{user.rank}</span>
              {user.delta !== null && user.delta !== undefined && user.delta !== 0 && (
                <span className={`text-sm font-semibold ${user.delta > 0 ? 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]' : 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]'}`}>
                  {user.delta > 0 ? `▲${user.delta} today` : `▼${Math.abs(user.delta)} today`}
                </span>
              )}
              <span className="text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{seasonDevyCoins.toLocaleString()} 🪙</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px]">
              <span className={progressStatus.tone}>{progressStatus.label}</span>
              <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-medium">
                Current reward: {user.reward > 0 ? `₦${user.reward.toLocaleString()}` : 'None yet'}
              </span>
            </div>
            <NextTargetCard target={nextTarget} summary={summary} />
            {shareMoment && (
              <ShareButton variant="neutral" className="min-h-9 w-full max-w-[220px] mx-auto text-sm font-medium" text={shareMoment.text}>
                {shareMoment.label}
              </ShareButton>
            )}
          </div>
        )}

        {!hasJoined && <LeagueJoinPrompt onStartPractice={onStartPractice} />}
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
                <span>Devy Coins</span>
              </li>
              {(tab === 'This season' ? rendered
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
                if (item.type === 'reward-line') {
                  return <li key="reward-line"><ZoneDivider label="Reward zone ends" color="#f0c964" /></li>
                }
                if (item.type === 'demotion-line') {
                  return <li key="demotion-line"><ZoneDivider label="Demotion zone starts" color="#ff676d" /></li>
                }
                return (
                <li key={item.entry.id} className="border-t border-[#404040] first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
                    <LeaderboardRow entry={item.entry} isCurrentUser={item.entry.id === USER_ID} onSelect={setSelectedEntry} />
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}

      {selectedEntry && (
        <CompetitorDrawer
          entry={selectedEntry}
          leagueIndex={leagueIndex}
          streakDays={progress?.streakDays ?? 0}
          onViewOwnProfile={() => { setSelectedEntry(null); onViewOwnProfile?.() }}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </section>
  )
}
