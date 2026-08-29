import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { BackLink } from '../ui/NavArrowLink'
import { MIN_PAYOUT_THRESHOLD } from '../../lib/rewards'

function naira(amount) {
  return `₦${amount.toLocaleString()}`
}

// The spec's full lifecycle (Projected → Season Closed → Under Review →
// Confirmed → Reward Balance → Processing → Sent → Paid) compresses here
// since there's no backend to actually review anything against — every
// step this checklist shows already happened by the time a reward reaches
// `seasonRewardHistory` (see main.jsx's season-resolution effect), so it's
// narrated as complete rather than making a demo learner wait on a fake
// multi-day hold.
function SeasonRewardRow({ entry }) {
  return (
    <li className="grid gap-1 border-t border-[#404040] py-3 first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          {entry.leagueId.charAt(0).toUpperCase() + entry.leagueId.slice(1)} · rank #{entry.rank}
        </span>
        <span className="text-[14px] font-semibold text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">{naira(entry.amount)}</span>
      </div>
      <span className="text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        Projected → Season closed → Confirmed — added to your Reward Balance
      </span>
    </li>
  )
}

function PayoutHistoryRow({ entry }) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-[#404040] py-3 first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
      <div className="grid gap-0.5">
        <span className="text-[14px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{naira(entry.amount)}</span>
        <span className="text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{new Date(entry.paidAt).toLocaleDateString()}</span>
      </div>
      <span className="rounded-full bg-[rgba(4,173,192,0.15)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.04em] text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">Paid</span>
    </li>
  )
}

function PayoutProfileForm({ payoutProfile, onSave }) {
  const [bankName, setBankName] = useState(payoutProfile?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState(payoutProfile?.accountNumber ?? '')
  const [accountName, setAccountName] = useState(payoutProfile?.accountName ?? '')

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() })
      }}
    >
      <label className="grid gap-1.5">
        <span className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Bank name</span>
        <input
          value={bankName}
          onChange={(event) => setBankName(event.target.value)}
          className="rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-2.5 text-[14px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Account number</span>
        <input
          value={accountNumber}
          onChange={(event) => setAccountNumber(event.target.value)}
          inputMode="numeric"
          className="rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-2.5 text-[14px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Account name</span>
        <input
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
          className="rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-2.5 text-[14px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
        />
      </label>
      <p className="m-0 text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
        Demo only — these details are stored on this device and never sent anywhere. The real payout rail is Kora, wired up later.
      </p>
      <ActionButton type="submit" variant="neutral" className="min-h-10 px-4 text-sm font-medium">Save payout details</ActionButton>
    </form>
  )
}

export function PayoutCenter({ rewardBalance = 0, lifetimeRewards = 0, seasonRewardHistory = [], payoutHistory = [], payoutProfile, onBack, onRequestPayout, onSavePayoutProfile }) {
  const canWithdraw = rewardBalance >= MIN_PAYOUT_THRESHOLD
  const remaining = Math.max(0, MIN_PAYOUT_THRESHOLD - rewardBalance)

  return (
    <div className="grid w-full max-w-[860px] mx-auto gap-6">
      <BackLink onClick={onBack} className="justify-self-start">Back to Settings</BackLink>

      <div className="grid gap-3 rounded-3xl bg-[#1a1a1c] p-6 text-center [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)]">
        <span className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Reward Balance</span>
        <strong className="text-4xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{naira(rewardBalance)}</strong>
        <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          {canWithdraw ? 'Eligible for bank payout.' : `${naira(remaining)} until bank payout eligibility.`}
        </span>
        <ActionButton
          className="mt-2 min-h-12 justify-self-center px-8"
          disabled={!canWithdraw}
          onClick={onRequestPayout}
        >
          Request payout
        </ActionButton>
        <span className="text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Lifetime rewards: {naira(lifetimeRewards)} · minimum payout {naira(MIN_PAYOUT_THRESHOLD)}</span>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[#404040] bg-[#1a1a1c] p-5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <h2 className="m-0 text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Payout details</h2>
        <PayoutProfileForm payoutProfile={payoutProfile} onSave={onSavePayoutProfile} />
      </div>

      <div className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1a1a1c] p-5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <h2 className="m-0 text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Recent season rewards</h2>
        {seasonRewardHistory.length === 0 ? (
          <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No rewards yet — finish a season inside a reward band to earn one.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {seasonRewardHistory.map((entry, index) => <SeasonRewardRow key={`${entry.seasonIndex}-${index}`} entry={entry} />)}
          </ul>
        )}
      </div>

      <div className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1a1a1c] p-5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <h2 className="m-0 text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Payout history</h2>
        {payoutHistory.length === 0 ? (
          <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No payouts yet.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {payoutHistory.map((entry) => <PayoutHistoryRow key={entry.id} entry={entry} />)}
          </ul>
        )}
      </div>
    </div>
  )
}
