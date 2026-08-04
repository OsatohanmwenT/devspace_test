import { useState } from 'react'
import { currentPath, explorePaths } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { ExplorePathCard, PathPreview } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ onOpenLesson }) {
  const [view, setView] = useState('overview')
  const [type, setType] = useState('all')
  const [selectedPath, setSelectedPath] = useState(null)
  const paths = type === 'all' ? explorePaths : explorePaths.filter((path) => path.type === type)

  const selectPath = (path) => {
    if (path.id === 'machine-learning') {
      setView('detail')
      return
    }
    setSelectedPath(path)
    setView('preview')
  }

  if (view === 'detail') return <LearningPathDetail path={currentPath} onOpenLesson={onOpenLesson} onBack={() => setView('overview')} />
  if (view === 'preview' && selectedPath) return <PathPreview path={selectedPath} onBack={() => setView('overview')} />

  return (
    <section className="grid gap-8 max-[720px]:gap-[30px]" aria-label="Learning paths">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="text-3xl font-medium tracking-[-.05em] text-[#f4f4f2] font-['Space_Grotesk',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">Paths</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Continue learning or choose a new path.</p>
      </header>

      <CurrentPathCard onOpenDetail={() => setView('detail')} />

      <section className="grid gap-5 border-t border-[#404040] pt-7 [[data-theme=light]_&]:border-[#eeeeeb]" aria-labelledby="explore-paths-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="explore-paths-title" className="text-[24px] font-medium tracking-[-.04em] text-[#f4f4f2] font-['Space_Grotesk',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">Explore paths</h2>
          <span className="text-[13px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{explorePaths.length} paths</span>
        </div>
        <div className="flex gap-2" role="group" aria-label="Path type">
          {[['all', 'All'], ['career', 'Career paths'], ['skill', 'Skill paths']].map(([value, label]) => {
            const isActive = type === value
            return <button key={value} type="button" aria-pressed={isActive} onClick={() => setType(value)} className={isActive ? 'min-h-10 rounded-full border border-[#4169e1] bg-[#4169e1] px-4 text-[13px] font-semibold text-white focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3' : 'min-h-10 rounded-full border border-[#525252] px-4 text-[13px] text-[#b8b8bb] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-[#525252] focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3'}>{label}</button>
          })}
        </div>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          {paths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
        </div>
      </section>
    </section>
  )
}
