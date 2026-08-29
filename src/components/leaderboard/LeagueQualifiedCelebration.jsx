import { motion } from 'motion/react'
import { useState } from 'react'
import { getLeague } from '../../data/leagues'
import { getStandings, USER_ID } from '../../lib/leagueSim'
import { getSeasonIndex, now } from '../../lib/week'
import { ActionButton } from '../ui/ActionButton'
import { LeaderboardIntroduction } from './LeaderboardIntroduction'
import { LeaderboardRow } from './LeaderboardRow'
import { TierMedal } from './TierMedal'
import { SeasonDeadline } from './SeasonDeadline'

const PEEK_ROWS = 3

// Earning your first Devy Coins of the season is what puts you on the board,
// and that moment otherwise passed as a toast. This is the payoff screen for
// it: the league you landed in, the deadline that makes it a race, and the
// rows either side of you so the standing is a real place rather than an
// abstraction.
export function LeagueQualifiedCelebration({ leagueIndex = 0, seasonDevyCoins, onClose }) {
  const [showExplainer, setShowExplainer] = useState(false)
  const league = getLeague(leagueIndex)
  const clock = now()

  const standings = getStandings(getSeasonIndex(clock), leagueIndex, seasonDevyCoins, clock)
  const userIndex = standings.findIndex((entry) => entry.id === USER_ID)
  // Window the board on the learner so their own row leads the peek, with the
  // couple of rivals directly behind them for something to chase.
  const peek = userIndex === -1 ? standings.slice(0, PEEK_ROWS) : standings.slice(userIndex, userIndex + PEEK_ROWS)

  if (showExplainer) return <LeaderboardIntroduction onComplete={() => setShowExplainer(false)} />

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label="You joined this season’s league"
    >
      <motion.main
        className="grid w-full max-w-[520px] justify-items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <TierMedal league={league} state="current" size={104} />
        </motion.div>

        <h1 className="mt-6 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">Welcome to Leagues!</h1>
        <p className="m-0 max-w-[40ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          You just qualified for <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</strong>. Keep earning Devy Coins to rise the ranks.
        </p>
        <SeasonDeadline timestamp={clock} className="mt-4" />

        <div className="mt-8 w-full rounded-2xl border border-[#404040] bg-[#1f1f1f] p-1.5 text-left [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white" aria-label="Your place on the board">
          {peek.map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} isCurrentUser={entry.id === USER_ID} />
          ))}
        </div>

        <ActionButton variant="neutral" className="mt-8 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={() => setShowExplainer(true)}>
          What are leagues?
        </ActionButton>
        <ActionButton className="mt-3 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={onClose} autoFocus>
          Continue
        </ActionButton>
      </motion.main>
    </section>
  )
}
