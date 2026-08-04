import { ActionButton } from '../ui/ActionButton'
import { FAMILY_ACCENTS } from './ExplorePathCard'

const regionState = {
  completed: 'Completed',
  current: 'In progress',
  available: 'Available next',
  locked: 'Locked',
}

export function LearningPathOverview({ path, onBack, onOpenRegion, onOpenLesson }) {
  const currentRegion = path.cards.find((region) => region.state === 'current') ?? path.cards[0]
  const currentLesson = currentRegion.lessons.find((lesson) => lesson.state === 'current')
  const family = FAMILY_ACCENTS[path.family] ?? FAMILY_ACCENTS.backend

  return (
    <section className="grid gap-7" aria-labelledby="path-overview-title">
      <button className="min-h-11 justify-self-start py-2 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-[#202020] focus-visible:rounded focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3" onClick={onBack}>← Back to paths</button>

      <header className="grid gap-5 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-[clamp(22px,4vw,38px)] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="grid gap-2">
          <span className="text-[11px] font-bold tracking-[.1em] uppercase" style={{ color: family.accent }}>{path.level}</span>
          <h1 id="path-overview-title" className="text-[clamp(30px,4vw,44px)] leading-[1.05] font-semibold tracking-[-.055em] text-[#f4f4f2] font-['Space_Grotesk',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">{path.title}</h1>
          <p className="max-w-[56ch] text-sm leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.description}</p>
          <p className="text-sm font-medium text-[#d4d4d4] [[data-theme=light]_&]:text-[#525252]">{path.progressValue}% complete <span aria-hidden="true">·</span> Current region: {currentRegion.title}</p>
        </div>
        {currentLesson && <ActionButton variant="primary" className="min-h-11 px-5 whitespace-nowrap" onClick={() => onOpenLesson(currentLesson.id, currentRegion)}>Continue: {currentLesson.title}</ActionButton>}
      </header>

      <section className="grid gap-4" aria-labelledby="regions-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="regions-title" className="text-2xl font-medium tracking-[-.04em] text-[#f4f4f2] font-['Space_Grotesk',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">Your path</h2>
          <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.cards.length} regions</span>
        </div>
        <div className="grid gap-3">
          {path.cards.map((region, index) => {
            const isCurrent = region.state === 'current'
            return (
              <button
                key={region.id}
                type="button"
                className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3 max-[680px]:grid-cols-[auto_minmax(0,1fr)] ${isCurrent ? 'border-[#4169e1] bg-[#252840] [[data-theme=light]_&]:bg-[#eef3ff]' : 'border-[#404040] bg-[#1f1f1f] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white'}`}
                onClick={() => onOpenRegion(region)}
                aria-label={`Open ${region.title}, ${regionState[region.state]}`}
              >
                <span className={`grid size-11 place-items-center rounded-full text-sm font-bold ${isCurrent ? 'bg-[#4169e1] text-white' : 'bg-[#303030] text-[#d4d4d4] [[data-theme=light]_&]:bg-[#f1f1ef] [[data-theme=light]_&]:text-[#525252]'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="grid min-w-0 gap-1">
                  <span className={`text-[10px] font-bold tracking-[.08em] uppercase ${isCurrent ? 'text-[#84a5ff] [[data-theme=light]_&]:text-[#4169e1]' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}>{regionState[region.state]}</span>
                  <strong className="text-[17px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{region.title}</strong>
                  <span className="text-[13px] leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{region.lessons.length} lessons <span aria-hidden="true">·</span> {region.progress} complete</span>
                </span>
                <span className="text-sm font-semibold text-[#b8b8bb] [[data-theme=light]_&]:text-[#525252] max-[680px]:col-start-2">View <span aria-hidden="true">→</span></span>
              </button>
            )
          })}
        </div>
      </section>
    </section>
  )
}
