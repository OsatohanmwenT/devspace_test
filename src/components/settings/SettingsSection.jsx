export function SettingsSection({ id, title, description, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-8 grid gap-5 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-6 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)] max-[680px]:p-5"
      aria-labelledby={`${id}-title`}
    >
      <div className="grid gap-1">
        <h2 id={`${id}-title`} className="m-0 font-rethink-sans text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{title}</h2>
        {description && <p className="m-0 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}
