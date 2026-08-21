import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'
import { ROW_GRID } from './rowGrid'

const SKELETON_WIDTHS = ['58%', '72%', '44%', '66%', '52%', '78%']

function SkeletonRow({ width }) {
  return (
    <div className={ROW_GRID}>
      <span className="w-2.5 h-2.5 rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea] justify-self-center" />
      <span className="w-10 h-10 max-[680px]:w-[34px] max-[680px]:h-[34px] rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea]" />
      <span className="grid gap-1.5">
        <span className="h-2.5 rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea]" style={{ width }} />
        <span className="h-2 rounded-full bg-[#282828] [[data-theme=light]_&]:bg-[#f2f2f0] w-[34%]" />
      </span>
      <span className="w-12 h-2.5 rounded-full bg-[#2e2e2e] [[data-theme=light]_&]:bg-[#ececea]" />
      <span aria-hidden="true" />
    </div>
  )
}

// Lives inside the league card rather than under it. As its own centred hero it
// restated the league name the card had already given in 30px type, and the two
// stacked heroes pushed the only action on the page below the fold. Same
// information, one card, CTA visible on arrival.
export function LeagueJoinPrompt({ pxToJoin, onStartPractice }) {
  return (
    <div className="mt-1 flex w-full items-center gap-4 border-t border-[#404040] [[data-theme=light]_&]:border-[#ebe9e4] pt-5 text-left max-[680px]:flex-col max-[680px]:gap-3 max-[680px]:text-center">
      {/* Devy is impatient to see you on the board, not disappointed in you. */}
      <DevyMood mood="annoyed" className="size-20 flex-none max-[680px]:size-16" />
      <div className="grid min-w-0 flex-1 gap-1">
        <strong className="text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          You’re not on this week’s board yet
        </strong>
        <span className="text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          Earn {pxToJoin} px to join. One practice round or lesson does it.
        </span>
      </div>
      <ActionButton
        variant="primary"
        className="min-h-[50px] flex-none px-6 text-[15px] font-medium max-[680px]:w-full"
        onClick={onStartPractice}
      >
        Start a practice round
      </ActionButton>
    </div>
  )
}

export function LockedBoardSkeleton() {
  return (
    <div
      className="grid list-none m-0 p-1.5 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)]"
      aria-label="Standings are hidden until you join this week's league"
    >
      {SKELETON_WIDTHS.map((width, index) => <SkeletonRow key={index} width={width} />)}
    </div>
  )
}
