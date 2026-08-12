import { useState } from 'react'
import { practiceSessions, practiceTopics } from '../../data/practice'
import { PracticeCard } from './PracticeCard'

export default function PracticeView({ onStart, completedSessions = {} }) {
  const [topic, setTopic] = useState('All')
  const [search, setSearch] = useState('')

  const matchesSession = (session) => {
    const query = search.trim().toLowerCase()
    return (topic === 'All' || session.topic === topic)
      && (!query || session.title.toLowerCase().includes(query))
  }

  const filteredSessions = practiceSessions.filter(matchesSession)

  return (
    <section className="grid gap-8" aria-labelledby="practice-title">
      <header className="flex items-end justify-between gap-6 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
        <div className="grid max-w-2xl gap-3">
          <h1 id="practice-title" className="page-title">Practice</h1>
          <p className="body-copy m-0">Keep your skills sharp with quick, repeatable knowledge checks. You earn XP for every round.</p>
        </div>
        <span className="meta-copy flex-none whitespace-nowrap" aria-live="polite" aria-atomic="true">
          {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}
        </span>
      </header>

      <div className="grid gap-4 rounded-[var(--radius-card)] bg-[var(--surface-brand-tint)] p-4 md:grid-cols-[18rem_minmax(0,1fr)]" aria-label="Find a practice session">
        <div>
          <label className="sr-only" htmlFor="practice-search">Search practice sessions</label>
          <input
            id="practice-search"
            className="form-control w-full px-4 text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search practice sessions..."
          />
        </div>
        <div className="flex min-w-0 flex-wrap gap-2 py-0.5" role="group" aria-label="Practice topics">
          {practiceTopics.map((item) => {
            const isActive = topic === item
            return (
              <button
                className="control-pill flex-none px-4 text-[var(--type-label)] font-medium"
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

      <div className="surface-card overflow-hidden">
        {filteredSessions.map((session) => (
          <PracticeCard key={session.id} session={session} onStart={onStart} completion={completedSessions[session.id]} />
        ))}
        {filteredSessions.length === 0 && (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div className="grid max-w-md gap-2">
              <h2 className="section-title">No practice sessions found</h2>
              <p className="body-copy m-0">Try a different topic or clear your search to see every available session.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
