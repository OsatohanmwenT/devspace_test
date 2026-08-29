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

// A right-placement Drawer, same pattern NotesDrawer already uses — the
// point is the standings list stays visible behind it. There's no real
// "Proof Book" for a simulated rival to link to, so that CTA from the spec
// is dropped rather than pointing at a page that doesn't exist.
export function CompetitorDrawer({ entry, rival, league, seasonIndex, onClose }) {
  const profile = getRivalProfile(rival, seasonIndex)

  return (
    <Drawer id="competitor-drawer" title={entry.name} subtitle={entry.role} onClose={onClose} labelledBy="competitor-drawer-title">
      <div className="grid gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={entry.name} size="lg" />
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
      </div>
    </Drawer>
  )
}
