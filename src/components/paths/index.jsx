import { useState } from 'react'
import { currentPath, explorePaths, getPath, pathShelves } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { CustomPathCard } from './CustomPathCard'
import { CustomPathBuilder } from './CustomPathBuilder'
import { ExplorePathCard, PathPreview } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'
import { PageArrival } from '../ui/PageArrival'

export default function PathsView({ currentLearnerPath = currentPath, completedLessons, onOpenLesson, initialView, customPaths = {}, primaryPathId, onCreateCustomPath, onSwitchPrimaryPath, hasSeenCustomPathIntroduction, onDismissCustomPathIntroduction }) {
  const [view, setView] = useState(initialView ?? 'overview')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)
  const [selectedCustomPath, setSelectedCustomPath] = useState(null)
  const customPathList = Object.values(customPaths)
  const pausedCustomPaths = customPathList.filter((path) => path.id !== primaryPathId)

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

  const activeTargetId = selectedPath ? selectedPath.id : currentLearnerPath.id
  const isSelectedCurrent = activeTargetId === primaryPathId

  if (view === 'detail') {
    return (
      <LearningPathDetail
        path={selectedPath ? getPath(selectedPath.id, customPaths) : currentLearnerPath}
        completedLessons={completedLessons}
        onOpenLesson={onOpenLesson}
        onBack={() => setView('overview')}
        isCurrentPath={isSelectedCurrent}
        onSwitchPrimaryPath={onSwitchPrimaryPath}
      />
    )
  }
  if (view === 'preview' && selectedPath) {
    return (
      <PathPreview
        path={selectedPath}
        onBack={() => setView('overview')}
        isCurrentPath={isSelectedCurrent}
        onSwitchPrimaryPath={onSwitchPrimaryPath}
      />
    )
  }
  if (view === 'custom' && !selectedCustomPath && !hasSeenCustomPathIntroduction) return <PageArrival
    ariaLabel="About custom paths"
    eyebrow="Your learning route"
    title="Build a path around your goal"
    body="Tell Devy what you want to learn, build, or prepare for. You will get a focused route with practice and a project."
    actionLabel="Build my path"
    onContinue={onDismissCustomPathIntroduction}
  />
  if (view === 'custom') return (
    <CustomPathBuilder
      key={selectedCustomPath?.id ?? 'new-custom-path'}
      existingPath={selectedCustomPath}
      isPrimary={selectedCustomPath?.id === primaryPathId}
      onMakePrimary={(path) => { onSwitchPrimaryPath(path.id); setSelectedCustomPath(null); setView('overview') }}
      onBack={() => { setSelectedCustomPath(null); setView('overview') }}
      onStart={(route) => { onCreateCustomPath(route); setSelectedCustomPath(null); setView('overview') }}
    />
  )

  return (
    <section className="grid gap-8 max-[720px]:gap-[30px]" aria-label="Learning paths">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="text-3xl font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Paths</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Continue learning or choose a new path.</p>
      </header>

      <CurrentPathCard path={currentLearnerPath} onOpenDetail={() => { setSelectedPath(null); setView('detail') }} />

      {pausedCustomPaths.length > 0 && (
        <section className="grid gap-4" aria-labelledby="custom-paths-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="custom-paths-title" className="text-[24px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Your custom paths</h2>
            <span className="text-[13px] text-[#8b7cf6]">{pausedCustomPaths.length} made with Devy</span>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
            {pausedCustomPaths.map((path) => {
              return (
                <article key={path.id} className="grid min-h-[196px] content-between gap-5 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-5 transition-colors hover:border-[#5a5a60] hover:bg-[#252525] [&_p]:text-[#9a9a9d] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#bfc7d8] [[data-theme=light]_&]:hover:bg-[#f8faff] [[data-theme=light]_&]:[&_p]:text-[#686968]">
                  <div className="min-w-0">
                    <span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Paused</span>
                    <h3 className="mt-1 mb-2 font-rethink-sans text-[19px] font-semibold leading-[1.25] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{path.title}</h3>
                    <p className="m-0 text-[14px] leading-[1.5] text-[#dbe6ff] [[data-theme=light]_&]:text-[#3a568d]">{path.stages?.[0]?.title} · {path.project}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 max-[720px]:w-full">
                    <button type="button" className="min-h-11 rounded-xl border border-[#404040] bg-transparent px-4 text-sm font-semibold text-[#f4f4f2] hover:border-[#77777b] hover:bg-[#262626] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#f5f5f5]" onClick={() => { setSelectedCustomPath(path); setView('custom') }}>View path</button>
                    <button type="button" className="min-h-11 rounded-xl border-0 bg-transparent px-3 text-sm font-semibold text-[#8b7cf6] hover:bg-[#2a264c] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3 [[data-theme=light]_&]:hover:bg-[#eeebff]" onClick={() => onSwitchPrimaryPath(path.id)}>Make primary</button>
                  </div>
                </article>
              )
            })}
          </div>
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
