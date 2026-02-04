import type { AccountInput } from '../types/investment'
import {
  DEFAULT_COMPOUNDING_FREQUENCY,
  DEFAULT_CONTRIBUTION_TIMING,
  isValidCompoundingFrequency,
  isValidContributionTiming,
} from '../constants/compounding'
import {
  DEFAULT_ACCOUNT_TYPE,
  isLockedAccountType,
  isValidAccountType,
} from '../constants/accountTypes'
import { normalizeTimingForFrequency } from './contributionTiming'

type NormalizeAccountInput = {
  account: AccountInput
}

type NormalizeAccountOutput = {
  account: AccountInput
}

export const normalizeAccount = ({
  account,
}: NormalizeAccountInput): NormalizeAccountOutput => {
  const normalizedFrequency = isValidCompoundingFrequency(
    account.compoundingFrequency,
  )
    ? account.compoundingFrequency
    : DEFAULT_COMPOUNDING_FREQUENCY
  const contributionFrequency = account.contribution?.frequency ?? 'monthly'
  const rawTiming = isValidContributionTiming(account.contributionTiming)
    ? account.contributionTiming
    : DEFAULT_CONTRIBUTION_TIMING
  const normalizedTiming = normalizeTimingForFrequency({
    timing: rawTiming,
    frequency: contributionFrequency,
  })

  if (
    import.meta.env.DEV &&
    (normalizedFrequency !== account.compoundingFrequency ||
      normalizedTiming !== account.contributionTiming)
  ) {
    console.warn('Invalid compounding or timing settings found. Using defaults.')
  }

  const normalizedAccountType =
    account.accountType && isValidAccountType(account.accountType)
      ? account.accountType
      : DEFAULT_ACCOUNT_TYPE

  const normalizedIsLockedIn = isLockedAccountType(normalizedAccountType)
    ? true
    : account.isLockedIn

  if (
    import.meta.env.DEV &&
    (!account.accountType || account.accountType !== normalizedAccountType)
  ) {
    console.warn('Missing or invalid account type. Defaulting to non-registered.')
  }

  return {
    account: {
      ...account,
      compoundingFrequency: normalizedFrequency,
      contributionTiming: normalizedTiming,
      accountType: normalizedAccountType,
      isLockedIn: normalizedIsLockedIn,
    },
  }
}
