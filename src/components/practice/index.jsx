import { useState } from 'react'
import { practiceSessions, practiceTopics } from '../../data/practice'
import { PracticeCard } from './PracticeCard'

export default function PracticeView({ onStart }) {
  const [topic, setTopic] = useState('All')
  const [search, setSearch] = useState('')

  const matchesSession = (session) => {
    const query = search.trim().toLowerCase()
    return (topic === 'All' || session.topic === topic)
      && (!query || session.title.toLowerCase().includes(query))
  }

  const filteredSessions = practiceSessions.filter(matchesSession)

  return (
    <section className="grid gap-10 max-[720px]:gap-[30px]" aria-label="Practice">
      {/* <header className="grid gap-[7px] max-w-[680px]">
        <span className="self-start text-[11px] font-semibold tracking-[.1em] uppercase text-[#4169e1]">Reinforce what you're learning</span>
        <h1 className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(36px,4vw,48px)] font-medium tracking-[-.05em]">Practice</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Keep your skills sharp with quick, repeatable knowledge checks. You earn XP for every round.</p>
      </header> */}

      <section className="grid gap-5" aria-labelledby="practice-sessions-title">
        <div className="flex items-center justify-between gap-[18px] max-[720px]:items-start">
          <div>
          <h2 id="practice-sessions-title" className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-[28px] font-medium tracking-[-.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">Practice sessions</h2>
                    <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Keep your skills sharp with quick, repeatable knowledge checks. You earn XP for every round.</p>
          </div>
          
          <span className="text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]" aria-live="polite" aria-atomic="true">{filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}</span>
        </div>

        <div className="grid grid-cols-1 items-end gap-3 max-[900px]:items-stretch" aria-label="Find a practice session">
          <div className="grid gap-2 relative">
            <label htmlFor="practice-search" className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['DM_Sans',Arial,sans-serif] text-sm font-semibold">Search sessions</label>
            <input
              id="practice-search"
              className="w-full min-h-12 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-transparent px-[18px] text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] placeholder:text-[#7d7d80] [[data-theme=light]_&]:placeholder:text-[#737371]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search practice sessions..."
            />
          </div>
          <div className="flex flex-nowrap overflow-x-auto gap-2 pt-0.5 pb-1" role="group" aria-label="Practice topics">
            {practiceTopics.map((item) => {
              const isActive = topic === item
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
                  onClick={() => setTopic(item)}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          {filteredSessions.map((session) => <PracticeCard key={session.id} session={session} onStart={onStart} />)}
          {filteredSessions.length === 0 && <p className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No sessions match that search. Try a different topic.</p>}
        </div>
      </section>
    </section>
  )
}
