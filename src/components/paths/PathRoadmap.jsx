import { currentPath } from '../../data/paths'
import { CheckIcon, LockIcon } from '../ui/icons'

const stateLabel = {
  completed: 'Complete',
  current: 'In progress',
  available: 'Ready to start',
  locked: 'Locked',
}

function NodeMark({ region, index }) {
  if (region.state === 'completed') return <CheckIcon />
  if (region.state === 'locked') return <LockIcon />
  return <span>{index + 1}</span>
}

export function PathRoadmap() {
  const regions = currentPath.cards
  const completed = regions.filter((region) => region.state === 'completed').length
  // The route line is drawn between the first and last marker centres,
  // so the filled portion is measured in gaps, not in nodes.
  const fill = regions.length > 1 ? (completed / (regions.length - 1)) * 100 : 0

  return (
    <section className="path-roadmap panel" aria-labelledby="roadmap-title">
      <header className="path-roadmap-header">
        <div>
          <span className="eyebrow">Your route</span>
          <h2 id="roadmap-title">Path roadmap</h2>
        </div>
        <span className="path-roadmap-count">{completed} of {regions.length} regions complete</span>
      </header>

      <ol
        className="path-roadmap-track"
        style={{ '--roadmap-count': regions.length, '--roadmap-fill': fill }}
      >
        {regions.map((region, index) => (
          <li key={region.id} className={`roadmap-node state-${region.state}`}>
            <span className="roadmap-node-marker" aria-hidden="true">
              <NodeMark region={region} index={index} />
            </span>
            <span className="roadmap-node-label">{region.title}</span>
            <span className="roadmap-node-meta">
              {region.state === 'current' && region.progress ? `${region.progress} done` : stateLabel[region.state]}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
