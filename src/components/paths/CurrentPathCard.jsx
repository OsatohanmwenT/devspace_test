import { currentPath, currentRegion, nextRegion } from '../../data/paths'

export function CurrentPathCard({ onOpenDetail }) {
  return (
    <section className="learning-overview" aria-labelledby="my-learning-title">
      <span className="paths-eyebrow">My learning</span>
      <h2 id="my-learning-title">Current path</h2>
      <article className="learning-current-card panel path-family-ml">
        <header className="learning-current-header">
          <div className="learning-current-emblem">
            <img src={currentPath.emblem} alt="" />
          </div>
          <div className="learning-current-copy">
            <span className="learning-current-label">{currentPath.level}</span>
            <h3>{currentPath.title}</h3>
            <p>{currentPath.description}</p>
          </div>
          <div className="learning-current-progress">
            <div>
              <span>Path progress</span>
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
          </div>
        </header>

        <section className="learning-current-region-focus" aria-labelledby="current-region-title">
          <div className="learning-current-region-main">
            <span>Current region</span>
            <h4 id="current-region-title">{currentRegion.title}</h4>
            <div>
              <small>Region progress · {currentRegion.progress}</small>
              <div
                className="learning-region-progress-track"
                role="progressbar"
                aria-label={`${currentRegion.title} progress`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={currentRegion.progressValue}
                aria-valuetext={`${currentRegion.progressValue}% complete`}
              >
                <span style={{ width: `${currentRegion.progressValue}%` }} />
              </div>
            </div>
          </div>
          <div className="learning-next-region">
            <span>Next region</span>
            <strong>{nextRegion ? nextRegion.title : 'You’re on the final region'}</strong>
          </div>
        </section>

        <footer className="learning-current-footer">
          <button className="learning-continue-button" aria-label={'Continue ' + currentRegion.title} onClick={onOpenDetail}>Continue</button>
        </footer>
      </article>
    </section>
  )
}
