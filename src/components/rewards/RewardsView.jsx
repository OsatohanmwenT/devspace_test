import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { getLeague } from '../../data/leagues'
import { getStandings, getZoneSummary } from '../../lib/leagueSim'
import { getPayoutForRank, MIN_BANK_PAYOUT } from '../../lib/rewardConfig'
import { getReviewHoursRemaining, getPayoutStage, isEligibleForPayout, PROCESSING_WINDOW_HOURS, REVIEW_CHECKLIST, SENT_WINDOW_HOURS } from '../../lib/payouts'
import { getSeasonIndex, getSeasonNumber, now } from '../../lib/week'

function StatCard({ label, value, tone = 'default' }) {
  const toneClass = tone === 'accent'
    ? 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]'
    : 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
  return (
    <div className="grid gap-1 rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1c] [[data-theme=light]_&]:bg-white px-5 py-4">
      <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{label}</span>
      <span className={`font-rethink-sans text-2xl font-semibold tabular-nums ${toneClass}`}>₦{value.toLocaleString()}</span>
    </div>
  )
}

function maskAccount(accountNumber) {
  if (!accountNumber || accountNumber.length < 4) return accountNumber ?? ''
  return `•••• ${accountNumber.slice(-4)}`
}

function PayoutMethodForm({ onSubmit }) {
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const canSubmit = bank.trim() && accountNumber.trim().length >= 4 && accountName.trim()

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        onSubmit({ bank: bank.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() })
      }}
    >
      <label className="grid gap-1 text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        Bank
        <input
          className="min-h-11 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3.5 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"
          value={bank}
          onChange={(event) => setBank(event.target.value)}
          placeholder="e.g. GTBank"
        />
      </label>
      <label className="grid gap-1 text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        Account number
        <input
          className="min-h-11 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3.5 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"
          value={accountNumber}
          onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          placeholder="0123456789"
        />
      </label>
      <label className="grid gap-1 text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        Account name
        <input
          className="min-h-11 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3.5 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
          placeholder="As it appears on the account"
        />
      </label>
      <ActionButton variant="neutral" type="submit" className="min-h-11 text-[15px] font-semibold" disabled={!canSubmit}>
        Save payout method
      </ActionButton>
    </form>
  )
}

const STAGE_LABEL = { processing: 'Processing', sent: 'Sent' }

