export function ExplorePathCard({ path, onNotice }) {
  return (
    <article className={`explore-path-card panel path-family-${path.family}`}>
      <div className="explore-path-art">
        <img src={path.image} alt="" />
      </div>
      <div className="explore-path-copy">
        <span className="paths-eyebrow">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
        <h3>{path.title}</h3>
        <p className="explore-path-description">{path.reason}</p>
        <div className="explore-path-footer">
          <span className="explore-path-meta">{path.meta}</span>
          <button className="explore-path-action" onClick={() => onNotice(`${path.title} selected`)}>
            {path.type === 'career' ? 'View path' : 'View skill'} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </article>
  )
}
