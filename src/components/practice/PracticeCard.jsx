import { ActionButton } from '../ui/ActionButton'
import { Badge } from '../ui/Badge'
import { CheckIcon } from '../ui/icons'
import { TopicIcon } from './TopicIcon'

export function PracticeCard({ session, onStart, completion }) {
  const questionLabel = `${session.questions.length} ${session.questions.length === 1 ? 'question' : 'questions'}`

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white transition-colors duration-150 hover:border-[#6f66ec] [[data-theme=light]_&]:hover:border-[#6f66ec]">
      <div className="flex flex-col gap-3 p-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <Badge>{session.topic}</Badge>
          {completion && (
            <span className="flex flex-none items-center gap-1 rounded-full bg-[rgba(4,173,192,0.16)] [[data-theme=light]_&]:bg-[#cee9ed] px-2 py-1 text-[11px] font-bold text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">
              <CheckIcon className="w-3 h-3" />
              {completion.correctCount}/{completion.total}
            </span>
          )}
        </div>
        <h3 className="m-0 font-['Rethink_Sans',Arial,sans-serif] text-lg font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{session.title}</h3>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] px-5 py-3.5">
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
