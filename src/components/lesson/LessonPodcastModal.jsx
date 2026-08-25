import { motion } from 'motion/react'
import { NARRATION_RATES, useLessonPodcast } from './useLessonNarration'

function EqualizerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="2.4" height="6" rx="1.2" fill="currentColor"><animate attributeName="height" values="6;13;6" dur="0.9s" repeatCount="indefinite" /><animate attributeName="y" values="9;5.5;9" dur="0.9s" repeatCount="indefinite" /></rect>
      <rect x="9" y="6" width="2.4" height="12" rx="1.2" fill="currentColor"><animate attributeName="height" values="12;18;12" dur="0.9s" begin="0.15s" repeatCount="indefinite" /><animate attributeName="y" values="6;3;6" dur="0.9s" begin="0.15s" repeatCount="indefinite" /></rect>
      <rect x="14" y="4" width="2.4" height="16" rx="1.2" fill="currentColor"><animate attributeName="height" values="16;9;16" dur="0.9s" begin="0.3s" repeatCount="indefinite" /><animate attributeName="y" values="4;7.5;4" dur="0.9s" begin="0.3s" repeatCount="indefinite" /></rect>
    </svg>
  )
}

function PlayPauseGlyph({ isSpeaking, isPaused, className }) {
  if (isSpeaking && !isPaused) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" /></svg>
  }
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 5v14l12-7L7 5Z" fill="currentColor" /></svg>
}

const FOCUS_RING = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]'

export function LessonPodcastModal({ lesson, onClose }) {
  const podcast = useLessonPodcast(lesson)
  const activeChapter = podcast.chapters[podcast.chapterIndex]

  return (
    <motion.div
      className="fixed inset-0 z-40 grid place-items-center bg-black/65 p-5 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.section
        className="grid w-full max-w-[560px] gap-6 rounded-3xl border border-[#404040] bg-[#1f1f1f] p-6 shadow-[0_24px_60px_rgba(0,0,0,.45)] [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white max-[680px]:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-podcast-title"
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[.1em] text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]">Listen</p>
            <h2 id="lesson-podcast-title" className="mt-1.5 font-rethink-sans text-[24px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{lesson.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className={`grid size-9 flex-none place-items-center rounded-lg border-0 bg-transparent text-[#9a9a9d] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${FOCUS_RING}`}>
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        {!podcast.supported ? (
          <p className="m-0 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Your browser doesn’t support read-aloud narration, but you can still see what this lesson covers below.</p>
        ) : podcast.chapters.length === 0 ? (
          <p className="m-0 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">This lesson doesn’t have narratable content yet.</p>
        ) : (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={podcast.toggle}
              aria-label={podcast.isSpeaking && !podcast.isPaused ? 'Pause' : 'Play'}
              className="grid size-14 flex-none place-items-center rounded-full border-0 bg-[#2f6fed] text-white transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-[#3b82f6] active:translate-y-0"
            >
              <PlayPauseGlyph isSpeaking={podcast.isSpeaking} isPaused={podcast.isPaused} className="size-6" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[13px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{activeChapter?.article?.title ?? 'Ready to play'}</p>
              <p className="m-0 mt-0.5 text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Chapter {podcast.chapterIndex + 1} of {podcast.chapters.length} · {activeChapter?.conceptTitle}</p>
            </div>
            <div className="flex flex-none gap-1" role="group" aria-label="Playback speed">
              {NARRATION_RATES.map((rateOption) => (
                <button
                  key={rateOption}
                  type="button"
                  onClick={() => podcast.changeRate(rateOption)}
                  aria-pressed={podcast.rate === rateOption}
                  className={`min-h-8 rounded-full border px-2.5 text-[12px] font-medium transition-colors ${podcast.rate === rateOption
                    ? 'border-[#2f6fed] bg-[#2f6fed] text-white'
                    : 'border-[#404040] bg-transparent text-[#c4c4c7] hover:border-[#6699ec] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-[#525252]'} ${FOCUS_RING}`}
                >
                  {rateOption}x
                </button>
              ))}
            </div>
          </div>
        )}

        {podcast.chapters.length > 0 && (
          <ol className="grid list-none gap-1 p-0">
            {podcast.chapters.map((chapter, index) => {
              const isActive = index === podcast.chapterIndex
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => podcast.jumpTo(index)}
                    disabled={!podcast.supported}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isActive
                      ? 'bg-[#1d2f5d] [[data-theme=light]_&]:bg-[#eff4ff]'
                      : 'hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5]'} ${FOCUS_RING}`}
                  >
                    <span className={`grid size-6 flex-none place-items-center rounded-full text-[12px] font-semibold ${isActive ? 'bg-[#2f6fed] text-white' : 'bg-[#2b2b2e] text-[#c9c9cc] [[data-theme=light]_&]:bg-[#f1f1ef] [[data-theme=light]_&]:text-[#686968]'}`}>
                      {isActive && podcast.isSpeaking ? <EqualizerIcon className="size-3.5" /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14px] font-medium ${isActive ? 'text-[#a9c4ff] [[data-theme=light]_&]:text-[#315bb5]' : 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'}`}>{chapter.article.title}</span>
                      <span className="block truncate text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{chapter.conceptTitle}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </motion.section>
    </motion.div>
  )
}
