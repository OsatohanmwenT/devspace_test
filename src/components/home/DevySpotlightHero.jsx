import { DevyMood } from '../ui/DevyMood'

// The page's visual anchor: a jagged spark flourish, then Devy center-stage
// under a soft spotlight glow — the sketch's "spark → mascot" pairing, built
// from the app's own blue accent gradient (same one as onb-progress-bar)
// rather than a new illustration asset.
export function DevySpotlightHero({ greeting }) {
  return (
    <section className="relative flex flex-col items-center pt-2 pb-8 max-[680px]:pb-6 text-center" aria-hidden={greeting ? undefined : 'true'}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] max-[680px]:h-[220px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-full w-[420px] max-[680px]:w-[280px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(102,153,236,0.22),_transparent_70%)] [[data-theme=light]_&]:bg-[radial-gradient(ellipse_at_top,_rgba(102,153,236,0.16),_transparent_70%)]" />
        <div className="absolute left-1/2 top-0 h-full w-[140px] max-[680px]:w-[100px] -translate-x-1/2 bg-[linear-gradient(180deg,_rgba(244,244,242,0.14),_transparent_85%)] [clip-path:polygon(38%_0,_62%_0,_100%_100%,_0%_100%)] [[data-theme=light]_&]:bg-[linear-gradient(180deg,_rgba(20,20,20,0.08),_transparent_85%)]" />
      </div>

      <svg className="relative z-[1] w-9 h-14 max-[680px]:w-7 max-[680px]:h-11" viewBox="0 0 36 56" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="devy-spark-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b7cf6" />
            <stop offset="1" stopColor="#6699ec" />
          </linearGradient>
        </defs>
        <path
          d="M21 2 8 30h9l-5 24 19-30h-10L21 2Z"
          fill="url(#devy-spark-gradient)"
          stroke="url(#devy-spark-gradient)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative z-[1] mt-1 size-[132px] max-[680px]:size-[104px]">
        <div className="absolute inset-x-[8%] bottom-[2%] h-[22%] rounded-full bg-black/30 blur-[14px] [[data-theme=light]_&]:bg-black/15" />
        <DevyMood mood="neutral" className="relative z-[1] size-full" alt="Devy" />
      </div>

      {greeting && (
        <p className="relative z-[1] m-0 mt-3 max-w-[420px] text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          {greeting}
        </p>
      )}
    </section>
  )
}
