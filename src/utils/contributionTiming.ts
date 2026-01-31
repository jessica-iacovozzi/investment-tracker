import type {
  ContributionFrequency,
  ContributionTiming,
} from '../types/investment'

// Valid timing options per contribution frequency.
const FREQUENCY_TIMING_MAP: Record<
  ContributionFrequency,
  ContributionTiming[]
> = {
  'bi-weekly': ['beginning-of-biweekly', 'end-of-biweekly'],
  monthly: ['beginning-of-month', 'end-of-month'],
  quarterly: ['beginning-of-quarter', 'end-of-quarter'],
  annually: ['beginning-of-year', 'end-of-year'],
}

const DEFAULT_TIMING_MAP: Record<ContributionFrequency, ContributionTiming> = {
  'bi-weekly': 'end-of-biweekly',
  monthly: 'end-of-month',
  quarterly: 'end-of-quarter',
  annually: 'end-of-year',
}

export const getValidTimingsForFrequency = (
  frequency: ContributionFrequency,
) => FREQUENCY_TIMING_MAP[frequency]

export const getDefaultTimingForFrequency = (
  frequency: ContributionFrequency,
) => DEFAULT_TIMING_MAP[frequency]

export const isTimingValidForFrequency = ({
  timing,
  frequency,
}: {
  timing: ContributionTiming
  frequency: ContributionFrequency
}) => getValidTimingsForFrequency(frequency).includes(timing)

export const normalizeTimingForFrequency = ({
  timing,
  frequency,
}: {
  timing: ContributionTiming
  frequency: ContributionFrequency
}) =>
  isTimingValidForFrequency({ timing, frequency })
    ? timing
    : getDefaultTimingForFrequency(frequency)
