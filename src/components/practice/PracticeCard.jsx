import { ActionButton } from '../ui/ActionButton'

export function PracticeCard({ session, onStart }) {
  return (
    <article className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white p-5">
      <span className="self-start rounded-full bg-[rgba(111,102,236,0.22)] [[data-theme=light]_&]:bg-[#dde8f7] px-2.5 py-1 text-[11px] font-bold tracking-[.04em] text-[#d8d3ff] [[data-theme=light]_&]:text-[#070c72] uppercase">{session.topic}</span>
      <h3 className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-lg font-medium tracking-[-.02em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{session.title}</h3>
      <p className="m-0 text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{session.questions.length} {session.questions.length === 1 ? 'question' : 'questions'} · {session.minutes} min</p>
      <ActionButton variant="neutral" className="mt-1 min-h-10 px-4 text-sm font-medium" onClick={() => onStart(session.id)}>
        Start
      </ActionButton>
    </article>
  )
}
