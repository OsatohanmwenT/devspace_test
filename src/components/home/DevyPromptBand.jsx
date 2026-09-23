import { useEffect, useState } from 'react';

// A few things Devy can help with, rotated through the idle placeholder so
// the empty bar still hints at what it's for without any visible controls —
// those only show up once the learner actually clicks in.
const IDLE_PROMPTS = [
  'What do you need help with?',
  'Explain recursion to me...',
  'Help me understand APIs...',
  'What should I learn next?',
  'Quiz me on Python...',
];

// The sketch's "bar → Devy" note: the page's one strong closing CTA — a
// discovery-style prompt bar that opens the same DevyDrawer as the FAB.
// Idle, it's just a single-line input with a rotating hint — upload, voice
// and send only appear once the learner clicks in, so Browse mode never
// competes with Chat mode for attention.
export function DevyPromptBand({ isComposing, accent, onComposeStart, onComposeEnd, onOpen }) {
  const [promptIndex, setPromptIndex] = useState(0)

  useEffect(() => {
    if (isComposing) return
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % IDLE_PROMPTS.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [isComposing])

  return (
    <div className="home-prompt-band relative mx-auto w-full max-w-[480px]" data-compose={isComposing} style={{ "--prompt-accent": accent }}>
      <span className="home-prompt-glow pointer-events-none absolute -inset-x-14 -inset-y-8 rounded-full blur-3xl min-[681px]:-inset-x-28 min-[681px]:-inset-y-14 max-[680px]:![background:radial-gradient(ellipse_at_center,rgb(var(--prompt-accent)_/_0.1),rgb(var(--prompt-accent)_/_0.025)_44%,transparent_76%)] [[data-theme=light]_&]:![background:radial-gradient(ellipse_at_center,rgb(var(--prompt-accent)_/_0.14),rgb(var(--prompt-accent)_/_0.035)_44%,transparent_76%)] min-[681px]:[[data-theme=light]_&]:![background:radial-gradient(ellipse_at_center,rgb(var(--prompt-accent)_/_0.32),rgb(var(--prompt-accent)_/_0.1)_46%,transparent_76%)]" aria-hidden="true" />
      <form
        className="relative flex w-full items-center rounded-full border border-[#404040] bg-[#1f1f1f] p-2 shadow-[0_14px_32px_rgba(0,0,0,0.16)] max-[680px]:mt-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:!shadow-[0_5px_14px_rgba(183,181,203,0.16)]"
        onSubmit={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
      <input
        className="min-h-12 min-w-0 flex-1 rounded-full border-0 bg-transparent px-5 text-[16px] text-[#f4f4f2] placeholder:text-[#9a9a9d] focus:outline-none [[data-theme=light]_&]:text-neutral-800"
        placeholder={IDLE_PROMPTS[promptIndex]}
        aria-label="Ask Devy for help"
        onFocus={onComposeStart}
        onBlur={onComposeEnd}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.blur();
            onComposeEnd();
          }
        }}
      />
      {isComposing && (
        <>
          <button
            type="button"
            className="grid size-10 flex-none place-items-center rounded-full text-[#9a9a9d] transition-colors hover:bg-white/10 hover:text-[#f4f4f2] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-black/5 [[data-theme=light]_&]:hover:text-neutral-800"
            aria-label="Add a photo or file"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onOpen}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="grid size-10 flex-none place-items-center rounded-full text-[#9a9a9d] transition-colors hover:bg-white/10 hover:text-[#f4f4f2] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-black/5 [[data-theme=light]_&]:hover:text-neutral-800"
            aria-label="Talk to Devy"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onOpen}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="submit"
            className="home-prompt-send grid size-10 flex-none place-items-center rounded-full bg-[#6699ec] text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:bg-[#2563eb] [[data-theme=light]_&]:hover:bg-[#1d4ed8]"
            aria-label="Send"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
      </form>
    </div>
  );
}
