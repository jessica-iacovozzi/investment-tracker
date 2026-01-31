import type {
  CompoundingFrequency,
  ContributionTiming,
} from '../types/investment'

export const DEFAULT_COMPOUNDING_FREQUENCY: CompoundingFrequency = 'monthly'
export const DEFAULT_CONTRIBUTION_TIMING: ContributionTiming = 'end-of-month'

export const COMPOUNDING_FREQUENCIES: CompoundingFrequency[] = [
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

export const CONTRIBUTION_TIMINGS: ContributionTiming[] = [
  'beginning-of-month',
  'end-of-month',
  'beginning-of-quarter',
  'end-of-quarter',
  'beginning-of-biweekly',
  'end-of-biweekly',
  'beginning-of-year',
  'end-of-year',
]

export const COMPOUNDING_FREQUENCY_LABELS: Record<
  CompoundingFrequency,
  string
> = {
  annually: 'Annually',
  semiannually: 'Semiannually',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  semimonthly: 'Semi-monthly',
  biweekly: 'Biweekly',
  weekly: 'Weekly',
  daily: 'Daily',
  continuously: 'Continuously',
}

export const CONTRIBUTION_TIMING_LABELS: Record<ContributionTiming, string> = {
  'beginning-of-month': 'Beginning of month',
  'end-of-month': 'End of month',
  'beginning-of-quarter': 'Beginning of quarter',
  'end-of-quarter': 'End of quarter',
  'beginning-of-biweekly': 'Beginning of biweekly',
  'end-of-biweekly': 'End of biweekly',
  'beginning-of-year': 'Beginning of year',
  'end-of-year': 'End of year',
}

export const CONTRIBUTION_TIMING_HELP_TEXT: Record<
  ContributionTiming,
  string
> = {
  'beginning-of-month': 'Applies before compounding for each month.',
  'end-of-month': 'Applies after compounding for each month.',
  'beginning-of-quarter':
    'Applies before compounding for each scheduled quarterly contribution month.',
  'end-of-quarter':
    'Applies after compounding for each scheduled quarterly contribution month.',
  'beginning-of-biweekly':
    'Applies before compounding for each scheduled biweekly contribution month.',
  'end-of-biweekly':
    'Applies after compounding for each scheduled biweekly contribution month.',
  'beginning-of-year': 'Applies before compounding at each year start.',
  'end-of-year': 'Applies after compounding at each year end.',
}

export const isValidCompoundingFrequency = (
  value: string,
): value is CompoundingFrequency =>
  COMPOUNDING_FREQUENCIES.includes(value as CompoundingFrequency)

export const isValidContributionTiming = (
  value: string,
): value is ContributionTiming =>
  CONTRIBUTION_TIMINGS.includes(value as ContributionTiming)
