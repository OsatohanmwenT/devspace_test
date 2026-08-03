export function HomeSkeleton() {
  return (
    <>
      <aside className="support-rail" aria-hidden="true">
        <section className="panel utility-card streak-card">
          <div className="streak-header">
            <span className="skeleton skeleton-circle size-9" />
            <span className="skeleton size-6 rounded-full" />
          </div>
          <span className="skeleton block h-3 w-4/5 mt-3" />
          <div className="week-row">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="day" key={index}>
                <span className="skeleton skeleton-circle day-dot-icon" />
              </div>
            ))}
          </div>
        </section>

        <section className="panel premium-card">
          <div className="premium-heading">
            <span className="skeleton skeleton-circle size-8" />
            <div className="grid gap-2 w-full">
              <span className="skeleton block h-3 w-3/5" />
              <span className="skeleton block h-3 w-4/5" />
            </div>
          </div>
          <span className="skeleton block h-10 w-full rounded-full" />
        </section>

        <section className="panel league-card">
          <div className="league-heading">
            <span className="skeleton block h-3 w-2/5" />
            <span className="skeleton block h-3 w-1/3" />
          </div>
          <span className="skeleton block h-20 w-full" />
        </section>

        <section className="panel devy-card">
          <div className="devy-card-main">
            <div className="devy-copy grid gap-2">
              <span className="skeleton block h-3 w-1/4" />
              <span className="skeleton block h-5 w-3/5" />
              <span className="skeleton block h-3 w-4/5" />
              <span className="skeleton block h-9 w-32 rounded-full" />
            </div>
            <span className="skeleton skeleton-circle size-16" />
          </div>
        </section>
      </aside>

      <section className="mission-section" aria-hidden="true">
        <span className="skeleton block h-7 w-56" />

        <div className="mission-card-stack">
          <article className="mission-card">
            <div className="mission-copy grid gap-2">
              <span className="skeleton block h-5 w-20 rounded-full" />
              <span className="skeleton block h-6 w-3/5" />
              <span className="skeleton block h-3 w-2/5" />
            </div>

            <div className="mission-object">
              <span className="skeleton skeleton-circle size-24" />
            </div>

            <div className="mission-bottom grid gap-3">
              <span className="skeleton block h-2 w-full rounded-full" />
              <span className="skeleton block h-3 w-2/5" />
              <span className="skeleton block h-11 w-full rounded-full" />
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

