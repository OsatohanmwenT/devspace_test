import { leagues } from '../../data/leagues';
import { TierMedal } from './TierMedal';

const SIZE_BY_DISTANCE = [88, 52, 38, 30]
const OPACITY_BY_DISTANCE = [1, 0.68, 0.42, 0.24]

function at(scale, distance) {
  return scale[Math.min(distance, scale.length - 1)]
}

export function LeagueLadder({ leagueIndex }) {
  const currentLeague = leagues[leagueIndex]

  return (
    <div className="flex w-full items-center py-3 overflow-hidden" aria-label="League progression" role="list">
      <div className="flex min-w-0 flex-1 justify-end gap-4 max-[680px]:gap-2">
        {leagues.slice(0, leagueIndex).map((league, index) => {
          const distance = leagueIndex - index
          const shortName = league.name.replace(' League', '')

          return (
            <div className="grid w-[76px] flex-none justify-items-center gap-2" key={league.id} role="listitem" style={{ opacity: at(OPACITY_BY_DISTANCE, distance) }}>
              <TierMedal league={league} state="unlocked" size={at(SIZE_BY_DISTANCE, distance)} />
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{shortName} — unlocked</span>
            </div>
          )
        })}
      </div>
      <div className="grid w-[88px] flex-none justify-items-center gap-2" role="listitem">
        <TierMedal league={currentLeague} state="current" size={SIZE_BY_DISTANCE[0]} />
        <small className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[11px] font-semibold tracking-[.06em] uppercase">{currentLeague.name.replace(' League', '')}</small>
        <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{currentLeague.name} — your league</span>
      </div>
      <div className="flex min-w-0 flex-1 gap-4 max-[680px]:gap-2">
        {leagues.slice(leagueIndex + 1).map((league, offset) => {
          const distance = offset + 1
          const shortName = league.name.replace(' League', '')

          return (
            <div className="grid w-[76px] flex-none justify-items-center gap-2" key={league.id} role="listitem" style={{ opacity: at(OPACITY_BY_DISTANCE, distance) }}>
              <TierMedal league={league} state="locked" size={at(SIZE_BY_DISTANCE, distance)} />
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{shortName} — locked</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
