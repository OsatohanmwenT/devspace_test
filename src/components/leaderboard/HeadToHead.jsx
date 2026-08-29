import { getLiveH2HStanding } from '../../lib/h2h'
import { formatTimeRemaining, getTimeRemaining } from '../../lib/week'
import { BackLink } from '../ui/NavArrowLink'

const RESULT_LABEL = { win: 'Won', draw: 'Drew', loss: 'Lost' }
const RESULT_COLOR = {
  win: 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]',
  draw: 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]',
  loss: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]',
}

function MatchRow({ match, onShare }) {
  return (
    <li className="grid gap-1.5 border-t border-[#404040] py-3 first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">vs. {match.opponentName}</span>
        <span className={`text-[13px] font-semibold ${RESULT_COLOR[match.result]}`}>{RESULT_LABEL[match.result]}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          {match.userCoins.toLocaleString()} 🪙 vs {match.opponentCoins.toLocaleString()} 🪙 · +{match.pointsEarned} pts
        </span>
        {match.result === 'win' && (
          <button
            type="button"
            onClick={() => onShare(match)}
            className="text-[12px] font-medium text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]"
          >
            Share
          </button>
        )}
      </div>
    </li>
  )
}

export function HeadToHead({ h2h, seasonCoins, clock, onBack, onShareWin }) {
  const live = getLiveH2HStanding(h2h, seasonCoins, clock)
  const remaining = formatTimeRemaining(getTimeRemaining(clock))
  const userAhead = live.userCoins > live.opponentCoins
  const tied = live.userCoins === live.opponentCoins

  return (
    <div className="grid w-full max-w-[860px] mx-auto gap-6">
      <BackLink onClick={onBack} className="justify-self-start">Back to your league</BackLink>

      <div className="grid gap-4 rounded-3xl bg-[#1a1a1c] p-6 text-center [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)]">
        <span className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">This week's matchup</span>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="grid gap-1">
            <strong className="text-2xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{live.userCoins.toLocaleString()}</strong>
            <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">You</span>
          </div>
          <span className="text-[13px] font-semibold text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">vs</span>
          <div className="grid gap-1">
            <strong className="text-2xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{live.opponentCoins.toLocaleString()}</strong>
            <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{live.opponentName}</span>
          </div>
        </div>
        <span className="text-[13px] font-medium text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]">
          {tied ? "It's tied" : userAhead ? "You're ahead" : `${live.opponentName} is ahead`} · {remaining} in the window
        </span>
        <span className="text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
          Win = 3 pts · Draw = 1 pt · Loss = 0 pts. Rivalry only — never changes your official coins or rank.
        </span>
      </div>

      <div className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1a1a1c] p-5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Season points</h2>
          <strong className="text-[15px] font-semibold text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">{h2h.points ?? 0} pts</strong>
        </div>
        {(!h2h.history || h2h.history.length === 0) ? (
          <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No matches finished yet — check back after this week ends.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {h2h.history.map((match) => (
              <MatchRow key={match.weekIndex} match={match} onShare={onShareWin} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
