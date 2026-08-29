import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'

// Deliberately generic — no score, no percentage, no streak-of-reviews shown.
// Mastery is a hidden signal; this card only ever says "something is due."
export function ReviewReminderCard({ conceptTitle, onReview }) {
  return (
    <section className="border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px]">
      <div className="flex items-center gap-2.5 mb-3.5">
        <DevyMood mood="neutral" className="size-9 flex-none" />
        <div className="grid gap-1">
          <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px] font-medium">Time for a quick review</strong>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{conceptTitle}</span>
        </div>
      </div>
      <ActionButton variant="neutral" className="w-full min-h-11 text-[15px] font-medium" onClick={onReview}>
        Review now
      </ActionButton>
    </section>
  )
}
