import { ActionButton } from '../ui/ActionButton'

const SKELETON_WIDTHS = ['58%', '72%', '44%', '66%', '52%', '78%']

function SkeletonRow({ width }) {
  return (
    <div className="grid grid-cols-[28px_40px_minmax(0,1fr)_auto] max-[680px]:grid-cols-[22px_34px_minmax(0,1fr)_auto] items-center gap-3.5 max-[680px]:gap-2.5 p-3.5 max-[680px]:p-2.5">
      <span className="w-2.5 h-2.5 rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea] justify-self-center" />
      <span className="w-10 h-10 max-[680px]:w-[34px] max-[680px]:h-[34px] rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea]" />
      <span className="grid gap-1.5">
        <span className="h-2.5 rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea]" style={{ width }} />
        <span className="h-2 rounded-full bg-[#282828] [[data-theme=light]_&]:bg-[#f2f2f0] w-[34%]" />
      </span>
      <span className="w-12 h-2.5 rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea]" />
    </div>
  )
}

export function LockedLeaderboard({ league, pxToJoin, onStartPractice }) {
  return (
    <>
      <div className="grid justify-items-center gap-3 text-center max-w-[520px] mx-auto">
        <h2 className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(26px,3.4vw,34px)] font-medium tracking-[-.04em]">
          Join the {league.name}
        </h2>
        <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[15px] leading-[1.5]">
          Earn {pxToJoin} px this week to start competing. Every practice round and lesson counts.
        </p>
        <ActionButton variant="primary" className="min-w-[220px] min-h-[50px] mt-1 text-[15px] font-medium" onClick={onStartPractice}>
          Start a practice round
        </ActionButton>
      </div>

      <div
        className="grid list-none m-0 p-1.5 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
        aria-label="Standings are hidden until you join this week's league"
      >
        {SKELETON_WIDTHS.map((width, index) => <SkeletonRow key={index} width={width} />)}
      </div>
    </>
  )
}
