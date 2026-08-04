import { leagues } from '../../data/leagues'
import { TierMedal } from './TierMedal'

// Tiers shrink and fade with distance from the current one, so the ladder reads
// as a road ahead rather than a row of equal chips.
const SIZE_BY_DISTANCE = [92, 62, 48, 38]
const OPACITY_BY_DISTANCE = [1, 0.7, 0.45, 0.28]

function at(scale, distance) {
  return scale[Math.min(distance, scale.length - 1)]
}

export function LeagueLadder({ leagueIndex }) {
  return (
    <ul className="flex items-center justify-center gap-3 max-[680px]:gap-2 m-0 px-2 py-2 list-none overflow-x-auto" aria-label="League progression">
      {leagues.map((league, index) => {
        const distance = Math.abs(index - leagueIndex)
        const state = index === leagueIndex ? 'current' : index < leagueIndex ? 'unlocked' : 'locked'
        const shortName = league.name.replace(' League', '')

        return (
          <li className="grid justify-items-center gap-2 flex-none" key={league.id} style={{ opacity: at(OPACITY_BY_DISTANCE, distance) }}>
            <TierMedal league={league} state={state} size={at(SIZE_BY_DISTANCE, distance)} />
            {state === 'current' && (
              <small className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[11px] font-semibold tracking-[.06em] uppercase">{shortName}</small>
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
