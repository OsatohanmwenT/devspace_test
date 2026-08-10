// Derives real progress for a path from what the learner has actually completed.
//
// Before this module, `path.progressValue` and `region.progressValue` were
// hand-authored literals that never moved, while the real record of completion
// (`progress.completedLessons`) was written but never read. Everything that
// shows a percentage, a count, or a "next up" pointer should come from here.
//
// A path is passed in rather than imported so tests can use small fixtures.

/** @typedef {'completed'|'current'|'available'|'locked'} LessonState */

// Authored `state: 'completed'` in data/paths.js is seed data: it places a new
// learner partway along the spine so the current lesson lands on one that has
// authored content. It unions with real completions rather than being replaced,
// because dropping it would make ml-welcome current — and that lesson has no
// content, so the primary CTA would dead-end.
export function isLessonComplete(lesson, completedLessons = {}) {
  return Boolean(completedLessons[lesson.id]) || lesson.state === 'completed'
}

export function toPercent(completed, total) {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

// A region built by `upcomingRegion` in data/paths.js is a placeholder: one
// lesson whose only job is to name what is coming. Counting it as real content
// would report "1 lesson · 1 checkpoint" for a region nobody can learn from.
export function hasAuthoredContent(region) {
  const lessons = region.lessons ?? []
  return !(lessons.length === 1 && lessons[0].id.endsWith('-preview'))
}

// Regions run in array order and lessons within them likewise, so position in
// that flattened spine is what decides unlocking.
export function flattenLessons(path) {
  return (path.cards ?? []).flatMap((region, regionIndex) =>
    (region.lessons ?? []).map((lesson, indexInRegion) => ({ lesson, region, regionIndex, indexInRegion })),
  )
}

export function deriveRegionProgress(region, completedLessons = {}) {
  const lessons = region.lessons ?? []
  const lessonsCompleted = lessons.filter((lesson) => isLessonComplete(lesson, completedLessons)).length
  return {
    lessonsTotal: lessons.length,
    lessonsCompleted,
    percent: toPercent(lessonsCompleted, lessons.length),
  }
}

export function derivePathProgress(path, completedLessons = {}) {
  const sequence = flattenLessons(path)
  const completion = sequence.map((entry) => isLessonComplete(entry.lesson, completedLessons))

  // The first gap in the spine is where the learner is. Completion is checked
  // before position, so finishing a lesson out of order still registers as done
  // without dragging the pointer backwards.
  const currentIndex = completion.indexOf(false)
  const currentEntry = currentIndex === -1 ? null : sequence[currentIndex]
  const currentRegionIndex = currentEntry ? currentEntry.regionIndex : -1

  const regions = (path.cards ?? []).map((region, regionIndex) => {
    const authoredContent = hasAuthoredContent(region)
    const lessons = (region.lessons ?? []).map((lesson, indexInRegion) => {
      const isComplete = isLessonComplete(lesson, completedLessons)
      const isCurrent = currentEntry?.lesson.id === lesson.id

      let state
      if (isComplete) state = 'completed'
      else if (isCurrent) state = 'current'
      else if (regionIndex === currentRegionIndex) state = 'available'
      else state = 'locked'

      return {
        ...lesson,
        state,
        index: indexInRegion,
        regionId: region.id,
        regionIndex,
        isCheckpoint: Boolean(lesson.checkpoint),
        completedAt: completedLessons[lesson.id]?.completedAt ?? null,
      }
    })

    const lessonsCompleted = lessons.filter((lesson) => lesson.state === 'completed').length

    let state
    if (lessons.length && lessonsCompleted === lessons.length) state = 'completed'
    else if (regionIndex === currentRegionIndex) state = 'current'
    else if (regionIndex === currentRegionIndex + 1) state = 'available'
    else state = 'locked'

    return {
      ...region,
      index: regionIndex,
      state,
      lessons,
      lessonsTotal: lessons.length,
      lessonsCompleted,
      percent: toPercent(lessonsCompleted, lessons.length),
      // Only real regions contribute checkpoints — every placeholder lesson
      // carries `checkpoint: true`, which would otherwise inflate the count.
      checkpointsTotal: authoredContent ? lessons.filter((lesson) => lesson.isCheckpoint).length : 0,
      hasAuthoredContent: authoredContent,
    }
  })

  const allLessons = regions.flatMap((region) => region.lessons)
  const lessonsCompleted = allLessons.filter((lesson) => lesson.state === 'completed').length
  const checkpoints = regions.filter((region) => region.hasAuthoredContent).flatMap((region) => region.lessons.filter((lesson) => lesson.isCheckpoint))

  const currentRegion = currentRegionIndex === -1 ? null : regions[currentRegionIndex]
  const currentLesson = currentEntry ? regions[currentRegionIndex].lessons[currentEntry.indexInRegion] : null

  const nextCheckpointIndex = currentIndex === -1
    ? -1
    : sequence.findIndex((entry, index) => index >= currentIndex && entry.lesson.checkpoint && hasAuthoredContent(entry.region))
  const nextCheckpointEntry = nextCheckpointIndex === -1 ? null : sequence[nextCheckpointIndex]

  return {
    pathId: path.id,
    title: path.title,
    authored: path.authored !== false,
    regions,
    regionsTotal: regions.length,
    regionsCompleted: regions.filter((region) => region.state === 'completed').length,
    lessonsTotal: allLessons.length,
    lessonsCompleted,
    percent: toPercent(lessonsCompleted, allLessons.length),
    checkpointsTotal: checkpoints.length,
    checkpointsCompleted: checkpoints.filter((lesson) => lesson.state === 'completed').length,
    currentLesson,
    currentRegion,
    currentRegionIndex,
    nextCheckpoint: nextCheckpointEntry
      ? {
          lesson: regions[nextCheckpointEntry.regionIndex].lessons[nextCheckpointEntry.indexInRegion],
          regionId: nextCheckpointEntry.region.id,
          regionIndex: nextCheckpointEntry.regionIndex,
          lessonsUntil: nextCheckpointIndex - currentIndex,
        }
      : null,
    isComplete: allLessons.length > 0 && currentIndex === -1,
  }
}
