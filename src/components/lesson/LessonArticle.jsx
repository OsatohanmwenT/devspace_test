import { useState } from 'react';
import { RichText } from './RichText';
import { LessonDataTable } from './LessonDataTable';
import { LockIcon } from '../ui/icons';
import { YouTubeSegmentPlayer } from './YouTubeSegmentPlayer';

// "2m 05s" / "45s" — short enough to sit inline next to the framing line,
// precise enough that a learner knows exactly how much of their time it asks.
function formatClipDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

// 322 → "5:22", for the chapter's time range on the poster badge.
function formatTimestamp(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`
}

export function LessonArticle({ article, lessonTitle }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const segments = article.video?.segments ?? []
  const [activeSegmentId, setActiveSegmentId] = useState(segments[0]?.id)
  // Watching one chapter to its end unlocks the next — you can always revisit
  // one you've already finished, but you can't jump ahead without playing
  // it, same "no skipping without watching" rule the video itself enforces
  // by blocking a scrub past the furthest point actually played.
  const [completedSegmentIds, setCompletedSegmentIds] = useState([])
  const activeSegment = segments.find((segment) => segment.id === activeSegmentId) ?? segments[0]
  // Most video blocks today are decorative-only (title/duration for a video
  // that hasn't been recorded yet) — no `videoId`/`segments` behind them.
  // The play button only goes interactive once there's an actual video to
  // play; otherwise it stays the same inert preview card it always was.
  const canPlay = Boolean(article.video?.videoId) && Boolean(activeSegment)
  const furthestUnlockedIndex = segments.reduce(
    (furthest, segment, index) => (completedSegmentIds.includes(segment.id) ? Math.max(furthest, index + 1) : furthest),
    0,
  )

  return (
    <article
      className="h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fafaf8]"
      aria-labelledby="lesson-article-title"
    >
      <div className="max-w-[72ch] mx-auto pt-[clamp(24px,4vw,48px)] px-7 pb-10 max-[720px]:pt-6 max-[720px]:px-5 max-[720px]:pb-9">
        <p className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]">{lessonTitle}</p>
        <h1
          id="lesson-article-title"
          className="m-0 mb-3 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-[27px] max-[720px]:text-[25px] font-semibold leading-[1.16]"
        >
          {article.title}
        </h1>
        <p className="max-w-[72ch] m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[16px] leading-[1.55]">
          {article.intro}
        </p>

        {article.video && (
          <div className="mt-[22px] max-w-[82ch]">
            {/* Chapter chips are pickable before the first play too, so a
                learner chooses which part matters before committing to watch
                anything. Later chapters still unlock only once the one before
                has been watched through. */}
            {canPlay && segments.length > 1 && (
              <div className="mb-2.5 flex flex-wrap gap-2" role="group" aria-label="Video chapter">
                {segments.map((segment, index) => {
                  const unlocked = index <= furthestUnlockedIndex
                  const isActive = segment.id === activeSegmentId
                  return (
                    <button
                      key={segment.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => setActiveSegmentId(segment.id)}
                      aria-pressed={isActive}
                      title={unlocked ? segment.label : `Watch "${activeSegment?.label ?? 'this chapter'}" first`}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium ${isActive ? 'border-[#04adc0] bg-[#213c3f] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#e0f5f7] [[data-theme=light]_&]:text-neutral-800' : unlocked ? 'border-[#4a4a4a] text-[#c4c4c7] hover:border-[#6699ec] cursor-pointer [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-[#525252]' : 'border-[#333336] text-[#68686c] cursor-default [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#a0a0a0]'}`}
                    >
                      {!unlocked && <LockIcon className="size-3" />}
                      {segment.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* The framing line: what this clip is and how long it asks for —
                kept visible through play and every chapter switch, not just on
                the poster before the first click. */}
            {canPlay && (
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="m-0 text-[13px] leading-[1.4] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                  Watch: <span className="font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{activeSegment.label ?? article.video.subtitle ?? article.video.title}</span>
                  <span className="text-[#68686c] [[data-theme=light]_&]:text-[#a0a0a0]"> · {formatClipDuration(activeSegment.endSeconds - activeSegment.startSeconds)} clip</span>
                </p>
                {/* Never force watching to get the idea — a short read-instead
                    version sits right beside it. */}
                {article.video.transcriptSummary && (
                  <button
                    type="button"
                    onClick={() => setShowSummary((open) => !open)}
                    aria-expanded={showSummary}
                    aria-controls="lesson-video-summary"
                    className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[12.5px] font-semibold text-[#6699ec] hover:underline [[data-theme=light]_&]:text-[#2563eb]"
                  >
                    {showSummary ? 'Hide summary' : 'Prefer to read? Show a summary'}
                    <svg className={`size-3.5 transition-transform duration-200 ${showSummary ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4.5 6.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                )}
              </div>
            )}

            {showSummary && article.video.transcriptSummary && (
              <p id="lesson-video-summary" className="m-0 mb-3 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-4 py-3 text-[13.5px] leading-[1.55] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252]">
                {article.video.transcriptSummary}
              </p>
            )}

            {canPlay && isPlaying ? (
              <YouTubeSegmentPlayer
                key={`${article.video.videoId}-${activeSegment.id}`}
                videoId={article.video.videoId}
                startSeconds={activeSegment.startSeconds}
                endSeconds={activeSegment.endSeconds}
                title={article.video.title}
                onSegmentComplete={() => setCompletedSegmentIds((current) => (current.includes(activeSegment.id) ? current : [...current, activeSegment.id]))}
              />
            ) : (
              <div className="relative flex w-full overflow-hidden flex-col items-center justify-center gap-6 rounded-[20px] bg-[#1a1a1a] px-6 py-10 aspect-[16/9] text-center">
                <div className="grid gap-2">
                  <h2 className="m-0 text-[#f4f4f2] font-rethink-sans text-[clamp(22px,3vw,30px)] font-semibold">{article.video.title}</h2>
                  <p className="m-0 text-[rgba(244,244,242,0.55)] text-xs font-bold tracking-[0.14em] uppercase">{article.video.subtitle}</p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!canPlay}
                    className="grid w-16 h-16 place-items-center border-0 rounded-full bg-[#04adc0] text-neutral-800 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] transition-[background,transform] duration-[120ms] ease-in-out enabled:hover:bg-[#2ab9c9] enabled:hover:scale-[1.06] disabled:cursor-default disabled:opacity-80"
                    aria-label={canPlay ? `Play: ${article.video.title}` : `${article.video.title} (video coming soon)`}
                    onClick={() => canPlay && setIsPlaying(true)}
                  >
                    <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
                  </button>
                  {article.video.badgeLabel && (
                    <span
                      className="absolute -right-1.5 -bottom-1.5 grid w-[26px] h-[26px] place-items-center border-2 border-[#121212] rounded-full bg-[#525252] text-white text-[10px] font-bold tracking-[0.02em]"
                      aria-hidden="true"
                    >
                      {article.video.badgeLabel}
                    </span>
                  )}
                </div>
                {/* The timeline to watch, top-right: the picked chapter's own
                    range when there are chapters, otherwise the video's. */}
                <span className="absolute top-3.5 right-4 rounded-md bg-[rgba(255,255,255,0.12)] px-2 py-[3px] text-[#f4f4f2] text-xs font-semibold tabular-nums">
                  {canPlay && segments.length > 1
                    ? `${formatTimestamp(activeSegment.startSeconds)}–${formatTimestamp(activeSegment.endSeconds)}`
                    : article.video.duration}
                </span>
                <img className="absolute left-[18px] bottom-3.5 h-[14px] w-auto opacity-50" src="/assets/logo.svg" alt="" />
              </div>
            )}
          </div>
        )}

        {article.sections.map((section) => (
          <section className="max-w-[72ch] mt-[26px] max-[720px]:mt-6" key={section.title}>
            <h2 className="m-0 mb-2 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-xl font-semibold">{section.title}</h2>
            <p className="m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[15px] leading-[1.6]"><RichText content={section.body} /></p>
          </section>
        ))}

        {article.table && (
          <section className="max-w-[82ch] mt-[26px] max-[720px]:mt-6">
            {article.table.title && (
              <h2 className="m-0 mb-2 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-xl font-semibold">{article.table.title}</h2>
            )}
            {article.table.intro && (
              <p className="m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[15px] leading-[1.6]">{article.table.intro}</p>
            )}
            <LessonDataTable columns={article.table.columns} rows={article.table.rows} rowKey={article.table.rowKey} caption={article.table.caption} />
          </section>
        )}

        {article.diagram && (
          <section className="max-w-[62ch] mt-[26px] max-[720px]:mt-6">
            <h2 className="m-0 mb-2 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-xl font-semibold">{article.diagram.title}</h2>
            <p className="m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[17px] max-[720px]:text-base leading-[1.6]">{article.diagram.body}</p>
            <div
              className="flex items-center flex-wrap gap-2 mt-3.5 border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] rounded-xl bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] p-3.5"
              role="img"
              aria-label={article.diagram.label}
            >
              {article.diagram.nodes.map((node, index) => (
                <div className="flex items-center gap-2" key={node}>
                  <span className="border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] rounded-lg bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-2.5 py-2 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[13px] font-semibold">{node}</span>
                  {index < article.diagram.nodes.length - 1 && <i className="text-[#6699ec] text-[17px] not-italic" aria-hidden="true">→</i>}
                </div>
              ))}
            </div>
          </section>
        )}

        {article.example && (
          <section className="max-w-[62ch] mt-[26px] max-[720px]:mt-6">
            <h2 className="m-0 mb-2 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-xl font-semibold">{article.example.title}</h2>
            <p className="m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[17px] max-[720px]:text-base leading-[1.6]">{article.example.body}</p>
            <pre className="overflow-auto mt-3.5 border border-[#36363c] rounded-xl bg-[#121214] text-[#f4f4f2] px-[18px] py-4 text-sm leading-[1.7] font-rubik"><code>{article.example.code}</code></pre>
          </section>
        )}

        {article.next && (
          <aside className="grid gap-1.5 max-w-[62ch] mt-7 border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] rounded-[14px] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-[18px] py-4">
            <span className="block text-[#6699ec] text-xs font-bold tracking-[0.08em] uppercase">Up next</span>
            <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-xl">{article.next.title}</strong>
            <p className="m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] leading-[1.55]">{article.next.body}</p>
          </aside>
        )}
      </div>
    </article>
  )
}
