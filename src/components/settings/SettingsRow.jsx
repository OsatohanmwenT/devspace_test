export function SettingsRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[#2c2c30] pt-4 first:border-t-0 first:pt-0 [[data-theme=light]_&]:border-[#ececea]">
      <div className="grid gap-0.5">
        <strong className="text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{label}</strong>
        {description && <span className="text-[13px] leading-[1.4] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{description}</span>}
      </div>
      <div className="flex-none">{children}</div>
    </div>
  )
}
