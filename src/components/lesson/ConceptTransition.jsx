export function ConceptTransition({ eyebrow, title, body }) {
  return (
    <section
      className="h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
      aria-labelledby="lesson-transition-title"
    >
      <div className="grid min-h-full place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
        <div className="grid w-[min(100%,720px)] justify-items-center text-center">
          <img
            className="mb-5 size-[210px] object-contain max-[720px]:mb-3 max-[720px]:size-[148px]"
            src="/assets/devy.svg"
            alt=""
            aria-hidden="true"
          />
          <span className="mb-3 text-xs font-bold uppercase tracking-[0.11em] text-[#888df2] [[data-theme=light]_&]:text-[#19079b]">
            {eyebrow}
          </span>
          <h1
            id="lesson-transition-title"
            className="m-0 max-w-[20ch] text-balance font-['Rethink_Sans',Arial,sans-serif] text-[clamp(27px,3vw,38px)] font-semibold leading-[1.12] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] max-[720px]:text-[26px]"
          >
            {title}
          </h1>
          <p className="mt-4 mb-0 max-w-[48ch] text-balance text-[17px] leading-[1.6] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968] max-[720px]:mt-3 max-[720px]:text-base">
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}
