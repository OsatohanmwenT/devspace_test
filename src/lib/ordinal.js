// Ranks are read aloud far more often than they are compared, so they need the
// English suffix rather than a bare number. The teens are the trap: 11, 12 and
// 13 take "th" despite ending in 1, 2 and 3.
export function ordinal(value) {
  const lastTwo = Math.abs(value) % 100
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`

  switch (Math.abs(value) % 10) {
    case 1: return `${value}st`
    case 2: return `${value}nd`
    case 3: return `${value}rd`
    default: return `${value}th`
  }
}
