import { ActionButton } from '../ui/ActionButton'
import { DevyLottie } from '../ui/DevyLottie'
import { GameIcon } from '../ui/GameIcon'
import { CheckIcon } from '../ui/icons'

function GateProgress({ done, total, label }) {
  return (
    <span className="grid gap-1.5">
      <span className="flex items-center justify-between gap-3 text-[12px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        <span className="min-w-0 truncate">{label}</span>
        <span className="flex-none tabular-nums">{done}/{total} lessons</span>
      </span>
      <span className="relative h-2 overflow-hidden rounded-full bg-[#333336] [[data-theme=light]_&]:bg-[#ececea]" role="img" aria-label={`${done} of ${total} lessons done`}>
        <span className="absolute inset-y-0 left-0 rounded-full bg-[#6699ec]" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </span>
    </span>
  )
}

function UnitCard({ unit, completion, onStart }) {
  const { session } = unit
  const locked = !unit.unlocked
  return (
    <article
      className={`flex min-h-[196px] min-w-0 flex-col rounded-3xl p-5 ${locked
        ? 'border border-dashed border-[#3a3a3d] bg-transparent [[data-theme=light]_&]:border-[#dededa]'
        : 'bg-[#1f1f1f] shadow-[0_8px_20px_rgba(0,0,0,.08)] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_4px_14px_rgba(20,20,20,.08)]'}`}
      aria-label={`${unit.title}${locked ? ', locked' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className={`grid size-12 flex-none place-items-center overflow-hidden rounded-2xl bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f4] ${locked ? 'opacity-50 grayscale' : ''}`}>
          {unit.image ? <img src={unit.image} alt="" className="size-10 object-contain" /> : null}
        </span>
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#8a8a86]">{unit.level}</span>
          <h3 className={`m-0 font-rethink-sans text-lg font-medium ${locked ? 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#8a8a86]' : 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'}`}>
            {unit.title}
          </h3>
        </span>
        {locked ? (
          <GameIcon name="padlock" className="size-9 flex-none" />
        ) : completion ? (
          <span className="flex flex-none items-center gap-1 rounded-full bg-[rgba(4,173,192,0.16)] px-2 py-1 text-[11px] font-bold text-[#04adc0] [[data-theme=light]_&]:bg-[#cee9ed] [[data-theme=light]_&]:text-[#065f6b]">
            <CheckIcon className="h-3 w-3" />
            {completion.correctCount}/{completion.total}
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-5">
        {locked ? (
          <GateProgress done={unit.gateDone} total={unit.gateTotal} label={unit.requirement} />
        ) : session ? (
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              {session.questions.length} {session.questions.length === 1 ? 'question' : 'questions'} · ~{session.minutes} min
            </span>
            <ActionButton variant="neutral" className="min-h-9 flex-none px-4 text-sm font-medium" onClick={() => onStart(session.id)}>
              {completion ? 'Practice again' : 'Start'}
            </ActionButton>
          </div>
        ) : (
          <p className="m-0 text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Unlocked — practice questions for this unit are on the way.</p>
        )}
      </div>
    </article>
  )
}

// Practice is earned, not browsed: each unit of the learner's path hands out a
// practice set once its checkpoint is passed (lib/practiceUnits), built from
// what that unit taught. Before the first one unlocks, the page says exactly
// what stands in the way instead of offering a catalogue of things not yet
// learned.
export default function PracticeView({ units = [], completedSessions = {}, onStart, onContinueLearning }) {
  const ready = units.filter((unit) => unit.session)
  const nextLocked = units.find((unit) => !unit.unlocked)

  return (
    <section className="grid gap-7 max-[720px]:gap-6" aria-label="Practice">
      <header className="grid max-w-[680px] gap-2">
        <h1 className="m-0 font-rethink-sans text-3xl font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Practice</h1>
        <p className="m-0 text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          Every unit you pass earns a practice set built from what it taught. Sets unlock at each unit’s checkpoint.
        </p>
      </header>

      {ready.length === 0 && (
        <div className="flex items-center gap-6 rounded-3xl bg-[#1f1f1f] p-6 shadow-[0_8px_20px_rgba(0,0,0,.08)] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_4px_14px_rgba(20,20,20,.08)] max-[680px]:flex-col max-[680px]:items-start">
          <DevyLottie clip="wave" className="size-[112px] flex-none max-[680px]:size-24" />
          <div className="grid min-w-0 flex-1 gap-3">
            <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.08em] text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]">
              <GameIcon name="padlock" className="size-5" />
              Practice is locked
            </span>
            <h2 className="m-0 font-rethink-sans text-[22px] font-semibold leading-tight text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
              {nextLocked ? `${nextLocked.requirement} to unlock your first practice set` : 'Your first practice set is on the way'}
            </h2>
            {nextLocked && (
              <div className="max-w-[420px]">
                <GateProgress done={nextLocked.gateDone} total={nextLocked.gateTotal} label={nextLocked.title} />
              </div>
            )}
            {onContinueLearning && (
              <ActionButton variant="primary" className="min-h-11 w-fit px-6 text-sm font-semibold" onClick={onContinueLearning}>
                Continue learning
              </ActionButton>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} completion={completedSessions[unit.id]} onStart={onStart} />
        ))}
      </div>
    </section>
  )
}
