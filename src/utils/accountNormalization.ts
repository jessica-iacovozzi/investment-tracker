import type { AccountInput } from '../types/investment'
import {
  DEFAULT_COMPOUNDING_FREQUENCY,
  DEFAULT_CONTRIBUTION_TIMING,
  isValidCompoundingFrequency,
  isValidContributionTiming,
} from '../constants/compounding'
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

  return {
    account: {
      ...account,
      compoundingFrequency: normalizedFrequency,
      contributionTiming: normalizedTiming,
    },
  }
}
