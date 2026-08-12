import { ActionButton } from '../ui/ActionButton'
import { ROW_GRID } from './rowGrid'

const SKELETON_WIDTHS = ['58%', '72%', '44%', '66%', '52%', '78%']

function SkeletonRow({ width }) {
  return (
    <div className={ROW_GRID}>
      <span className="w-2.5 h-2.5 rounded-full bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--border-hairline)] justify-self-center" />
      <span className="w-10 h-10 max-[680px]:w-[34px] max-[680px]:h-[34px] rounded-full bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--border-hairline)]" />
      <span className="grid gap-1.5">
        <span className="h-2.5 rounded-full bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--border-hairline)]" style={{ width }} />
        <span className="h-2 w-[34%] rounded-full bg-[var(--surface-subtle)]" />
      </span>
      <span className="w-12 h-2.5 rounded-full bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--border-hairline)]" />
      <span aria-hidden="true" />
    </div>
  )
}

export function LockedLeaderboard({ league, pxToJoin, onStartPractice }) {
  return (
    <>
      <div className="grid justify-items-center gap-3 text-center max-w-[520px] mx-auto">
        <h2 className="m-0 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-[clamp(26px,3.4vw,34px)] font-medium">
          Join the {league.name}
        </h2>
        <p className="m-0 text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] text-[15px] leading-[1.5]">
          Earn {pxToJoin} px this week to start competing. Every practice round and lesson counts.
        </p>
        <ActionButton variant="primary" className="min-w-[220px] min-h-[50px] mt-1 text-[15px] font-medium" onClick={onStartPractice}>
          Start a practice round
        </ActionButton>
      </div>

      <div
        className="m-0 grid list-none rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] p-1.5 shadow-[var(--shadow-raised)]"
        aria-label="Standings are hidden until you join this week's league"
      >
        {SKELETON_WIDTHS.map((width, index) => <SkeletonRow key={index} width={width} />)}
      </div>
    </>
  )
}
