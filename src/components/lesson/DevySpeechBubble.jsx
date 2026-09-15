// Devy's ambient reaction, floating above the footer avatar — a comic-style
// bubble with a tail pointing down at the mascot that said it.
export function DevySpeechBubble({ text }) {
  if (!text) return null

  return (
    <div
      className="devy-bubble-in absolute bottom-[calc(100%-32px)] left-[76px] z-10 w-[260px] max-w-[calc(100vw-92px)] rounded-[20px] border border-[#acd4df] bg-[#f4fbfd] px-4 py-3 text-[16px] font-medium leading-[1.55] text-[#151515] shadow-none max-[520px]:left-[64px] max-[520px]:w-[calc(100vw-80px)] [[data-theme=dark]_&]:border-[#40606a] [[data-theme=dark]_&]:bg-[#1e2b30] [[data-theme=dark]_&]:text-[#f4f4f2]"
      role="status"
      aria-live="polite"
    >
      <span key={text} className="devy-bubble-text-in">{text}</span>
    </div>
  )
}
