import { league, leagueLadder, rankedEntries, currentUserEntry } from '../../data/leaderboard'
import { LeagueHeader } from './LeagueHeader'
import { LeagueBadgeRow } from './LeagueBadgeRow'
import { LeaderboardRow } from './LeaderboardRow'

export default function LeaderboardView() {
  return (
    <section className="grid gap-7" aria-label="Leaderboard">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-3xl font-medium tracking-[-.06em]">Leaderboard</h1>
        <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[17px] leading-[1.5]">Earn pixels to climb the league and unlock the next one.</p>
      </header>

      <div className="grid gap-5 p-6 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white">
        <LeagueHeader league={league} />
        <LeagueBadgeRow ladder={leagueLadder} />
      </div>

      <ol className="grid list-none m-0 p-1.5 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-label={`${league.name} standings`}>
        {rankedEntries.map((entry, index) => (
          <li key={entry.id}>
            {index === league.promoteCount && (
              <div
                className="flex items-center gap-2.5 mx-1 my-1.5 p-0 text-[#04adc0] text-[11px] font-bold tracking-[.08em] uppercase after:content-[''] after:flex-1 after:h-px after:bg-[#04adc0] after:opacity-50 before:content-[''] before:flex-1 before:h-px before:bg-[#04adc0] before:opacity-50"
                role="separator"
                aria-label="Promotion zone"
              >
                Promotion Zone
              </div>
            )}
            <LeaderboardRow entry={entry} isCurrentUser={entry.id === currentUserEntry.id} />
          </li>
        ))}
      </ol>
    </section>
  )
}

