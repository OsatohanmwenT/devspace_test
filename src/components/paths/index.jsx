import { useState } from 'react'
import { currentPath, explorePaths, getPath, pathShelves } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { ExplorePathCard, PathPreview } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ currentLearnerPath = currentPath, completedLessons, onOpenLesson }) {
  const [view, setView] = useState('overview')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)
  const paths = (type === 'all' ? explorePaths : explorePaths.filter((path) => path.type === type)).filter((path) => {
    const term = query.trim().toLowerCase()
    return !term || [path.title, path.description, ...path.tools].join(' ').toLowerCase().includes(term)
  })

  const selectPath = (path) => {
    if (pathShelves.some((authoredPath) => authoredPath.id === path.id)) {
      setSelectedPath(path)
      setView('detail')
      return
    }
    setSelectedPath(path)
    setView('preview')
  }

  if (view === 'detail') return <LearningPathDetail path={selectedPath ? getPath(selectedPath.id) : currentPath} completedLessons={completedLessons} onOpenLesson={onOpenLesson} onBack={() => setView('overview')} />
  if (view === 'preview' && selectedPath) return <PathPreview path={selectedPath} onBack={() => setView('overview')} />

  return (
    <section className="grid gap-8 max-[720px]:gap-[30px]" aria-label="Learning paths">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="text-3xl font-medium text-[#f4f4f2] font-['Rethink_Sans',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">Paths</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Continue learning or choose a new path.</p>
      </header>

      <CurrentPathCard path={currentLearnerPath} onOpenDetail={() => { setSelectedPath(null); setView('detail') }} />

      <section className="grid gap-5 border-t border-[#404040] pt-7 [[data-theme=light]_&]:border-[#eeeeeb]" aria-labelledby="explore-paths-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="explore-paths-title" className="text-[24px] font-medium text-[#f4f4f2] font-['Rethink_Sans',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">Explore paths</h2>
          <span className="text-[13px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{explorePaths.length} paths</span>
        </div>
        <div className="flex items-center justify-between gap-4 max-[680px]:items-stretch max-[680px]:flex-col">
          <div className="flex gap-2" role="group" aria-label="Path type">
            {[['all', 'All'], ['career', 'Career paths'], ['skill', 'Skill paths']].map(([value, label]) => {
              const isActive = type === value
              return <button key={value} type="button" aria-pressed={isActive} onClick={() => setType(value)} className={isActive ? 'min-h-10 rounded-md border border-[#4169e1] bg-[#4169e1] px-4 text-[13px] font-semibold text-white focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3' : 'min-h-10 rounded-md [[data-theme=light]_&]:border-[#d4d4d4] bg-neutral-700/80 [[data-theme=light]_&]:bg-white px-4 text-[13px] text-[#b8b8bb] [[data-theme=light]_&]:text-[#525252] focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3'}>{label}</button>
            })}
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search paths"
            aria-label="Search paths"
            className="h-10 w-[220px] rounded-md border border-[#4a4a4a] bg-[#252525] px-3 text-[13px] text-[#f4f4f2] placeholder:text-[#89898e] outline-none focus:border-[#4169e1] focus:ring-2 focus:ring-[#4169e1]/30 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#202020] [[data-theme=light]_&]:placeholder:text-[#737371] max-[680px]:w-full"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          {paths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
        </div>
      </section>
    </section>
  )
}
