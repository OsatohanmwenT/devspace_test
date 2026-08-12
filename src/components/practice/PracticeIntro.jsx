import { ActionButton } from '../ui/ActionButton'

export function PracticeIntro({ session, completion, onStart }) {
  const questionCount = session.questions.length

  return (
    <>
      <main className="min-w-0 min-h-0 overflow-auto bg-[#161616] [[data-theme=light]_&]:bg-[#f6f6fb]">
        <div className="grid min-h-full place-items-center px-6 py-10 max-[680px]:place-items-start max-[680px]:px-4 max-[680px]:py-5">
          <section
            className="w-[min(100%,1050px)] rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#dedee5] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-[clamp(24px,5vw,64px)] py-[clamp(30px,5vw,54px)] shadow-[0_18px_55px_rgba(0,0,0,.18)] [[data-theme=light]_&]:shadow-[0_18px_55px_rgba(31,31,51,.08)]"
            aria-labelledby="practice-intro-title"
          >
            <header className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.11em] text-[#88bdf2] [[data-theme=light]_&]:text-[#07389b]">Let’s practice</span>
              <h1
                id="practice-intro-title"
                className="mt-2 mb-0 font-rethink-sans text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[680px]:text-[30px]"
              >
                {session.title}
              </h1>
            </header>

            <div className="mt-11 grid grid-cols-3 gap-8 max-[680px]:mt-7 max-[680px]:grid-cols-1 max-[680px]:gap-4">
              <section className="grid justify-items-center text-center max-[680px]:grid-cols-[58px_minmax(0,1fr)] max-[680px]:items-center max-[680px]:justify-items-start max-[680px]:gap-4 max-[680px]:text-left">
                <span className="grid size-[88px] place-items-center rounded-2xl bg-[#272e3b] text-[#88bdf2] [[data-theme=light]_&]:bg-[#edf4ff] [[data-theme=light]_&]:text-[#3d77eb] max-[680px]:size-[58px]" aria-hidden="true">
                  <svg className="size-11 max-[680px]:size-8" viewBox="0 0 48 48" fill="none">
                    <rect x="9" y="7" width="30" height="34" rx="5" stroke="currentColor" strokeWidth="2.5" />
                    <path d="m15 18 3 3 5-6M27 18h6M15 30l3 3 5-6M27 30h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h2 className="mt-5 mb-2 text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[680px]:m-0 max-[680px]:text-lg">
                    {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                  </h2>
                  <p className="m-0 text-sm leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] max-[680px]:mt-1">Complete every challenge and check your answers.</p>
                </div>
              </section>

              <section className="grid justify-items-center text-center max-[680px]:grid-cols-[58px_minmax(0,1fr)] max-[680px]:items-center max-[680px]:justify-items-start max-[680px]:gap-4 max-[680px]:text-left">
                <span className="grid size-[88px] place-items-center rounded-2xl bg-[#272e3b] text-[#88bdf2] [[data-theme=light]_&]:bg-[#edf4ff] [[data-theme=light]_&]:text-[#3d77eb] max-[680px]:size-[58px]" aria-hidden="true">
                  <svg className="size-11 max-[680px]:size-8" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="25" r="15" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M19 7h10M24 10v4M24 25l7-6M34.5 13.5l3 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <h2 className="mt-5 mb-2 text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[680px]:m-0 max-[680px]:text-lg">No time limit</h2>
                  <p className="m-0 text-sm leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] max-[680px]:mt-1">Most learners finish in about {session.minutes} min.</p>
                </div>
              </section>

              <section className="grid justify-items-center text-center max-[680px]:grid-cols-[58px_minmax(0,1fr)] max-[680px]:items-center max-[680px]:justify-items-start max-[680px]:gap-4 max-[680px]:text-left">
                <span className="grid size-[88px] place-items-center rounded-2xl bg-[#272e3b] text-[#88bdf2] [[data-theme=light]_&]:bg-[#edf4ff] [[data-theme=light]_&]:text-[#3d77eb] max-[680px]:size-[58px]" aria-hidden="true">
                  <svg className="size-11 max-[680px]:size-8" viewBox="0 0 48 48" fill="none">
                    <path d="M27 5 12 27h11l-2 16 15-23H25l2-15Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h2 className="mt-5 mb-2 text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[680px]:m-0 max-[680px]:text-lg">
                    {completion ? 'Improve your score' : 'Earn 10 XP'}
                  </h2>
                  <p className="m-0 text-sm leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] max-[680px]:mt-1">
                    {completion
                      ? `Current result: ${completion.correctCount}/${completion.total}. Retries do not award extra XP.`
                      : 'Awarded on your first completed attempt.'}
                  </p>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>

      <footer className="flex items-center justify-center border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-6 py-3 max-[680px]:px-4">
        <div className="flex w-[min(100%,1050px)] items-center justify-end gap-5 max-[680px]:block">
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
