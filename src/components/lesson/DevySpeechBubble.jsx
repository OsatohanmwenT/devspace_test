// Devy's ambient reaction, floating above the footer avatar — a comic-style
// bubble with a tail pointing down at the mascot that said it.
export function DevySpeechBubble({ text }) {
  if (!text) return null

  return (
    <div
      className="devy-bubble-in absolute bottom-5 left-[calc(100%+12px)] z-10 min-w-[150px] max-w-[260px] rounded-2xl rounded-bl-md border border-[#e8e6e1] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-[1.45] text-neutral-800 shadow-[0_6px_18px_rgba(20,20,20,.12)] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#262626] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:shadow-[0_6px_18px_rgba(0,0,0,.36)]"
      role="status"
      aria-live="polite"
    >
      {text}
    </div>
  )
}
