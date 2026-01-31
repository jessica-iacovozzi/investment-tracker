import type {
  CompoundingFrequency,
  ContributionTiming,
} from '../types/investment'

type RateInput = {
  annualRatePercent: number
  compoundingFrequency: CompoundingFrequency
}

type TimingInput = {
  monthIndex: number
  timing: ContributionTiming
}

const COMPOUNDING_PERIODS_PER_YEAR: Record<
  CompoundingFrequency,
  number
> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  semimonthly: 24,
  biweekly: 26,
  weekly: 52,
  daily: 365,
  continuously: Number.POSITIVE_INFINITY,
}

const toMonthlyRateFromEffectiveAnnual = (annualRatePercent: number) =>
  Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1

const toMonthlyRateFromNominal = (
  annualRatePercent: number,
  periodsPerYear: number,
) => Math.pow(1 + annualRatePercent / 100 / periodsPerYear, periodsPerYear / 12) - 1

const toMonthlyRateFromContinuous = (annualRatePercent: number) =>
  Math.exp(annualRatePercent / 100 / 12) - 1

export const getEffectiveMonthlyRate = ({
  annualRatePercent,
  compoundingFrequency,
}: RateInput) => {
  if (compoundingFrequency === 'monthly') {
    return toMonthlyRateFromEffectiveAnnual(annualRatePercent)
  }

  if (compoundingFrequency === 'continuously') {
    return toMonthlyRateFromContinuous(annualRatePercent)
  }

  const periodsPerYear = COMPOUNDING_PERIODS_PER_YEAR[compoundingFrequency]
  return toMonthlyRateFromNominal(annualRatePercent, periodsPerYear)
}

export const isTimingMonth = ({ monthIndex, timing }: TimingInput) => {
  if (timing === 'beginning-of-month' || timing === 'end-of-month') {
    return true
  }

  if (timing === 'beginning-of-year') {
    return monthIndex % 12 === 1
  }

  return monthIndex % 12 === 0
}

export const isContributionBeforeCompounding = (timing: ContributionTiming) =>
  timing === 'beginning-of-month' ||
  timing === 'beginning-of-quarter' ||
  timing === 'beginning-of-biweekly' ||
  timing === 'beginning-of-year'
