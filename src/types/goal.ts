import type { ContributionFrequency } from './investment'

export type CalculationType = 'contribution' | 'term'

export type AllocationStrategy = 'proportional' | 'highest-return' | 'equal'

export type GoalState = {
  isGoalMode: boolean
  targetBalance: number
  calculationType: CalculationType
  contributionFrequency: ContributionFrequency
  contributionAmount?: number
  termYears?: number
  allocationStrategy: AllocationStrategy
}

export type GoalCalculationResult = {
  isReachable: boolean
  requiredContribution?: number
  requiredTermMonths?: number
  message?: string
}

export type AccountAllocation = {
  accountId: string
  accountName: string
  suggestedContribution: number
  currentContribution: number
  additionalContribution: number
  currentBalance: number
  annualRatePercent: number
}

export const DEFAULT_GOAL_STATE: GoalState = {
  isGoalMode: false,
  targetBalance: 1000000,
  calculationType: 'contribution',
  contributionFrequency: 'monthly',
  termYears: 30,
  allocationStrategy: 'proportional',
}