export default function RewardsView({ progress, leagueIndex, seasonDevyCoins, onSetPayoutMethod, onRequestPayout }) {
  const [clock, setClock] = useState(() => now())
  useEffect(() => {
    const id = window.setInterval(() => setClock(now()), 60 * 1000)
    return () => window.clearInterval(id)
  }, [])

  const { rewardBalance, lifetimeRewards, rewardHistory, pendingPayout, paidPayouts, payoutMethod } = progress
  const league = getLeague(leagueIndex)
  const seasonIndex = getSeasonIndex(clock)

  const standings = seasonDevyCoins > 0 ? getStandings(seasonIndex, leagueIndex, seasonDevyCoins, clock) : []
  const user = standings.length > 0 ? getZoneSummary(standings, leagueIndex).user : null
  const projectedReward = user ? getPayoutForRank(league.id, user.rank) : 0

  const underReview = rewardHistory.filter((entry) => entry.status === 'under_review')
  const pendingAmount = pendingPayout?.amount ?? 0
  const eligible = isEligibleForPayout({ rewardBalance, pendingPayout }, MIN_BANK_PAYOUT)
  const coinsShortOfThreshold = Math.max(0, MIN_BANK_PAYOUT - rewardBalance)

  const confirmedHistory = rewardHistory.filter((entry) => entry.status !== 'under_review')

  return (
    <section className="grid gap-8 max-w-[860px] mx-auto w-full" aria-label="Rewards">
      <div className="grid grid-cols-3 max-[680px]:grid-cols-1 gap-3">
        <StatCard label="Reward balance" value={rewardBalance} tone="accent" />
        <StatCard label="Pending" value={pendingAmount} />
        <StatCard label="Lifetime rewards" value={lifetimeRewards} />
      </div>

      <div className="grid gap-3 rounded-3xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1c] [[data-theme=light]_&]:bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="grid gap-0.5">
            <strong className="text-lg font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</strong>
            <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Season {getSeasonNumber(seasonIndex)}</span>
          </div>
          <span className="rounded-full bg-[#16281f] [[data-theme=light]_&]:bg-[#e7f6ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]">
            Season active
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Current rank: <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{user ? `#${user.rank}` : '—'}</strong>
          </span>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Projected reward: <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">₦{projectedReward.toLocaleString()}</strong>
          </span>
        </div>
        {/* Projected is never money — it's a live estimate from the current
            rank, gone the moment a rank slips, so it never appears in the
            balance cards above until a season actually confirms. */}
        <p className="m-0 text-[13px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
          A projected reward isn't yours yet — it moves with your rank until the season ends and goes through review.
        </p>
      </div>

      {underReview.map((entry) => {
        const hoursLeft = getReviewHoursRemaining(entry, clock)
        return (
          <div key={entry.seasonIndex} className="grid gap-3 rounded-3xl border border-[#4a3f22] bg-[#2a2416] [[data-theme=light]_&]:border-[#f0dfa8] [[data-theme=light]_&]:bg-[#fdf6e3] p-6">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                {entry.leagueName} · Season {getSeasonNumber(entry.seasonIndex)} · ₦{entry.reward.toLocaleString()}
              </strong>
              <span className="rounded-full bg-[#4a3f22]/40 [[data-theme=light]_&]:bg-[#f0dfa8] px-3 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[#f0c964] [[data-theme=light]_&]:text-[#8a5a00]">
                Under review
              </span>
            </div>
            <ul className="grid gap-2 list-none m-0 p-0">
              {REVIEW_CHECKLIST.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                  <svg className="mt-0.5 size-4 flex-none text-[#6ee7a8]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span><strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-medium">{item.label}</strong> — {item.detail}</span>
                </li>
              ))}
            </ul>
            <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              Estimated review window: {hoursLeft > 0 ? `${hoursLeft}h remaining` : 'wrapping up'}
            </p>
          </div>
        )
      })}

      {pendingPayout && (
        <div className="grid gap-2 rounded-3xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1c] [[data-theme=light]_&]:bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <strong className="font-rethink-sans text-2xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">₦{pendingPayout.amount.toLocaleString()}</strong>
            <span className="rounded-full bg-[#262b34] [[data-theme=light]_&]:bg-[#eff4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]">
              {STAGE_LABEL[pendingPayout.status] ?? pendingPayout.status}
            </span>
          </div>
          {payoutMethod && <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{payoutMethod.bank} {maskAccount(payoutMethod.accountNumber)}</span>}
          <span className="text-[13px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
            Expected: {pendingPayout.status === 'processing' ? `within ${PROCESSING_WINDOW_HOURS}h` : `within ${SENT_WINDOW_HOURS}h`}
          </span>
        </div>
      )}

      {!pendingPayout && (
        <div className="grid gap-4 rounded-3xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1c] [[data-theme=light]_&]:bg-white p-6">
          <strong className="text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Payout method</strong>
          {payoutMethod ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[14px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                {payoutMethod.bank} {maskAccount(payoutMethod.accountNumber)}
                <span className="rounded-full bg-[#16281f] [[data-theme=light]_&]:bg-[#e7f6ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.06em] text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]">Verified</span>
              </span>
            </div>
          ) : (
            <PayoutMethodForm onSubmit={onSetPayoutMethod} />
          )}

          <div className="border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] pt-4">
            {eligible ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                  ₦{rewardBalance.toLocaleString()} ready for payout.
                </span>
                <ActionButton
                  variant="primary"
                  className="min-h-10 px-5 text-[14px] font-semibold"
                  onClick={onRequestPayout}
                  disabled={!payoutMethod}
                >
                  Request payout
                </ActionButton>
              </div>
            ) : (
              <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                {rewardBalance === 0
                  ? 'Confirmed rewards will appear here once a season finishes review.'
                  : `₦${coinsShortOfThreshold.toLocaleString()} until bank payout eligibility (₦${MIN_BANK_PAYOUT.toLocaleString()} minimum). Balances roll over across seasons.`}
              </p>
            )}
          </div>
        </div>
      )}

      {(confirmedHistory.length > 0 || paidPayouts.length > 0) && (
        <div className="grid gap-2 rounded-3xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1c] [[data-theme=light]_&]:bg-white p-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 pt-3 pb-2 text-[10px] font-semibold tracking-[.08em] uppercase text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
            <span>Season</span>
            <span>Reward</span>
            <span>Status</span>
          </div>
          {confirmedHistory.slice().reverse().map((entry) => (
            <div key={entry.seasonIndex} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-[#404040] [[data-theme=light]_&]:border-[#ebe9e4] px-4 py-3 text-[14px]">
              <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{entry.leagueName} · Season {getSeasonNumber(entry.seasonIndex)} · #{entry.rank}</span>
              <span className="tabular-nums text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">₦{entry.reward.toLocaleString()}</span>
              <span className="text-[12px] font-semibold uppercase tracking-[.05em] text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]">Confirmed</span>
            </div>
          ))}
          {paidPayouts.slice().reverse().map((payout, index) => (
            <div key={`paid-${index}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-[#404040] [[data-theme=light]_&]:border-[#ebe9e4] px-4 py-3 text-[14px]">
              <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Payout · {new Date(payout.paidAt).toLocaleDateString()}</span>
              <span className="tabular-nums text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">₦{payout.amount.toLocaleString()}</span>
              <span className="text-[12px] font-semibold uppercase tracking-[.05em] text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]">Paid</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
