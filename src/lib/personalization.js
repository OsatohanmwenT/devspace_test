// Cheatsheet personalization reads answers onboarding already collected on
// `profile` — no new questions, just paying off ones already asked. The
// baseline (rule + syntax) never changes; only what's shown open by default
// and whether a mental-model line is prepended does.
export function getCheatsheetPersonalization(profile) {
  const rung = profile?.rung ?? 2
  const immediateNeed = profile?.immediateNeed ?? []
  const wantsInterviewPrep = immediateNeed.includes('interview_prep')
  const wantsExamplesUpFront = rung >= 3 || wantsInterviewPrep || immediateNeed.includes('fix_gaps')
  const wantsMentalModel = rung <= 1

  let reason = null
  if (wantsInterviewPrep) reason = 'Opened early — you said you’re prepping for interviews.'
  else if (wantsExamplesUpFront) reason = 'Opened early based on your experience.'
  else if (wantsMentalModel) reason = 'Extra context added since you’re just starting out.'

  return { rung, wantsExamplesUpFront, wantsMentalModel, reason }
}
