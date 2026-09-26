// One shell for every card in "Your progress" — the active path and any
// paused custom paths used to be two different layouts side by side (a
// progress bar + "Open path" vs a right-aligned "Resume" + chip), which is
// what made that row look mismatched. Same size, padding, and bottom row now;
// only the content differs.
export function PathProgressCard({ title, subtitle, progress, badge, actionLabel, onOpen }) {
  return (
    <button type="button" aria-label={`${actionLabel} ${title}`} onClick={onOpen} className="flex h-full min-h-[164px] w-full flex-col items-start justify-between gap-5 max-[680px]:min-h-0 max-[680px]:gap-4 rounded-2xl border border-[#404040] bg-[#1f1f1f] px-5 py-4 text-left transition-[border-color,background,transform] duration-150 hover:-translate-y-0.5 hover:border-[#525252] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)] [[data-theme=light]_&]:hover:bg-[#fafafa]">
      <div className="grid w-full min-w-0 gap-0.5">
        <h3 className="truncate text-[19px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">{title}</h3>
        <p className="line-clamp-2 text-[13px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{subtitle}</p>
      </div>
      <span className="flex w-full items-center gap-3">
        {progress === undefined ? (
          <span className="flex-1">
            {badge && <span className="inline-flex rounded-full bg-[#1d3b2a] px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#8ee6ad] [[data-theme=light]_&]:bg-[#e2f6e8] [[data-theme=light]_&]:text-[#168a46]">{badge}</span>}
          </span>
        ) : (
          <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#333336] [[data-theme=light]_&]:bg-[#ececea]" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 rounded-full bg-[#16a34a]" style={{ width: `${progress}%` }} />
          </span>
        )}
        <span className="flex-none rounded-lg bg-[#16a34a] px-3 py-2 text-[13px] font-semibold text-white">{actionLabel}</span>
      </span>
    </button>
  )
}

export function CurrentPathCard({ path, onOpenDetail }) {
  const nextLesson = path.cards.flatMap((region) => region.lessons).find((lesson) => lesson.state === 'current')

  return (
    <PathProgressCard
      title={path.title}
      subtitle={<>{path.progressValue}% complete{nextLesson && <> <span aria-hidden="true">·</span> Next: {nextLesson.title}</>}</>}
      progress={path.progressValue ?? 0}
      actionLabel="Open path"
      onOpen={onOpenDetail}
    />
  )
}
