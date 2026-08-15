import { useEffect, useState } from 'react'
import { currentPath, explorePaths, getPath, pathShelves } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { CustomPathCard } from './CustomPathCard'
import { CustomPathBuilder } from './CustomPathBuilder'
import { ExplorePathCard, PathPreview } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ currentLearnerPath = currentPath, completedLessons, onOpenLesson, initialView }) {
  const [view, setView] = useState(initialView ?? 'overview')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)
  const [customPath, setCustomPath] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('devspace-custom-path'))
    } catch {
      return null
    }
  })
  const [selectedCustomPath, setSelectedCustomPath] = useState(null)

  useEffect(() => {
    if (customPath) localStorage.setItem('devspace-custom-path', JSON.stringify(customPath))
  }, [customPath])
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
  if (view === 'custom') return (
    <CustomPathBuilder
      key={selectedCustomPath?.id ?? 'new-custom-path'}
      existingPath={selectedCustomPath}
      onBack={() => { setSelectedCustomPath(null); setView('overview') }}
      onStart={(path) => { setCustomPath(path); setSelectedCustomPath(null); setView('overview') }}
    />
  )

  return (
    <section className="grid gap-8 max-[720px]:gap-[30px]" aria-label="Learning paths">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="text-3xl font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Paths</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Continue learning or choose a new path.</p>
      </header>

      <CurrentPathCard path={currentLearnerPath} onOpenDetail={() => { setSelectedPath(null); setView('detail') }} />

      {customPath && (
        <section className="grid gap-4" aria-labelledby="custom-paths-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="custom-paths-title" className="text-[24px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Custom paths</h2>
            <span className="text-[13px] text-[#8b7cf6]">Made with Devy</span>
          </div>
          <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 rounded-2xl border border-[#6c8ee8] bg-[#1d2f5d] px-6 py-5 [[data-theme=light]_&]:border-[#cbd8ff] [[data-theme=light]_&]:bg-[#eff4ff] max-[720px]:grid-cols-1 max-[720px]:px-5">
            <div className="min-w-0">
              <span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#a9c4ff] [[data-theme=light]_&]:text-[#315bb5]">Start here</span>
              <h3 className="mt-1 mb-1 font-rethink-sans text-[21px] font-semibold text-white [[data-theme=light]_&]:text-[#1f3c7c]">{customPath.title}</h3>
              <p className="m-0 text-[14px] leading-[1.5] text-[#dbe6ff] [[data-theme=light]_&]:text-[#3a568d]">{customPath.stages?.[0]?.title} · {customPath.project}</p>
            </div>
            <button type="button" className="min-h-11 rounded-xl border border-white/30 bg-white px-5 text-sm font-semibold text-[#1f3c7c] shadow-[0_3px_0_rgba(24,55,116,0.25)] hover:bg-[#f5f8ff] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3 max-[720px]:w-full" onClick={() => { setSelectedCustomPath(customPath); setView('custom') }}>Continue</button>
          </article>
        </section>
      )}

      <section className="grid gap-5 border-t border-[#404040] pt-7 [[data-theme=light]_&]:border-[#eeeeeb]" aria-labelledby="explore-paths-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="explore-paths-title" className="text-[24px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Explore paths</h2>
          <span className="text-[13px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{explorePaths.length} paths</span>
        </div>
        <div className="flex items-center justify-between gap-4 max-[680px]:items-stretch max-[680px]:flex-col">
          <div className="flex gap-2" role="group" aria-label="Path type">
            {[['all', 'All'], ['career', 'Career paths'], ['skill', 'Skill paths']].map(([value, label]) => {
              const isActive = type === value
              return <button key={value} type="button" aria-pressed={isActive} onClick={() => setType(value)} className={isActive ? 'min-h-[52px] rounded-2xl border border-[#4169e1] bg-[#4169e1] px-5 text-[15px] font-semibold text-white focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3' : 'min-h-[52px] rounded-2xl border border-[#404040] bg-[#252525] px-5 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#525252] focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3'}>{label}</button>
            })}
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search paths"
            aria-label="Search paths"
            className="h-[52px] w-[320px] rounded-2xl border border-[#4a4a4a] bg-[#252525] px-5 text-[15px] text-[#f4f4f2] placeholder:text-[#89898e] outline-none focus:border-[#4169e1] focus:ring-2 focus:ring-[#4169e1]/30 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:placeholder:text-[#737371] max-[680px]:w-full"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          {paths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
        </div>
      </section>

      <CustomPathCard onCreatePath={() => { setSelectedCustomPath(null); setView('custom') }} />
    </section>
  )
}
