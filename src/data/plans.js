export const TRIAL_DAYS = 7

// Monthly and Annual renew; Lifetime does not. That is a bigger decision than
// the price gap between them, so the two models are chosen first and the note
// under each one says plainly what it commits you to — and what the other model
// would cost instead, so the comparison never requires switching back and forth.
export const PLAN_TYPES = [
  {
    id: 'subscription',
    label: 'Subscription',
    note: 'Renews automatically, and cancelling keeps Premium until the period you already paid for ends.',
    crossRef: 'Rather not have a renewal at all? Lifetime is a single $189 payment.',
  },
  {
    id: 'onetime',
    label: 'One-time',
    note: 'One payment, no renewal and no expiry — Premium stays on for good.',
    crossRef: 'Not ready to commit? A subscription starts at $7 a month billed yearly.',
  },
]

export const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    type: 'subscription',
    priceLabel: '$12',
    period: 'per month',
    billedLabel: 'Billed monthly',
    badge: null,
    savingLabel: null,
  },
  {
    id: 'annual',
    name: 'Annual',
    type: 'subscription',
    priceLabel: '$7',
    period: 'per month',
    billedLabel: '$84 billed yearly',
    badge: 'Best value',
    savingLabel: 'Save 42%',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    type: 'onetime',
    priceLabel: '$189',
    period: 'once',
    billedLabel: 'One payment, forever',
    badge: null,
    savingLabel: null,
  },
]

export function getPlanType(id) {
  return PLAN_TYPES.find((type) => type.id === id) ?? PLAN_TYPES[0]
}

export function getPlansByType(typeId) {
  return plans.filter((plan) => plan.type === typeId)
}

// Every perk here is honest about what it does and does not do — the league
// promotion math never reads `isPremium`, so nothing on this list touches rank.
export const PREMIUM_PERKS = [
  {
    id: 'streak-shield',
    title: 'Streak shield',
    detail: "One missed day a week won't break your streak.",
  },
  {
    id: 'pro-tag',
    title: 'PRO badge',
    detail: 'Your name carries the PRO tag on every board. Cosmetic — it never changes your score.',
  },
  {
    id: 'all-time',
    title: 'All-time standings',
    detail: 'See lifetime totals, not just this week.',
  },
  {
    id: 'replay-xp',
    title: 'Practice replays count',
    detail: 'Redo a session on a later day and still earn px.',
  },
  {
    id: 'full-cohort',
    title: 'Full cohort view',
    detail: 'All 30 learners and every cutoff, not just your window.',
  },
]

export function getPlan(id) {
  return plans.find((plan) => plan.id === id) ?? plans[1]
}
