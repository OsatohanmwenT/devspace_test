import { leagues } from '../../data/leagues'
import { TierMedal } from './TierMedal'

// Tiers shrink and fade with distance from the current one, so the ladder reads
// as a road ahead rather than a row of equal chips.
//
// The ladder is the page's identity — Duolingo and Uxcel both lead with it — so
// the current tier stays prominent while the locked ones recede hard. 92px was
// too much (it pushed the first row to 68% of the viewport); 46px read as a
// footnote. This keeps the hero without burying the board.
const SIZE_BY_DISTANCE = [76, 44, 32, 26]
const OPACITY_BY_DISTANCE = [1, 0.68, 0.42, 0.24]

function at(scale, distance) {
  return scale[Math.min(distance, scale.length - 1)]
}

export function LeagueLadder({ leagueIndex }) {
  return (
    <ul className="flex items-center justify-center gap-4 max-[680px]:gap-2 m-0 px-2 py-3 list-none overflow-x-auto" aria-label="League progression">
      {leagues.map((league, index) => {
        const distance = Math.abs(index - leagueIndex)
        const state = index === leagueIndex ? 'current' : index < leagueIndex ? 'unlocked' : 'locked'
        const shortName = league.name.replace(' League', '')

        return (
          <li className="grid justify-items-center gap-2 flex-none" key={league.id} style={{ opacity: at(OPACITY_BY_DISTANCE, distance) }}>
            <TierMedal league={league} state={state} size={at(SIZE_BY_DISTANCE, distance)} />
            {state === 'current' && (
              <small className="text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] text-[11px] font-semibold tracking-[.06em] uppercase">{shortName}</small>
            )}
            <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">
              {shortName}{state === 'current' ? ' — your league' : state === 'locked' ? ' — locked' : ' — unlocked'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
