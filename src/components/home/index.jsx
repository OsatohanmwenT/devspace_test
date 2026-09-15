import { DevyMood } from "../ui/DevyMood";
import { CompassIcon, DumbbellIcon, PlayIcon, PodiumIcon, RocketIcon } from "../ui/icons";
import { DevyPromptBand } from "./DevyPromptBand";

const chipClass = "grid size-9 flex-none place-items-center rounded-xl";

// Small colored icon badge, top-left of each card — the same accent hues
// Badge.jsx's TONES already use, reused here instead of new colors.
function IconChip({ icon: Icon, tone }) {
  const tones = {
    orange: `${chipClass} bg-[#f5a623]/15 text-[#f5a623]`,
    teal: `${chipClass} bg-[#04adc0]/15 text-[#04adc0]`,
    pink: `${chipClass} bg-[#e0507a]/15 text-[#e0507a]`,
    violet: `${chipClass} bg-[#8b7cf6]/15 text-[#8b7cf6]`,
    blue: `${chipClass} bg-white/15 text-[#88bdf2] [[data-theme=light]_&]:bg-[#2563eb]/12 [[data-theme=light]_&]:text-[#2563eb]`,
  };

  return (
    <span className={tones[tone]}>
      <Icon className="w-[18px] h-[18px]" />
    </span>
  );
}

export default function HomeView({
  onStartMission,
  onOpenCareerPath,
  onOpenDevyPro,
  onOpenLeaderboard,
  onSeeAllPractice,
  onOpenDevy,
}) {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 max-[900px]:h-auto max-[900px]:overflow-visible max-[900px]:px-[18px] max-[680px]:px-[18px] max-[680px]:py-6">
      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center max-[900px]:h-auto">
        <section
          className="relative h-[620px] max-[900px]:grid max-[900px]:h-auto max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[680px]:grid-cols-1"
          aria-label="Learning map"
        >
          <DevyMood
            mood="neutral"
            className="absolute left-1/2 top-40 size-[88px] -translate-x-1/2 max-[900px]:static max-[900px]:col-span-2 max-[900px]:justify-self-center max-[900px]:translate-x-0 max-[680px]:col-span-1"
          />

          <button
            type="button"
            onClick={onSeeAllPractice}
            className="absolute left-[calc(50%-450px)] top-[180px] flex size-36 flex-col items-start justify-between rounded-3xl border border-[#404040] bg-[#1f1f1f] p-4 text-left text-[17px] font-medium text-[#f4f4f2] transition-[border-color,background,transform] duration-150 hover:-translate-y-1 hover:border-[#5a5a60] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#d4d4d4] [[data-theme=light]_&]:hover:bg-white max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[144px] max-[680px]:min-h-[96px]"
          >
            <IconChip icon={DumbbellIcon} tone="orange" />
            Practice
          </button>
          <button
            type="button"
            onClick={onOpenCareerPath}
            className="absolute left-[calc(50%+310px)] top-[180px] flex size-36 flex-col items-start justify-between rounded-3xl border border-[#404040] bg-[#1f1f1f] p-4 text-left text-[17px] font-medium text-[#f4f4f2] transition-[border-color,background,transform] duration-150 hover:-translate-y-1 hover:border-[#5a5a60] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#d4d4d4] [[data-theme=light]_&]:hover:bg-white max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[144px] max-[680px]:min-h-[96px]"
          >
            <IconChip icon={CompassIcon} tone="teal" />
            Paths
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="absolute left-[calc(50%-260px)] top-[260px] flex size-36 flex-col items-start justify-between rounded-3xl border border-[#404040] bg-[#1f1f1f] p-4 text-left text-[17px] font-medium text-[#f4f4f2] transition-[border-color,background,transform] duration-150 hover:-translate-y-1 hover:border-[#5a5a60] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#d4d4d4] [[data-theme=light]_&]:hover:bg-white max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[144px] max-[680px]:min-h-[96px]"
          >
            <IconChip icon={PodiumIcon} tone="pink" />
            Leaderboard
          </button>
          <button
            type="button"
            onClick={onOpenCareerPath}
            className="absolute left-[calc(50%+120px)] top-[260px] flex size-36 flex-col items-start justify-between rounded-3xl border border-[#404040] bg-[#1f1f1f] p-4 text-left text-[17px] font-medium text-[#f4f4f2] transition-[border-color,background,transform] duration-150 hover:-translate-y-1 hover:border-[#5a5a60] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#d4d4d4] [[data-theme=light]_&]:hover:bg-white max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[144px] max-[680px]:min-h-[96px]"
          >
            <IconChip icon={RocketIcon} tone="violet" />
            Projects
          </button>
          <button
            type="button"
            onClick={onStartMission}
            className="absolute left-1/2 top-[320px] flex size-36 -translate-x-1/2 flex-col items-start justify-between rounded-3xl border border-[#3b82f6] bg-[#1c2a4d] p-4 text-left text-[#f4f4f2] transition-[border-color,background,transform] duration-150 hover:-translate-y-1 hover:border-[#60a5fa] hover:bg-[#213762] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#2563eb] [[data-theme=light]_&]:bg-[#f0f5fd] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#1d4ed8] [[data-theme=light]_&]:hover:bg-[#e2edfc] max-[900px]:static max-[900px]:col-span-2 max-[900px]:size-auto max-[900px]:min-h-[144px] max-[900px]:translate-x-0 max-[680px]:col-span-1 max-[680px]:min-h-[96px]"
          >
            <IconChip icon={PlayIcon} tone="blue" />
            <h1 className="m-0 font-rubik text-[17px] font-medium leading-none">
              Current Lesson
            </h1>
          </button>
        </section>

        <section
          className="relative flex items-center justify-center max-[900px]:mt-6 py-6 max-[680px]:mt-4"
          aria-label="Quick actions"
        >
          <div className="absolute left-0 flex gap-3 max-[680px]:static max-[680px]:mr-3">
            <button
              type="button"
              onClick={onSeeAllPractice}
              className="relative grid size-11 place-items-center rounded-full border border-[#404040] bg-[#1f1f1f] text-[#f4f4f2] hover:border-[#5a5a60] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
              aria-label="Practice"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="home-practice-dot absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#121214] bg-[#fb7185] [[data-theme=light]_&]:border-white" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSeeAllPractice}
              className="grid size-11 place-items-center rounded-full border border-[#404040] bg-[#1f1f1f] text-[#f4f4f2] hover:border-[#5a5a60] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
              aria-label="Daily task"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 3v4M16 3v4M4 10h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <DevyPromptBand onOpen={onOpenDevy} />

          <div className="absolute right-0 flex gap-3 max-[680px]:static max-[680px]:ml-3">
            <button
              type="button"
              onClick={onOpenDevyPro}
              className="min-h-11 rounded-full bg-[linear-gradient(86deg,#748fff_0%,#ff90e0_44.8%,#f7c325_100%)] px-4 text-[13px] font-semibold text-neutral-900 shadow-[inset_0_-3px_0_rgba(20,37,99,.3)] hover:brightness-105 focus-visible:outline-3 focus-visible:outline-[#f7c325] focus-visible:outline-offset-2"
            >
              Devy Pro
            </button>
            <button
              type="button"
              onClick={onOpenCareerPath}
              className="min-h-11 rounded-full border border-[#404040] bg-[#1f1f1f] px-4 text-[13px] font-medium text-[#f4f4f2] hover:border-[#5a5a60] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
            >
              Career Path
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
