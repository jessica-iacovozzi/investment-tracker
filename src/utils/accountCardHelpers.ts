import type { AccountInput, AccountUpdatePayload } from '../types/investment'
import { normalizeTimingForFrequency } from './contributionTiming'

const clampMonth = (value: number, maxMonth: number) =>
  Math.min(Math.max(value, 1), maxMonth)

/**
 * Adjust a single account's contribution start/end months
 * when the global term changes.
 */
export const adjustContributionRangeForTermChange = (
  account: AccountInput,
  previousTermYears: number,
  newTermYears: number,
): AccountInput => {
  if (!account.contribution) {
    return account
  }

  const previousTotalMonths = Math.max(Math.round(previousTermYears * 12), 1)
  const totalMonths = Math.max(Math.round(newTermYears * 12), 1)
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
    ...account,
    contribution: {
      ...account.contribution,
      startMonth,
      endMonth,
    },
  }
}

/**
 * Adjust all accounts' contribution ranges when the global term changes.
 */
export const adjustAllAccountsForTermChange = (
  accounts: AccountInput[],
  previousTermYears: number,
  newTermYears: number,
): AccountInput[] =>
  accounts.map((account) =>
    adjustContributionRangeForTermChange(account, previousTermYears, newTermYears),
  )

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
