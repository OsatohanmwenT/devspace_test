import { useState } from 'react'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { getRivalProfile } from '../../lib/rivalProfile'

function Stat({ label, value }) {
  return (
    <div className="grid gap-0.5 rounded-xl border border-[#404040] bg-[#1a1a1c] px-3.5 py-3 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
      <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{label}</span>
      <span className="text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{value}</span>
    </div>
  )
}

// Only rendered when the viewer owns the league this drawer was opened
// from — the official board and joined-by-code leagues have no owner, so
// this section is opt-in via the `onRemove` prop rather than always present.
function OwnerActions({ name, onRemove }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="grid gap-2 rounded-xl border border-[#404040] bg-[#1a1a1c] px-4 py-3.5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
      <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Owner actions</span>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Remove {name} from this league?</span>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-[#ff676d] px-2.5 py-1.5 text-[12px] font-semibold text-[#ff676d] hover:bg-[#ff676d]/10 [[data-theme=light]_&]:border-[#b3272d] [[data-theme=light]_&]:text-[#b3272d]"
          >
            Yes, remove
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-[#404040] px-2.5 py-1.5 text-[12px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="justify-self-start rounded-lg border border-[#404040] px-3 py-2 text-[12px] font-medium text-[#9a9a9d] transition-colors hover:border-[#5a5a60] hover:text-[#f4f4f2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968]"
        >
          Remove from league
        </button>
      )}
    </div>
  )
}

// A right-placement Drawer, same pattern NotesDrawer already uses — the
// point is the standings list stays visible behind it. There's no real
// "Proof Book" for a simulated rival to link to, so that CTA from the spec
// is dropped rather than pointing at a page that doesn't exist.
export function CompetitorDrawer({ entry, rival, league, seasonIndex, onClose, onRemove }) {
  const profile = getRivalProfile(rival, seasonIndex)

  return (
    <Drawer id="competitor-drawer" title={entry.name} subtitle={entry.role} onClose={onClose} labelledBy="competitor-drawer-title">
      <div className="grid gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={entry.name} avatarSeed={rival.id} size="lg" />
          <div className="grid min-w-0 gap-0.5">
            <span className="flex items-center gap-1.5 text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
              {entry.name}
              {entry.tag && <span className="rounded-full bg-[rgba(102,153,236,0.22)] px-1.5 py-px text-[10px] font-bold tracking-[.04em] text-[#d3e2ff] [[data-theme=light]_&]:bg-[#dde8f7] [[data-theme=light]_&]:text-[#073c72]">{entry.tag}</span>}
            </span>
            <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{league.name} · Rank #{entry.rank}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Stat label="Season Coins" value={`🪙 ${entry.score.toLocaleString()}`} />
          <Stat label="Streak" value={`${profile.streakDays}d`} />
          <Stat label="Concepts mastered" value={profile.conceptsMastered} />
          <Stat label="Reinforcement checks" value={profile.reinforcementChecks} />
          <Stat label="Project milestones" value={profile.projectMilestones} />
        </div>

        <div className="grid gap-1.5 rounded-xl border border-[#404040] bg-[#1a1a1c] px-4 py-3.5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
          <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Recent proof</span>
          <span className="text-[14px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{profile.recentProof}</span>
        </div>

        {onRemove && <OwnerActions name={entry.name} onRemove={onRemove} />}
      </div>
    </Drawer>
  )
}
