import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { getLeague } from '../../data/leagues'
import { getStandings, USER_ID } from '../../lib/leagueSim'
import { getSeasonIndex, now } from '../../lib/season'
import { ActionButton } from '../ui/ActionButton'
import { LeaderboardIntroduction } from './LeaderboardIntroduction'
import { LeaderboardRow } from './LeaderboardRow'
import { SeasonDeadline } from './SeasonDeadline'
import { TierMedal } from './TierMedal'
import { GameIcon } from '../ui/GameIcon'

const PROMOTION_ROWS = 5

// Earning your first coin of the season is what puts you on the board, and
// that moment otherwise passed as a toast. This is the payoff screen for it:
// the league you landed in, the deadline that makes it a race, and the rows
// either side of you so the standing is a real place rather than an
// abstraction.
export function LeagueQualifiedCelebration({ leagueIndex = 0, seasonCoins, onClose }) {
  const [showExplainer, setShowExplainer] = useState(false)
  const [hasPromoted, setHasPromoted] = useState(false)
  const league = getLeague(leagueIndex)
  const clock = now()

  const standings = getStandings(getSeasonIndex(clock), leagueIndex, seasonCoins, clock)
  const userIndex = standings.findIndex((entry) => entry.id === USER_ID)
  const userEntry = standings[userIndex]
  const passedEntries = userEntry ? standings.slice(userIndex + 1, userIndex + PROMOTION_ROWS + 1) : []
  const canShowPromotion = Boolean(userEntry && passedEntries.length)
  const finalRows = userEntry
    ? [userEntry, ...passedEntries.map((entry, index) => ({ ...entry, rank: userEntry.rank + index + 1 }))]
    : standings.slice(0, PROMOTION_ROWS + 1)
  const rows = canShowPromotion && !hasPromoted
    ? [
        ...passedEntries.map((entry, index) => ({ ...entry, rank: userEntry.rank + index })),
        { ...userEntry, rank: userEntry.rank + passedEntries.length },
      ]
    : finalRows

  useEffect(() => {
    const timer = window.setTimeout(() => setHasPromoted(true), 700)
    return () => window.clearTimeout(timer)
  }, [])

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
          className="relative"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <TierMedal league={league} state="current" size={104} />
          {/* The coins that got them here, spilling in beside the medal. */}
          <motion.span
            className="absolute -right-11 -bottom-2 block"
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <GameIcon name="coin-stack" className="size-[64px]" />
          </motion.span>
        </motion.div>

        <h1 className="mt-6 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">Welcome to Leagues!</h1>
        <p className="m-0 max-w-[40ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          You just qualified for <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</strong>. Keep earning Devy Coins to rise the ranks.
        </p>
        <SeasonDeadline timestamp={clock} className="mt-4" />

        <motion.div
          className="relative mt-8 h-[216px] w-full overflow-hidden rounded-2xl border border-[#404040] bg-[#1f1f1f] p-1.5 text-left [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          aria-label="Your place on the board"
        >
          <motion.div
            initial={false}
            animate={{ y: hasPromoted || !canShowPromotion ? 0 : -204 }}
            transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {rows.map((entry) => (
              <motion.div key={entry.id} layout className={entry.id === USER_ID ? 'relative z-10' : undefined} transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}>
                <LeaderboardRow entry={entry} isCurrentUser={entry.id === USER_ID} />
              </motion.div>
            ))}
          </motion.div>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-7 bg-gradient-to-b from-[#1f1f1f] to-transparent [[data-theme=light]_&]:from-white" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 bg-gradient-to-t from-[#1f1f1f] to-transparent [[data-theme=light]_&]:from-white" aria-hidden="true" />
        </motion.div>

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
