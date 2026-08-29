// Every string a share button ever sends anywhere is built here, from real
// numbers a caller already has — nothing in this file invents a stat, and
// nothing outside it is allowed to hand-roll share copy of its own.
import { formatPercentileBadge } from './seasonRecap.js'

export function rankClimbShareText({ positions, rank, league }) {
  return `I climbed ${positions} place${positions === 1 ? '' : 's'} this season. I'm now #${rank} in Devspace ${league}.`
}

export function cashZoneShareText({ league, reward }) {
  return reward > 0
    ? `I just entered a reward position in Devspace ${league} — ₦${reward.toLocaleString()} and counting.`
    : `I just entered a reward position in Devspace ${league}.`
}

export function qualifiedShareText({ league }) {
  return `I qualified for Devspace ${league}!`
}

export function promotionShareText({ league }) {
  return `${league.toUpperCase()} UNLOCKED. I just moved up in Devspace.`
}

export function seasonResultShareText({ league, seasonNumber, rank, coins, percentile }) {
  return `Devspace ${league} · Season ${seasonNumber} — #${rank}, ${coins.toLocaleString()} Devy Coins, ${formatPercentileBadge(percentile).toLowerCase()}.`
}

// Private leagues don't exist yet, so there's no real invite code to hand
// out — this is deliberately just an invitation to try the product, not a
// claim that joining it will do anything trackable. Swap this out for a real
// invite link the moment private leagues land.
export function inviteShareText() {
  return 'Come learn with me on Devspace.'
}
