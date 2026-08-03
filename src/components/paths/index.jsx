import { useState } from 'react'
import { categories, currentPath, explorePaths } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { ExplorePathCard, PathPreview } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ onOpenLesson }) {
  const [view, setView] = useState('overview')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)

  const matchesPath = (path) => {
    const query = search.trim().toLowerCase()
    return (category === 'All' || path.category === category)
      && (!query || `${path.title} ${path.category} ${path.reason}`.toLowerCase().includes(query))
  }

  const recommendedPaths = explorePaths.filter((path) => path.type === 'career' && path.id !== currentPath.id).slice(0, 3)
  const recommendedIds = new Set(recommendedPaths.map((path) => path.id))
  const allPaths = explorePaths.filter((path) => !recommendedIds.has(path.id) && matchesPath(path))

  const selectPath = (path) => {
    if (path.id === currentPath.id) {
      setView('detail')
      return
    }
    setSelectedPath(path)
    setView('preview')
  }

  if (view === 'detail') return <LearningPathDetail path={currentPath} onOpenLesson={onOpenLesson} onBack={() => setView('overview')} />
  if (view === 'preview' && selectedPath) return <PathPreview path={selectedPath} onBack={() => setView('overview')} />

  return (
    <section className="grid gap-10 max-[720px]:gap-[30px]" aria-label="Learning paths">
      <header className="grid gap-[7px] max-w-[680px]">
        {/* <span className="text-[11px] font-semibold tracking-[.1em] uppercase text-[#4169e1] [[data-theme=light]_&]:text-[#19079b]">Your learning space</span> */}
        <h1 className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(36px,4vw,48px)] font-medium tracking-[-.05em]">Learning Paths</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Pick up where you left off, or explore what you want to learn next.</p>
      </header>

      <div className="grid">
        <CurrentPathCard onOpenDetail={() => setView('detail')} />
      </div>

      <div className="grid gap-14 max-[720px]:gap-10">
        <section className="grid gap-4.5" aria-labelledby="recommended-title">
          <div className="flex items-end justify-between gap-5">
            <div>
              <span className="text-[11px] font-semibold tracking-[.1em] uppercase text-[#4169e1]">Recommended for you</span>
              <h2 id="recommended-title" className="mt-[5px] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[28px] font-medium tracking-[-.04em]">Paths that fit your direction</h2>
              <p className="mt-1.5 max-w-[54ch] text-[13px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">Recommendations stay visible while you search the catalogue.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
            {recommendedPaths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
          </div>
        </section>

        <section className="grid gap-5 pt-2 border-t border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb]" aria-labelledby="browse-paths-title">
          <div className="flex items-end justify-between gap-[18px] max-[720px]:items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-[.1em] uppercase text-[#4169e1]">Browse the catalogue</span>
              <h2 id="browse-paths-title" className="mt-[5px] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[28px] font-medium tracking-[-.04em]">Find your next path</h2>
            </div>
            <span className="text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]" aria-live="polite" aria-atomic="true">{allPaths.length} paths</span>
          </div>
          <div className="grid grid-cols-1 items-end gap-3 max-[900px]:items-stretch" aria-label="Find a path">
            <div className="grid gap-2 relative">
              <label htmlFor="path-search" className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['DM_Sans',Arial,sans-serif] text-sm font-semibold">Search paths</label>
              <input
                id="path-search"
                className="w-full min-h-12 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-transparent px-[18px] text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] placeholder:text-[#7d7d80] [[data-theme=light]_&]:placeholder:text-[#737371]"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search career paths or skills..."
              />
            </div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pt-0.5 pb-1" role="group" aria-label="Path categories">
              {categories.map((item) => {
                const isActive = category === item
                return (
                  <button
                    className={
                      isActive
                        ? 'min-h-10 flex-none rounded-full border border-[#291c87] [[data-theme=light]_&]:border-[#19079b] bg-[#291c87] [[data-theme=light]_&]:bg-[#19079b] py-[7px] px-[15px] text-[12px] text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] focus-visible:outline-offset-3'
                        : 'min-h-10 flex-none rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-transparent py-[7px] px-[15px] text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] focus-visible:outline-offset-3'
                    }
                    key={item}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
            {allPaths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
            {allPaths.length === 0 && <p className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No paths match that search. Try a different topic or category.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}

