import { useState } from 'react'
import { getH2HRecord, getLiveH2HStanding, getOpponentCandidates } from '../../lib/h2h'
import { formatTimeRemaining, getTimeRemaining } from '../../lib/week'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { BackLink } from '../ui/NavArrowLink'
import { CoinIcon } from '../ui/GameIcon'

const RESULT_LABEL = { win: 'Won', draw: 'Drew', loss: 'Lost' }
const RESULT_COLOR = {
  win: 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]',
  draw: 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]',
  loss: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]',
}

function ChooseOpponentDrawer({ weekIndex, currentOpponentId, onClose, onChoose }) {
  const candidates = getOpponentCandidates(weekIndex)

  return (
    <Drawer id="choose-h2h-opponent" title="Choose your rival" subtitle="Picks apply to this week only — next week reshuffles." onClose={onClose} labelledBy="choose-h2h-opponent-title">
      <ul className="m-0 grid list-none gap-2 p-0">
        {candidates.map((rival) => {
          const isCurrent = rival.id === currentOpponentId
          return (
            <li key={rival.id}>
              <button
                type="button"
                onClick={() => {
                  onChoose(rival.id)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  isCurrent
                    ? 'border-[#88bdf2] bg-[#1f2a3d] [[data-theme=light]_&]:border-[#3d77eb] [[data-theme=light]_&]:bg-[#eaf1ff]'
                    : 'border-[#404040] bg-[#1a1a1c] hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#d4d4d4]'
                }`}
              >
                <Avatar name={rival.name} avatarSeed={rival.id} size="md" />
                <div className="grid min-w-0">
                  <span className="truncate text-[14px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{rival.name}</span>
                  <span className="truncate text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{rival.role}</span>
                </div>
                {isCurrent && <span className="ml-auto flex-none text-[12px] font-semibold text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]">Current</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </Drawer>
  )
}

function RecordSummary({ history }) {
  const record = getH2HRecord(history)
  if (record.win + record.draw + record.loss === 0) return null

  const streakLabel = record.streak.count > 1 ? `${RESULT_LABEL[record.streak.result]?.toLowerCase()} ${record.streak.count} in a row` : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#404040] bg-[#1a1a1c] px-5 py-3.5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
      <span className="text-[13px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        Season record: <strong>{record.win}W</strong> · {record.draw}D · {record.loss}L
      </span>
      {streakLabel && (
        <span className="text-[12px] font-semibold text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">On a {streakLabel} streak</span>
      )}
    </div>
  )
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
          {match.userCoins.toLocaleString()} <CoinIcon /> vs {match.opponentCoins.toLocaleString()} <CoinIcon /> · +{match.pointsEarned} pts
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

export function HeadToHead({ h2h, seasonCoins, clock, onBack, onShareWin, onChooseOpponent }) {
  const live = getLiveH2HStanding(h2h, seasonCoins, clock)
  const remaining = formatTimeRemaining(getTimeRemaining(clock))
  const userAhead = live.userCoins > live.opponentCoins
  const tied = live.userCoins === live.opponentCoins
  const [choosingOpponent, setChoosingOpponent] = useState(false)

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
        {onChooseOpponent && (
          <ActionButton variant="neutral" className="min-h-10 justify-self-center px-4 text-sm font-medium" onClick={() => setChoosingOpponent(true)}>
            Choose your rival
          </ActionButton>
        )}
      </div>

      <RecordSummary history={h2h.history} />

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

      {choosingOpponent && (
        <ChooseOpponentDrawer
          weekIndex={live.weekIndex}
          currentOpponentId={live.opponentId}
          onClose={() => setChoosingOpponent(false)}
          onChoose={onChooseOpponent}
        />
      )}
    </div>
  )
}
