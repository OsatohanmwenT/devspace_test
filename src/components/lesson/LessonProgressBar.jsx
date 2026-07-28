export function LessonProgressBar({ percent, dotCount = 3 }) {
  return (
    <div className="lesson-progress-bar" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
      <span className="lesson-progress-track">
        <span style={{ width: `${percent}%` }} />
      </span>
      {Array.from({ length: dotCount }, (_, index) => (
        <span key={index} className="lesson-progress-dot" />
      ))}
    </div>
  )
}
