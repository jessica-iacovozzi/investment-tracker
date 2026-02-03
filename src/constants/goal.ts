import type { AllocationStrategy, CalculationType } from '../types/goal'
import type { ContributionFrequency } from '../types/investment'

export const CALCULATION_TYPE_LABELS: Record<CalculationType, string> = {
  contribution: 'Calculate Contribution',
  term: 'Calculate Term',
}

export const ALLOCATION_STRATEGY_LABELS: Record<AllocationStrategy, string> = {
  proportional: 'Proportional to balance',
  'highest-return': 'Highest return first',
  equal: 'Equal split',
}

export const CONTRIBUTION_FREQUENCY_LABELS: Record<ContributionFrequency, string> = {
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

export const CONTRIBUTION_FREQUENCIES: ContributionFrequency[] = [
  'bi-weekly',
  'monthly',
  'quarterly',
  'annually',
]

export const GOAL_VALIDATION = {
  MIN_TARGET_BALANCE: 1,
  MAX_TARGET_BALANCE: 100000000,
  MIN_TERM_YEARS: 1,
  MAX_TERM_YEARS: 100,
  MIN_CONTRIBUTION: 1,
}
