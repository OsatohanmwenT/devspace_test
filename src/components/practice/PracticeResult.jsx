import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'

// A practice round used to end by vanishing: the last "Finish practice" click
// closed the session outright, so the score, the XP and the answer the learner
// got wrong were all recorded and never shown. This screen is that missing
// beat — the one place where finishing feels like finishing.
//
// It deliberately matches the arrival screens (PageArrival, FirstLessonWelcome):
// same 112px Devy, same 520px column, same 350px action. They are the same kind
// of moment, and a results screen that sizes its own mascot half again as large
// as every sibling reads as a different product.

// Two thirds is the line between "you know this" and "go again". Below it the
// screen leads with the retry rather than the exit.
const PASS_RATIO = 2 / 3

export function PracticeResult({ session, correctCount, total, xpAward, isReplay, onRetry, onDone }) {
  const ratio = total > 0 ? correctCount / total : 0
  const passed = ratio >= PASS_RATIO
  const perfect = total > 0 && correctCount === total
  // Half the catalog is a single question, where "Clean sweep" and "Every
  // question in…" both overclaim a one-question round.
  const isSingle = total === 1

  const headline = perfect
    ? isSingle ? 'Nailed it.' : 'Clean sweep.'
    : passed
      ? 'That holds up.'
      : 'Worth another run.'

  const body = perfect
    ? isReplay
      ? `${session.title} — locked in.`
      : isSingle
        ? `${session.title}, first time through.`
        : `Every question in ${session.title}, first time through.`
    : passed
      ? `You got the shape of ${session.title}. One more round would lock it in.`
      : `${session.title} hasn’t stuck yet — and that is exactly what practice is for.`

  return (
    <main className="min-w-0 min-h-0 overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-label="Practice results">
      <div className="grid min-h-full place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
        <div className="grid w-full max-w-[520px] justify-items-center text-center">
          <DevyMood
            mood={passed ? 'celebrating' : 'annoyed'}
            className="mb-6 h-28 w-28 max-[680px]:mb-5 max-[680px]:h-24 max-[680px]:w-24"
          />

          <h1 className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-semibold leading-[1.12] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
            {headline}
          </h1>
          <p className="mt-2 mb-0 max-w-[44ch] text-[15px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
            {body}
          </p>

          {/* Held to the same width as the action below it, so the screen reads
              as one column rather than a wide slab over a narrow button. */}
          <dl className="mt-7 grid w-[min(100%,350px)] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#404040] bg-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-[#e1e1e1]">
            <div className="grid gap-1 bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 py-3.5">
              <dt className="text-[11px] font-bold uppercase tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Correct</dt>
              <dd className="m-0 font-rethink-sans text-[22px] font-bold leading-none text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 tabular-nums">
                {correctCount}<span className="text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]"> / {total}</span>
              </dd>
            </div>
            <div className="grid gap-1 bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 py-3.5">
              <dt className="text-[11px] font-bold uppercase tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">XP earned</dt>
              {/* A replay that earns nothing says so, rather than implying a
                  reward the learner will not see land on the header counter. */}
              <dd className={`m-0 font-rethink-sans text-[22px] font-bold leading-none tabular-nums ${xpAward > 0 ? 'text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'}`}>
                {xpAward > 0 ? `+${xpAward}` : '—'}
              </dd>
            </div>
          </dl>

          {xpAward === 0 && (
            <p className="mt-3 mb-0 max-w-[40ch] text-[13px] leading-[1.5] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
              You already earned XP for this session. Replaying still counts for your streak.
            </p>
          )}

          <ActionButton
            variant="primary"
            className="mt-8 min-h-[52px] w-[min(100%,350px)] text-[15px] font-semibold"
            onClick={passed ? onDone : onRetry}
            autoFocus
          >
            {passed ? 'Done' : 'Try this round again'}
          </ActionButton>
          <button
            type="button"
            className="mt-1 min-h-11 rounded-xl border-0 bg-transparent px-4 text-sm font-medium text-[#6699ec] hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
            onClick={passed ? onRetry : onDone}
          >
            {passed ? 'Run it again' : 'Back to practice'}
          </button>
        </div>
      </div>
    </main>
  )
}
