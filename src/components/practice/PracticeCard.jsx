import { ActionButton } from '../ui/ActionButton'
import { Badge } from '../ui/Badge'
import { CheckIcon } from '../ui/icons'
import { TopicIcon } from './TopicIcon'

const TOPIC_TONES = {
  Python: 'blue',
  SQL: 'teal',
  Git: 'orange',
  Data: 'violet',
  Theory: 'pink',
}

export function PracticeCard({ session, onStart, completion, isRecommended = false }) {
  const questionLabel = `${session.questions.length} ${session.questions.length === 1 ? 'question' : 'questions'}`

  return (
    <article className="flex min-h-[180px] min-w-0 flex-col rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,.08)] [[data-theme=light]_&]:shadow-[0_4px_14px_rgba(20,20,20,.08)] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge tone={TOPIC_TONES[session.topic]}>{session.topic}</Badge>
            {isRecommended && (
              <span className="rounded-full bg-[#6699ec]/15 [[data-theme=light]_&]:bg-[#eff4ff] px-2 py-0.5 text-[10.5px] font-semibold text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]">
                Recommended
              </span>
            )}
          </div>
          {completion && (
            <span className="flex flex-none items-center gap-1 rounded-full bg-[rgba(4,173,192,0.16)] [[data-theme=light]_&]:bg-[#cee9ed] px-2 py-1 text-[11px] font-bold text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">
              <CheckIcon className="w-3 h-3" />
              {completion.correctCount}/{completion.total}
            </span>
          )}
        </div>
        <h3 className="m-0 font-rethink-sans text-lg font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{session.title}</h3>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="flex min-w-0 items-center gap-2 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          <TopicIcon topic={session.topic} className="w-[18px] h-[18px] flex-none" />
          <span className="truncate text-xs">{questionLabel} · {session.minutes} min</span>
        </span>
        <ActionButton variant="neutral" className="min-h-9 flex-none px-4 text-sm font-medium" onClick={() => onStart(session.id)}>
          {completion ? 'Retry' : 'Start'}
        </ActionButton>
      </div>
    </article>
  )
}
