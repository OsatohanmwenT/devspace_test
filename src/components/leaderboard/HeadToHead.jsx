import { useState } from 'react'
import { rivals } from '../../data/rivals'
import { getH2HRecord, getLiveH2HStanding, getOpponentCandidates, getTypicalWeekCoins } from '../../lib/h2h'
import { formatTimeRemaining, getTimeRemaining, getWeekStartFromIndex } from '../../lib/week'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { BackLink } from '../ui/NavArrowLink'
import { CoinIcon } from '../ui/GameIcon'

const RESULT_LABEL = { win: 'Won', draw: 'Drew', loss: 'Lost' }
const RESULT_PILL = {
  win: 'bg-[#04adc0]/15 text-[#04adc0] [[data-theme=light]_&]:bg-[#e3f6f8] [[data-theme=light]_&]:text-[#065f6b]',
  draw: 'bg-[#2a2a2e] text-[#9a9a9d] [[data-theme=light]_&]:bg-[#eeeeeb] [[data-theme=light]_&]:text-[#686968]',
  loss: 'bg-[#ff676d]/15 text-[#ff676d] [[data-theme=light]_&]:bg-[#fdecec] [[data-theme=light]_&]:text-[#b3272d]',
}
const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const STRONG = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const CARD = 'rounded-3xl bg-[#1a1a1c] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)]'

const firstName = (name) => name.split(' ')[0]

function weekLabel(weekIndex) {
  // The window opens Sunday 23:00, so the Monday after is the week people
  // actually recognise.
  const start = new Date(getWeekStartFromIndex(weekIndex) + 60 * 60 * 1000)
  return `Week of ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

// One sentence that answers "am I winning, and what would change it?" —
// the raw scores alone make the learner do the subtraction.
function matchupStatus({ userCoins, opponentCoins, opponentName }) {
  const gap = Math.abs(userCoins - opponentCoins)
  const name = firstName(opponentName)
  if (userCoins === 0 && opponentCoins === 0) return { text: 'Nobody’s on the board yet — your first coin takes the lead.', tone: 'text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]' }
  if (userCoins === opponentCoins) return { text: `Level at ${userCoins} — the next coin takes it.`, tone: 'text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]' }
  if (userCoins > opponentCoins) return { text: `You lead ${name} by ${gap}`, tone: 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]' }
  return { text: `${gap} behind ${name}`, tone: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]' }
}

function Contender({ name, role, coins, avatar, align }) {
  return (
    <div className={`grid min-w-0 gap-2 ${align === 'end' ? 'justify-items-end text-right' : 'justify-items-start text-left'}`}>
      {avatar}
      <div className="grid min-w-0 gap-0.5">
        <span className={`truncate text-[14px] font-semibold ${STRONG}`}>{name}</span>
        {role && <span className={`truncate text-[12px] ${MUTED}`}>{role}</span>}
      </div>
      <strong className={`flex items-center gap-1.5 text-3xl font-semibold tabular-nums ${STRONG}`}>
        {coins.toLocaleString()}
        <CoinIcon className="text-[18px]" />
      </strong>
    </div>
  )
}

// Share of the coins earned this week, so the bar reads as a tug-of-war
// rather than two unrelated progress meters. Even split before anyone scores.
function TugBar({ userCoins, opponentCoins }) {
  const total = userCoins + opponentCoins
  const userShare = total === 0 ? 50 : Math.round((userCoins / total) * 100)
  return (
    <div className="relative h-2.5 overflow-hidden rounded-full bg-[#ff676d]/70 [[data-theme=light]_&]:bg-[#f3a5a8]" aria-hidden="true">
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-[#04adc0] transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${userShare}%` }}
      />
      <span className="absolute inset-y-[-2px] left-1/2 w-px bg-[#f4f4f2]/40 [[data-theme=light]_&]:bg-neutral-800/30" />
    </div>
  )
}

