import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'

// Matches PracticeResult — the other phase of this same session — rather than
// living as its own wide, divided stat card: same 112px Devy, same 520px
// column, same compact fact strip. A round about to start and one that just
// ended are the same kind of screen; this one was the odd one out.
export function PracticeIntro({ session, completion, onStart }) {
  const questionCount = session.questions.length

  return (
    <>
      <main className="min-w-0 min-h-0 overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white">
        <div className="grid min-h-full place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
          <div className="grid w-full max-w-[520px] justify-items-center text-center">
            <DevyMood mood="neutral" className="mb-6 h-28 w-28 max-[680px]:mb-5 max-[680px]:h-24 max-[680px]:w-24" />

            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#88bdf2] [[data-theme=light]_&]:text-[#07389b]">Let’s practice</span>
            <h1 className="mt-2 mb-0 font-rethink-sans text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
              {session.title}
            </h1>

            <dl className="mt-7 grid w-full grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#404040] bg-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-[#e1e1e1]">
              <div className="grid gap-1 bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3 py-3.5">
                <dt className="text-[11px] font-bold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Length</dt>
                <dd className="m-0 text-[15px] font-semibold leading-tight text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                  {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                </dd>
              </div>
              <div className="grid gap-1 bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3 py-3.5">
                <dt className="text-[11px] font-bold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Time</dt>
                <dd className="m-0 text-[15px] font-semibold leading-tight text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                  ~{session.minutes} min
                </dd>
              </div>
              <div className="grid gap-1 bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3 py-3.5">
                <dt className="text-[11px] font-bold uppercase tracking-[.06em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Reward</dt>
                <dd className={`m-0 text-[15px] font-semibold leading-tight tabular-nums ${completion ? 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800' : 'text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]'}`}>
                  {completion ? `${completion.correctCount}/${completion.total}` : '+10 XP'}
                </dd>
              </div>
            </dl>

            <p className="mt-3 mb-0 max-w-[42ch] text-[13px] leading-[1.5] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
              {completion
                ? 'Retries don’t award extra XP, but they still count for your streak.'
                : 'Check your answer after every question — XP lands on your first completed attempt.'}
            </p>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-end border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-6 py-3 max-[680px]:px-4">
        <div className="flex w-[min(100%,520px)] items-center justify-end gap-5 max-[680px]:block">
          <span className="text-sm font-semibold text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968] max-[680px]:hidden">Press Enter to start</span>
          <ActionButton
            variant="primary"
            className="min-h-[52px] min-w-[190px] px-7 text-[15px] font-semibold max-[680px]:w-full"
            onClick={onStart}
            autoFocus
          >
            {completion ? 'Start retry' : 'Start practice'}
          </ActionButton>
        </div>
      </footer>
    </>
  )
}
