const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function XpPopover({ earnedToday }) {
  const jsDay = new Date().getDay()
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1

  return (
    <div
      className="absolute right-0 top-[calc(100%+10px)] z-[6] grid w-[300px] gap-4 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-overlay)] p-5 text-start shadow-[var(--shadow-overlay)]"
      role="dialog"
      aria-label="Weekly activity"
    >
      <h2 className="m-0 font-[var(--font-display)] text-[var(--type-subheading)] font-semibold text-[var(--text-primary)]">
        You earned <strong className="text-[var(--brand-cta)]">{earnedToday}px</strong> today!
      </h2>
      <p className="meta-copy mb-0 mt-1">Here's a look at your weekly activity</p>
      <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly px earned">
        {DAY_LABELS.map((label, index) => {
          const isToday = index === todayIndex
          return (
            <div className="grid justify-items-center gap-2 flex-1" key={index}>
              <span className="flex items-end w-2.5 h-[72px] rounded-full overflow-hidden">
                <span
                  className={isToday ? 'block w-full rounded-[inherit] bg-[var(--brand-cta)]' : 'block w-full rounded-[inherit] bg-[var(--surface-subtle)]'}
                  style={{ height: isToday && earnedToday > 0 ? '100%' : '10%' }}
                />
              </span>
              <small className={isToday ? 'text-[var(--brand-cta)] text-[11px] font-bold' : 'text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)] text-[11px] font-semibold'}>{label}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}
