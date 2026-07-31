export function LessonArticle({ article }) {
  return (
    <article className="lesson-article" aria-labelledby="lesson-article-title">
      <div className="lesson-article-content">
        <h1 id="lesson-article-title">{article.title}</h1>
        <p className="lesson-article-intro">{article.intro}</p>

        {article.video && (
          <div className="lesson-article-video">
            <div className="lesson-article-video-copy">
              <h2 className="lesson-article-video-title">{article.video.title}</h2>
              <p className="lesson-article-video-subtitle">{article.video.subtitle}</p>
            </div>
            <div className="lesson-article-video-control">
              <button type="button" className="lesson-article-video-play" aria-label={`Play: ${article.video.title}`}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
              </button>
              {article.video.badgeLabel && <span className="lesson-article-video-badge" aria-hidden="true">{article.video.badgeLabel}</span>}
            </div>
            <span className="lesson-article-video-duration">{article.video.duration}</span>
            <img className="lesson-article-video-watermark" src="/assets/logo.svg" alt="" />
          </div>
        )}

        {article.sections.map((section) => (
          <section className="lesson-article-section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <section className="lesson-article-section">
          <h2>{article.diagram.title}</h2>
          <p>{article.diagram.body}</p>
          <div className="lesson-article-diagram" role="img" aria-label={article.diagram.label}>
            {article.diagram.nodes.map((node, index) => (
              <div className="lesson-article-diagram-step" key={node}>
                <span>{node}</span>
                {index < article.diagram.nodes.length - 1 && <i aria-hidden="true">→</i>}
              </div>
            ))}
          </div>
        </section>

        <section className="lesson-article-section">
          <h2>{article.example.title}</h2>
          <p>{article.example.body}</p>
          <pre className="lesson-article-code"><code>{article.example.code}</code></pre>
        </section>

        <aside className="lesson-article-next">
          <span>Up next</span>
          <strong>{article.next.title}</strong>
          <p>{article.next.body}</p>
        </aside>
      </div>
    </article>
  )
}
