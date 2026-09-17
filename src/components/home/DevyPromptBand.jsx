// The sketch's "bar → Devy" note: the page's one strong closing CTA — a
// discovery-style prompt bar that opens the same DevyDrawer as the FAB.
export function DevyPromptBand({ isComposing, accent, onComposeStart, onComposeEnd, onOpen }) {
  return (
    <div className="home-prompt-band relative top-2 mx-auto w-full max-w-[640px]" data-compose={isComposing} style={{ "--prompt-accent": accent }}>
      <span className="home-prompt-glow pointer-events-none absolute -inset-x-14 -inset-y-8 rounded-full blur-3xl" aria-hidden="true" />
      <form
        className="relative flex w-full items-center rounded-full border border-[#404040] bg-[#1f1f1f] p-2 shadow-[0_14px_32px_rgba(0,0,0,0.16)] max-[680px]:mt-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_14px_32px_rgba(20,20,20,0.08)]"
        onSubmit={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
      <input
        className="min-h-12 min-w-0 flex-1 rounded-full border-0 bg-transparent px-5 text-[16px] text-[#f4f4f2] placeholder:text-[#9a9a9d] focus:outline-none [[data-theme=light]_&]:text-neutral-800"
        placeholder="What do you need help with?"
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
      <button
        type="button"
        className="grid size-10 flex-none place-items-center rounded-full text-[#9a9a9d] transition-colors hover:bg-white/10 hover:text-[#f4f4f2] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-black/5 [[data-theme=light]_&]:hover:text-neutral-800"
        aria-label="Add a photo or file"
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
        onClick={onOpen}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      </form>
    </div>
  );
}
