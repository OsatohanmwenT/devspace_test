import { currentPath, currentRegion, detailLevels } from '../../data/paths'

export function CurrentPathCard({ onOpenDetail }) {
  const nextLesson = detailLevels.flatMap((level) => level.lessons).find((lesson) => lesson.state === 'current')
  const completedRegions = currentPath.cards.filter((region) => region.state === 'completed').length

  return (
    <section className="learning-overview" aria-labelledby="my-learning-title">
      <article className="learning-current-card panel path-family-ml">
        <header className="learning-current-header">
          <div className="learning-current-emblem">
            <img src={currentPath.emblem} alt="" />
          </div>
          <div className="learning-current-copy">
            <span className="learning-current-label">{currentPath.level}</span>
            <h2 id="my-learning-title">{currentPath.title}</h2>
          </div>
          <div className="learning-current-progress">
            <div>
              <strong>{currentPath.progress}</strong>
            </div>
            <div
              className="learning-current-progress-track"
              role="progressbar"
              aria-label={`${currentPath.title} progress`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={currentPath.progressValue}
              aria-valuetext={`${currentPath.progressValue}% complete`}
            >
              <span style={{ width: `${currentPath.progressValue}%` }} />
            </div>
            <small>{completedRegions} of {currentPath.cards.length} regions completed</small>
          </div>
        </header>

        <section className="learning-current-region-focus" aria-labelledby="current-region-title">
          <div className="learning-current-region-main">
            <span>Continue with</span>
            <h3 id="current-region-title">{currentRegion.title}</h3>
            <p><strong>Next lesson: {nextLesson?.title}</strong>{nextLesson?.description && ` — ${nextLesson.description}`}</p>
            <small>{currentRegion.progress} complete</small>
          </div>
          <button className="learning-continue-button" aria-label={'Continue ' + currentRegion.title} onClick={onOpenDetail}>Continue</button>
        </section>
      </article>
    </section>
  )
}