function ChooseOpponentDrawer({ weekIndex, leagueIndex, currentOpponentId, onClose, onChoose }) {
  const candidates = getOpponentCandidates(weekIndex)

  return (
    <Drawer
      id="choose-h2h-opponent"
      title="Choose your rival"
      subtitle="One pick per week — it locks in until the Sunday reset."
      onClose={onClose}
      labelledBy="choose-h2h-opponent-title"
    >
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
                <div className="grid min-w-0 flex-1">
                  <span className={`truncate text-[14px] font-semibold ${STRONG}`}>{rival.name}</span>
                  <span className={`truncate text-[12px] ${MUTED}`}>
                    Usually ~{getTypicalWeekCoins(rival, leagueIndex)} <CoinIcon /> a week
                  </span>
                </div>
                {isCurrent && <span className="flex-none text-[12px] font-semibold text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]">Drawn for you</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </Drawer>
  )
}

function MatchRow({ match, onShare }) {
  return (
    <li className="flex items-center gap-3 border-t border-[#404040] py-3 first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
      <Avatar name={match.opponentName} avatarSeed={match.opponentId} size="sm" />
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className={`truncate text-[14px] font-medium ${STRONG}`}>vs {match.opponentName}</span>
        <span className={`text-[12px] ${MUTED}`}>
          {weekLabel(match.weekIndex)} · <span className="tabular-nums">{match.userCoins}–{match.opponentCoins}</span>
        </span>
      </div>
      {match.result === 'win' && (
        <button
          type="button"
          onClick={() => onShare(match)}
          className="flex-none text-[12px] font-medium text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]"
        >
          Share
        </button>
      )}
      <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[.04em] uppercase ${RESULT_PILL[match.result]}`}>
        {RESULT_LABEL[match.result]} · +{match.pointsEarned}
      </span>
    </li>
  )
}

function SeasonRecord({ history, seasonIndex, onShareWin }) {
  const record = getH2HRecord(history, seasonIndex)
  const played = record.win + record.draw + record.loss
  const streakLabel = record.streak.count > 1 && record.streak.result === 'win' ? `${record.streak.count} wins in a row` : null

  return (
    <div className={`grid gap-4 p-5 ${CARD}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-0.5">
          <span className={`text-[11px] font-semibold uppercase tracking-[.08em] ${MUTED}`}>This season</span>
          <strong className={`text-2xl font-semibold tabular-nums ${STRONG}`}>{record.points} pts</strong>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold">
          <span className={`rounded-full px-2.5 py-1 ${RESULT_PILL.win}`}>{record.win}W</span>
          <span className={`rounded-full px-2.5 py-1 ${RESULT_PILL.draw}`}>{record.draw}D</span>
          <span className={`rounded-full px-2.5 py-1 ${RESULT_PILL.loss}`}>{record.loss}L</span>
        </div>
      </div>
      {streakLabel && <span className="text-[13px] font-semibold text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">🔥 {streakLabel}</span>}
      {played === 0 ? (
        <p className={`m-0 text-[13px] ${MUTED}`}>No matches settled this season yet — your first result lands at Sunday’s reset.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {record.matches.map((match) => (
            <MatchRow key={match.weekIndex} match={match} onShare={onShareWin} />
          ))}
        </ul>
      )}
    </div>
  )
}

export function HeadToHead({ h2h, seasonCoins, seasonIndex, leagueIndex = 0, clock, user = {}, onBack, onShareWin, onChooseOpponent, onStartPractice, hasPractice = false }) {
  const live = getLiveH2HStanding(h2h, seasonCoins, clock, leagueIndex)
  const remaining = formatTimeRemaining(getTimeRemaining(clock))
  const status = matchupStatus(live)
  const opponent = rivals.find((rival) => rival.id === live.opponentId)
  const isLockedIn = Boolean(h2h.chosenOpponentId)
  const [choosingOpponent, setChoosingOpponent] = useState(false)

  return (
    <div className="grid w-full max-w-[860px] mx-auto gap-6">
      <BackLink onClick={onBack} className="justify-self-start">Back to your league</BackLink>

      <section className={`grid gap-5 p-6 max-[680px]:p-4 ${CARD}`} aria-label="This week's matchup">
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[11px] font-semibold uppercase tracking-[.08em] ${MUTED}`}>This week’s matchup</span>
          <span className={`rounded-full bg-[#262626] px-2.5 py-1 text-[12px] font-medium [[data-theme=light]_&]:bg-[#f0f0ee] ${MUTED}`}>{remaining}</span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-4">
          <Contender
            name="You"
            role={user.role}
            coins={live.userCoins}
            avatar={<Avatar name={user.name ?? 'You'} photo={user.photo} avatarStyle={user.avatarStyle} avatarSeed="you" size="lg" />}
          />
          <span className={`pb-2 text-[13px] font-semibold ${MUTED}`}>vs</span>
          <Contender
            name={live.opponentName}
            role={live.opponentRole}
            coins={live.opponentCoins}
            align="end"
            avatar={<Avatar name={live.opponentName} avatarSeed={live.opponentId} size="lg" />}
          />
        </div>

        <div className="grid gap-2">
          <TugBar userCoins={live.userCoins} opponentCoins={live.opponentCoins} />
          <p className={`m-0 flex items-center gap-1 text-[14px] font-semibold ${status.tone}`} aria-live="polite">
            {status.text}
            {live.userCoins !== live.opponentCoins && <CoinIcon />}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPractice && onStartPractice && (
            <ActionButton className="min-h-10 px-4 text-sm font-medium" onClick={onStartPractice}>
              {live.userCoins < live.opponentCoins ? 'Close the gap' : 'Earn more coins'}
            </ActionButton>
          )}
          {onChooseOpponent && !isLockedIn && (
            <ActionButton variant="neutral" className="min-h-10 px-4 text-sm font-medium" onClick={() => setChoosingOpponent(true)}>
              Choose your rival
            </ActionButton>
          )}
          {isLockedIn && (
            <span className={`text-[13px] ${MUTED}`}>
              You picked {opponent ? firstName(opponent.name) : 'this rival'} — locked in until Sunday.
            </span>
          )}
        </div>

        <p className={`m-0 border-t border-[#2e2e30] pt-4 text-[12px] [[data-theme=light]_&]:border-[#ebe9e4] ${MUTED}`}>
          Most verified coins earned this week wins. Win 3 pts · Draw 1 · Loss 0. Rivalry only — never changes your official coins or rank.
        </p>
      </section>

      <SeasonRecord history={h2h.history} seasonIndex={seasonIndex} onShareWin={onShareWin} />

      {choosingOpponent && (
        <ChooseOpponentDrawer
          weekIndex={live.weekIndex}
          leagueIndex={leagueIndex}
          currentOpponentId={live.opponentId}
          onClose={() => setChoosingOpponent(false)}
          onChoose={onChooseOpponent}
        />
      )}
    </div>
  )
}
