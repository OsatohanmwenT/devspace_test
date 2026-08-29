import { Avatar } from '../ui/Avatar'
import { ActionButton } from '../ui/ActionButton'
import { Drawer } from '../ui/Drawer'
import { getLeague } from '../../data/leagues'

function Stat({ label, value }) {
  return (
    <div className="grid gap-0.5 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#f7f7f5] px-3.5 py-2.5">
      <dt className="text-[10px] font-bold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{label}</dt>
      <dd className="m-0 text-[15px] font-semibold tabular-nums text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{value}</dd>
    </div>
  )
}

// Clicking a name in the standings shouldn't leave the standings — this is the
// "don't immediately leave" drawer from spec section 11. Rivals in this demo
// are simulated (name/role/pace/consistency only, no real completed lessons
// or portfolio), so their "proof" is limited to what the season actually
// tracked; the real portfolio hop only applies to the learner's own row.
export function CompetitorDrawer({ entry, leagueIndex, streakDays, onViewOwnProfile, onClose }) {
  const league = getLeague(leagueIndex)
  const isCurrentUser = entry.isCurrentUser

  return (
    <Drawer id="competitor-drawer" title={entry.name} subtitle={entry.role} onClose={onClose} labelledBy="competitor-drawer-title">
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <Avatar name={entry.name} avatarStyle={entry.avatarStyle} avatarSeed={entry.id} size="lg" />
          <div className="grid gap-1">
            <span className="flex items-center gap-2 text-[17px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
              {entry.name}
              {entry.tag && <span className="rounded-full bg-[#2a293c] [[data-theme=light]_&]:bg-[#dde8f7] px-2 py-0.5 text-[10px] font-bold tracking-[.04em] text-[#d3e2ff] [[data-theme=light]_&]:text-[#073c72]">{entry.tag}</span>}
            </span>
            <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{league.name} · {entry.role}</span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2.5">
          <Stat label="Rank" value={`#${entry.rank}`} />
          <Stat label="Season Devy Coins" value={`${entry.score.toLocaleString()} 🪙`} />
          {isCurrentUser && <Stat label="Streak" value={`${streakDays} ${streakDays === 1 ? 'day' : 'days'}`} />}
          <Stat label="Current reward" value={entry.reward > 0 ? `₦${entry.reward.toLocaleString()}` : 'Not yet'} />
        </dl>

        <div className="grid gap-2">
          <strong className="text-[13px] font-semibold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Recent public proof</strong>
          {isCurrentUser ? (
            <p className="m-0 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              Your finished lessons and practice results are collected on your own portfolio.
            </p>
          ) : (
            <p className="m-0 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              This learner's full activity history isn't available to preview here — only what the season itself tracks (rank and Season Devy Coins, above) is shown.
            </p>
          )}
        </div>

        {isCurrentUser && (
          <ActionButton variant="neutral" className="min-h-11 w-full text-[15px] font-semibold" onClick={onViewOwnProfile}>
            View Proof Book
          </ActionButton>
        )}
      </div>
    </Drawer>
  )
}
