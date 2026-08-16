import { useState } from 'react'
import { practiceSessions, practiceTopics } from '../../data/practice'
import { PracticeCard } from './PracticeCard'

export default function PracticeView({ onStart, completedSessions = {}, currentPath }) {
  const [topic, setTopic] = useState('All')
  const [search, setSearch] = useState('')

  const activeTools = (currentPath?.tools ?? []).map((t) => t.toLowerCase())
  const pathTitle = currentPath?.title?.toLowerCase() ?? ''

  const isRecommendedSession = (session) => {
    const topicLower = session.topic.toLowerCase()
    return activeTools.some((tool) => tool.includes(topicLower) || topicLower.includes(tool))
      || pathTitle.includes(topicLower)
      || (topicLower === 'python' && pathTitle.includes('learning'))
      || (topicLower === 'data' && pathTitle.includes('data'))
  }

  const matchesSession = (session) => {
    const query = search.trim().toLowerCase()
    return (topic === 'All' || session.topic === topic)
      && (!query || session.title.toLowerCase().includes(query))
  }

  const filteredSessions = practiceSessions.filter(matchesSession)

  return (
    <section className="grid gap-7 max-[720px]:gap-6" aria-label="Practice">
      <header className="flex items-end justify-between gap-6 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-2">
        <div className="grid gap-2 max-w-[680px]">
          <h1 className="m-0 text-3xl font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Practice</h1>
          <p className="m-0 text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Keep your skills sharp with quick, repeatable knowledge checks. You earn XP for every round.</p>
        </div>
        <span className="flex-none pb-1.5 text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] whitespace-nowrap" aria-live="polite" aria-atomic="true">
          {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}
        </span>
      </header>

      <div className="flex items-center justify-between gap-3 max-[900px]:flex-col max-[900px]:items-stretch" aria-label="Find a practice session">
        <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto py-0.5" role="group" aria-label="Practice topics">
          {practiceTopics.map((item) => {
            const isActive = topic === item
            return (
              <button
                className={
                  isActive
                    ? 'min-h-11 flex-none rounded-xl border border-[#3b82f6] [[data-theme=light]_&]:border-[#2563eb] bg-[#2563eb] [[data-theme=light]_&]:bg-[#2563eb] px-4 text-[13px] text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] focus-visible:outline-offset-3'
                    : 'min-h-11 flex-none rounded-xl border border-transparent [[data-theme=light]_&]:border-[#d4d4d4] bg-neutral-700/80 [[data-theme=light]_&]:bg-white px-4 text-[13px] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] hover:border-[#8a8a8e] [[data-theme=light]_&]:hover:border-[#737371] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] focus-visible:outline-offset-3'
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
        <input
          id="practice-search"
          className="w-[320px] max-[900px]:w-full min-h-[52px] flex-none rounded-2xl border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-5 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 placeholder:text-[#b8b8bb] [[data-theme=light]_&]:placeholder:text-[#686968] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] focus-visible:outline-offset-2"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search practice sessions..."
          aria-label="Search practice sessions"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
        {filteredSessions.map((session) => (
          <PracticeCard
            key={session.id}
            session={session}
            onStart={onStart}
            completion={completedSessions[session.id]}
            isRecommended={isRecommendedSession(session)}
          />
        ))}
        {filteredSessions.length === 0 && <p className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No sessions match that search. Try a different topic.</p>}
      </div>
    </section>
  )
}
