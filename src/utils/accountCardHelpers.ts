import type { AccountInput, AccountUpdatePayload } from '../types/investment'
import { normalizeTimingForFrequency } from './contributionTiming'

const clampMonth = (value: number, maxMonth: number) =>
  Math.min(Math.max(value, 1), maxMonth)

/**
 * When the term changes, adjust the contribution start/end months
 * so they stay within the new total-months range.
 */
export const adjustContributionRange = (
  account: AccountInput,
  payload: AccountUpdatePayload,
): AccountUpdatePayload => {
  if (!payload.changes.termYears || !account.contribution) {
    return payload
  }

  const previousTotalMonths = Math.max(Math.round(account.termYears * 12), 1)
  const totalMonths = Math.max(Math.round(payload.changes.termYears * 12), 1)
  const startMonth = clampMonth(account.contribution.startMonth, totalMonths)
  const shouldExtendEndMonth =
    totalMonths > previousTotalMonths &&
    account.contribution.endMonth === previousTotalMonths
  const endMonthBase = shouldExtendEndMonth
    ? totalMonths
    : account.contribution.endMonth
  const endMonth = clampMonth(
    Math.max(endMonthBase, startMonth),
    totalMonths,
  )

  return {
    ...payload,
    changes: {
      ...payload.changes,
      contribution: {
        ...account.contribution,
        startMonth,
        endMonth,
      },
    },
  }
}

/**
 * If the contribution frequency changes, ensure the timing value
 * is still valid for the new frequency.
 */
export const normalizeContributionTiming = (
  account: AccountInput,
  payload: AccountUpdatePayload,
): AccountUpdatePayload => {
  const nextContribution = payload.changes.contribution ?? account.contribution
  if (!nextContribution) {
    return payload
  }

  const nextTiming = payload.changes.contributionTiming ?? account.contributionTiming
  const normalizedTiming = normalizeTimingForFrequency({
    timing: nextTiming,
    frequency: nextContribution.frequency,
  })

  if (normalizedTiming === nextTiming) {
    return payload
  }

  return {
    ...payload,
    changes: {
      ...payload.changes,
      contributionTiming: normalizedTiming,
    },
  }
}
