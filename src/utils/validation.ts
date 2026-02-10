import type {
  AccountInput,
  ContributionSchedule,
  ContributionFrequency,
  CompoundingFrequency,
  ContributionTiming,
  AccountType,
} from '../types/investment'
import type { GoalState, CalculationType, AllocationStrategy } from '../types/goal'
import type { InflationState } from '../types/inflation'

const VALID_CONTRIBUTION_FREQUENCIES: ContributionFrequency[] = [
  'bi-weekly',
  'monthly',
  'quarterly',
  'annually',
]

const VALID_COMPOUNDING_FREQUENCIES: CompoundingFrequency[] = [
  'annually',
  'semiannually',
  'quarterly',
  'monthly',
  'semimonthly',
  'biweekly',
  'weekly',
  'daily',
  'continuously',
]

const VALID_CONTRIBUTION_TIMINGS: ContributionTiming[] = [
  'beginning-of-month',
  'end-of-month',
  'beginning-of-quarter',
  'end-of-quarter',
  'beginning-of-biweekly',
  'end-of-biweekly',
  'beginning-of-year',
  'end-of-year',
]

const VALID_ACCOUNT_TYPES: AccountType[] = [
  'tfsa',
  'rrsp',
  'fhsa',
  'lira',
  'non-registered',
]

const VALID_CALCULATION_TYPES: CalculationType[] = ['contribution', 'term']

const VALID_ALLOCATION_STRATEGIES: AllocationStrategy[] = [
  'proportional',
  'highest-return',
  'equal',
]

/** Maximum localStorage payload size in bytes (1 MB). */
export const MAX_STORAGE_PAYLOAD_BYTES = 1_048_576

/**
 * Strip ASCII control characters (U+0000–U+001F and U+007F) from a string.
 */
const stripControlChars = (input: string): string =>
  Array.from(input)
    .filter((char) => {
      const code = char.charCodeAt(0)
      return (code > 0x1f && code !== 0x7f)
    })
    .join('')

const MAX_ACCOUNT_NAME_LENGTH = 100

/**
 * Check whether a raw localStorage string is within the size limit.
 */
export const isStoragePayloadWithinLimit = (raw: string): boolean =>
  new Blob([raw]).size <= MAX_STORAGE_PAYLOAD_BYTES

/**
 * Validate that `data` conforms to the ContributionSchedule shape.
 */
export const isValidContributionSchedule = (
  data: unknown,
): data is ContributionSchedule => {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.amount === 'number' &&
    typeof obj.frequency === 'string' &&
    VALID_CONTRIBUTION_FREQUENCIES.includes(
      obj.frequency as ContributionFrequency,
    ) &&
    typeof obj.startMonth === 'number' &&
    obj.startMonth >= 1 &&
    typeof obj.endMonth === 'number' &&
    obj.endMonth >= 1
  )
}

/**
 * Validate that `data` conforms to the AccountInput shape.
 */
export const isValidAccountInput = (
  data: unknown,
): data is AccountInput => {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  const hasRequiredFields =
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.principal === 'number' &&
    typeof obj.annualRatePercent === 'number' &&
    typeof obj.compoundingFrequency === 'string' &&
    VALID_COMPOUNDING_FREQUENCIES.includes(
      obj.compoundingFrequency as CompoundingFrequency,
    ) &&
    typeof obj.contributionTiming === 'string' &&
    VALID_CONTRIBUTION_TIMINGS.includes(
      obj.contributionTiming as ContributionTiming,
    ) &&
    typeof obj.accountType === 'string' &&
    VALID_ACCOUNT_TYPES.includes(obj.accountType as AccountType)

  if (!hasRequiredFields) return false

  if (obj.contribution !== undefined && obj.contribution !== null) {
    return isValidContributionSchedule(obj.contribution)
  }

  return true
}

/**
 * Validate that `data` is an array where every element is a valid AccountInput.
 */
export const isValidAccountInputArray = (
  data: unknown,
): data is AccountInput[] => {
  if (!Array.isArray(data)) return false

  return data.every(isValidAccountInput)
}

/**
 * Validate that `data` conforms to the GoalState shape.
 */
export const isValidGoalState = (
  data: unknown,
): data is GoalState => {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.isGoalMode === 'boolean' &&
    typeof obj.targetBalance === 'number' &&
    typeof obj.calculationType === 'string' &&
    VALID_CALCULATION_TYPES.includes(obj.calculationType as CalculationType) &&
    typeof obj.contributionFrequency === 'string' &&
    VALID_CONTRIBUTION_FREQUENCIES.includes(
      obj.contributionFrequency as ContributionFrequency,
    ) &&
    typeof obj.allocationStrategy === 'string' &&
    VALID_ALLOCATION_STRATEGIES.includes(
      obj.allocationStrategy as AllocationStrategy,
    )
  )
}

/**
 * Validate that `data` conforms to the InflationState shape.
 */
export const isValidInflationState = (
  data: unknown,
): data is InflationState => {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.isEnabled === 'boolean' &&
    typeof obj.annualRatePercent === 'number'
  )
}

/**
 * Sanitize an account name: strip control characters, trim, and cap length.
 */
export const sanitizeName = (name: unknown): string => {
  if (typeof name !== 'string') return ''

  return stripControlChars(name).trim().slice(0, MAX_ACCOUNT_NAME_LENGTH)
}
