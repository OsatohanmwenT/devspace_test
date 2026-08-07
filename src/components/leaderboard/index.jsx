import { useEffect, useState } from 'react'
import { getLeague, leagues } from '../../data/leagues'
import { getAllTimeStandings, getStandings, getZoneSummary, USER_ID } from '../../lib/leagueSim'
import { formatTimeRemaining, getTimeRemaining, getWeekIndex, now } from '../../lib/week'
import { LeagueLadder } from './LeagueLadder'
import { LeaderboardRow } from './LeaderboardRow'
import { PromotionSummary } from './PromotionSummary'
import { LeagueResultBanner } from './LeagueResultBanner'
import { LockedLeaderboard } from './LockedLeaderboard'

const TABS = ['This week', 'All time', 'By path']
const TICK_MS = 60 * 1000
const PX_TO_JOIN = 10

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

export default function LeaderboardView({ weeklyXp = 0, xp = 0, leagueIndex = 0, lastLeagueResult, onDismissResult, onStartPractice }) {
  const [tab, setTab] = useState(TABS[0])
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

  const weekIndex = getWeekIndex(clock)
  const weekly = hasJoined ? getStandings(weekIndex, leagueIndex, weeklyXp, clock) : []
  const summary = hasJoined ? getZoneSummary(weekly, leagueIndex) : null

  const allTime = tab === 'All time' ? getAllTimeStandings(xp) : []
  const userRole = weekly.find((entry) => entry.isCurrentUser)?.role
  const byPath = tab === 'By path'
    ? weekly.filter((entry) => entry.role === userRole).map((entry, index) => ({ ...entry, rank: index + 1 }))
    : []

  const visible = tab === 'All time'
    ? (() => {
      const top = allTime.slice(0, 20)
      return top.some((entry) => entry.isCurrentUser) ? top : [...top, allTime.find((entry) => entry.isCurrentUser)]
    })()
    : tab === 'By path' ? byPath : weekly

  return (
    <section className="grid gap-7" aria-label="Leaderboard">
      {lastLeagueResult && <LeagueResultBanner result={lastLeagueResult} onDismiss={onDismissResult} />}

      <div className="grid justify-items-center gap-2.5 pt-2">
        <LeagueLadder leagueIndex={leagueIndex} />
        <span className="mt-1 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-full px-3.5 py-1.5 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs font-semibold whitespace-nowrap" role="timer">
          {formatTimeRemaining(getTimeRemaining(clock))}
        </span>
      </div>

      {!hasJoined ? (
        <LockedLeaderboard league={league} pxToJoin={PX_TO_JOIN} onStartPractice={onStartPractice} />
      ) : (
        <>
          <div className="grid justify-items-center gap-2 text-center max-w-[560px] mx-auto">
            <h1 className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Rethink_Sans',Arial,sans-serif] text-[clamp(28px,3.6vw,36px)] font-medium">{league.name}</h1>
            <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[15px] leading-[1.5]">
              {league.promoteCount > 0 && league.demoteCount > 0
                ? `Top ${league.promoteCount} advance · bottom ${league.demoteCount} drop · league ${leagueIndex + 1} of ${leagues.length}`
                : league.promoteCount > 0
                  ? `Top ${league.promoteCount} advance to ${getLeague(leagueIndex + 1).name}`
                  : `Hold your place · bottom ${league.demoteCount} drop`}
            </p>
          </div>

          {/* <PromotionSummary summary={summary} /> */}

          {/* <div className="flex justify-center gap-2" role="group" aria-label="Leaderboard range">
            {TABS.map((item) => {
              const isActive = tab === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setTab(item)}
                  className={
                    isActive
                      ? 'min-h-10 rounded-full border border-[#291c87] [[data-theme=light]_&]:border-[#19079b] bg-[#291c87] [[data-theme=light]_&]:bg-[#19079b] py-[7px] px-[15px] text-[12px] text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] focus-visible:outline-offset-3'
                      : 'min-h-10 rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-transparent py-[7px] px-[15px] text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] focus-visible:outline-offset-3'
                  }
                >
                  {item}
                </button>
              )
            })}
          </div> */}

          <ol className="grid list-none m-0 p-1.5 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-label={`${league.name} standings`}>
            <li className="flex items-center justify-between px-4 pt-2 pb-2.5 text-[10px] font-semibold tracking-[.08em] uppercase text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
              <span>Learner</span>
              <span>px</span>
            </li>
            {visible.map((entry, index) => (
              <li key={entry.id}>
                {tab === 'This week' && index === summary.promotionLineIndex && <ZoneDivider label="Promotion zone ends" color="#04adc0" />}
                {tab === 'This week' && index === summary.demotionLineIndex && <ZoneDivider label="Demotion zone starts" color="#ff676d" />}
                <LeaderboardRow entry={entry} isCurrentUser={entry.id === USER_ID} />
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
