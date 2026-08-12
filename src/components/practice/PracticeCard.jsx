import { ActionButton } from '../ui/ActionButton'
import { Badge } from '../ui/Badge'
import { CheckIcon } from '../ui/icons'
import { TopicIcon } from './TopicIcon'

const TOPIC_TONES = {
  Python: 'brand',
  SQL: 'data',
  Git: 'progress',
  Data: 'devy',
  Theory: 'neutral',
}

export function PracticeCard({ session, onStart, completion }) {
  const questionLabel = `${session.questions.length} ${session.questions.length === 1 ? 'question' : 'questions'}`

  return (
    <article className="grid min-w-0 gap-4 border-b border-[var(--border-hairline)] p-5 transition-colors last:border-b-0 hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
      <div className="grid min-w-0 gap-3">
        <div className="flex items-center gap-2">
          <Badge tone={TOPIC_TONES[session.topic]}>{session.topic}</Badge>
          {completion && (
            <span className="flex flex-none items-center gap-1 rounded-full bg-[var(--surface-data-tint)] px-2 py-1 text-[11px] font-bold text-[var(--accent-data)]">
              <CheckIcon className="w-3 h-3" />
              {completion.correctCount}/{completion.total}
            </span>
          )}
        </div>
        <h3 className="m-0 font-[var(--font-display)] text-[var(--type-subheading)] font-medium text-[var(--text-primary)]">{session.title}</h3>
        <span className="flex min-w-0 items-center gap-2 text-[var(--text-secondary)]">
          <TopicIcon topic={session.topic} className="w-[18px] h-[18px] flex-none" />
          <span className="meta-copy truncate">{questionLabel} · {session.minutes} min</span>
        </span>
      </div>
      <div className="flex items-center justify-end">
        <ActionButton variant="secondary" className="w-full px-5 text-sm md:w-auto" onClick={() => onStart(session.id)}>
          {completion ? 'Retry' : 'Start'}
        </ActionButton>
      </div>
    </article>
  )
}
