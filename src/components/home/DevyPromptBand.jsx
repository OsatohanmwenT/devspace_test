// The sketch's "bar → Devy" note: the page's one strong closing CTA — a
// discovery-style prompt bar that opens the same DevyDrawer as the FAB.
export function DevyPromptBand({ isComposing, accent, onComposeStart, onComposeEnd, onOpen }) {
  return (
    <div className="home-prompt-band relative mx-auto w-full max-w-[520px]" data-compose={isComposing} style={{ "--prompt-accent": accent }}>
      <span className="home-prompt-glow pointer-events-none absolute -inset-x-14 -inset-y-8 rounded-full blur-3xl" aria-hidden="true" />
      <form
        className="relative flex w-full items-center rounded-full border border-[#404040] bg-[#1f1f1f] p-1.5 shadow-[0_14px_32px_rgba(0,0,0,0.16)] max-[680px]:mt-4 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_14px_32px_rgba(20,20,20,0.08)]"
        onSubmit={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
      <input
        className="min-h-11 min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 text-[15px] text-[#f4f4f2] placeholder:text-[#9a9a9d] focus:outline-none [[data-theme=light]_&]:text-neutral-800"
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
        type="submit"
        className="home-prompt-send grid size-11 flex-none place-items-center rounded-full bg-[#6699ec] text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:bg-[#2563eb] [[data-theme=light]_&]:hover:bg-[#1d4ed8] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
        aria-label="Open Devy"
      >
        <span aria-hidden="true">→</span>
      </button>
      </form>
    </div>
  );
}
