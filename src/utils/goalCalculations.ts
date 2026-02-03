import type { AccountInput, ContributionFrequency } from '../types/investment'
import type {
  AccountAllocation,
  AllocationStrategy,
  GoalCalculationResult,
} from '../types/goal'
import { getEffectiveMonthlyRate } from './compounding'

const CONTRIBUTION_PERIODS_PER_YEAR: Record<ContributionFrequency, number> = {
  'bi-weekly': 26,
  monthly: 12,
  quarterly: 4,
  annually: 1,
}

const MAX_ITERATIONS = 100
const CONVERGENCE_THRESHOLD = 0.01

/**
 * Calculate the future value of existing accounts without additional contributions.
 */
export const calculateFutureValueWithoutContributions = (
  accounts: AccountInput[],
  termMonths: number,
): number => {
  return accounts.reduce((total, account) => {
    const monthlyRate = getEffectiveMonthlyRate({
      annualRatePercent: account.annualRatePercent,
      compoundingFrequency: account.compoundingFrequency,
    })
    const futureValue = account.principal * Math.pow(1 + monthlyRate, termMonths)
    return total + futureValue
  }, 0)
}

/**
 * Calculate the future value of a series of contributions.
 * Uses the future value of annuity formula.
 */
export const calculateFutureValueOfContributions = (
  contributionPerPeriod: number,
  periodsPerYear: number,
  annualRate: number,
  termMonths: number,
): number => {
  if (annualRate === 0) {
    const totalPeriods = (termMonths / 12) * periodsPerYear
    return contributionPerPeriod * totalPeriods
  }

  const periodicRate = annualRate / 100 / periodsPerYear
  const totalPeriods = (termMonths / 12) * periodsPerYear
  const futureValue =
    contributionPerPeriod *
    ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate)

  return futureValue
}

/**
 * Calculate the weighted average annual rate across all accounts.
 */
export const getWeightedAverageRate = (accounts: AccountInput[]): number => {
  const totalPrincipal = accounts.reduce((sum, acc) => sum + acc.principal, 0)
  if (totalPrincipal === 0) {
    return accounts.length > 0
      ? accounts.reduce((sum, acc) => sum + acc.annualRatePercent, 0) /
          accounts.length
      : 0
  }

  return accounts.reduce(
    (sum, acc) => sum + (acc.annualRatePercent * acc.principal) / totalPrincipal,
    0,
  )
}

/**
 * Calculate the required contribution per period to reach a target balance.
 * Uses an iterative approach to find the contribution amount.
 */
export const calculateRequiredContribution = ({
  accounts,
  targetBalance,
  termYears,
  contributionFrequency,
}: {
  accounts: AccountInput[]
  targetBalance: number
  termYears: number
  contributionFrequency: ContributionFrequency
}): GoalCalculationResult => {
  if (accounts.length === 0) {
    return {
      isReachable: false,
      message: 'Add at least one account to use Goal Mode',
    }
  }

  if (targetBalance <= 0) {
    return {
      isReachable: false,
      message: 'Target balance must be positive',
    }
  }

  if (termYears <= 0) {
    return {
      isReachable: false,
      message: 'Term must be at least 1 year',
    }
  }

  const termMonths = termYears * 12
  const futureValueWithoutContributions = calculateFutureValueWithoutContributions(
    accounts,
    termMonths,
  )

  if (futureValueWithoutContributions >= targetBalance) {
    return {
      isReachable: true,
      requiredContribution: 0,
      message:
        'Congratulations! Your projected balance already exceeds your goal',
    }
  }

  const amountNeeded = targetBalance - futureValueWithoutContributions
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[contributionFrequency]
  const weightedRate = getWeightedAverageRate(accounts)

  if (weightedRate === 0) {
    const totalPeriods = termYears * periodsPerYear
    const requiredContribution = amountNeeded / totalPeriods
    return {
      isReachable: true,
      requiredContribution: Math.ceil(requiredContribution * 100) / 100,
    }
  }

  const periodicRate = weightedRate / 100 / periodsPerYear
  const totalPeriods = termYears * periodsPerYear
  const requiredContribution =
    amountNeeded / ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate)

  if (!isFinite(requiredContribution) || requiredContribution < 0) {
    return {
      isReachable: false,
      message: 'Unable to calculate required contribution',
    }
  }

  return {
    isReachable: true,
    requiredContribution: Math.ceil(requiredContribution * 100) / 100,
  }
}

/**
 * Calculate the required term (in months) to reach a target balance.
 * Uses an iterative binary search approach.
 */
export const calculateRequiredTerm = ({
  accounts,
  targetBalance,
  contributionAmount,
  contributionFrequency,
}: {
  accounts: AccountInput[]
  targetBalance: number
  contributionAmount: number
  contributionFrequency: ContributionFrequency
}): GoalCalculationResult => {
  if (accounts.length === 0) {
    return {
      isReachable: false,
      message: 'Add at least one account to use Goal Mode',
    }
  }

  if (targetBalance <= 0) {
    return {
      isReachable: false,
      message: 'Target balance must be positive',
    }
  }

  if (contributionAmount <= 0) {
    return {
      isReachable: false,
      message: 'Contribution amount must be positive',
    }
  }

  const currentTotal = accounts.reduce((sum, acc) => sum + acc.principal, 0)
  if (currentTotal >= targetBalance) {
    return {
      isReachable: true,
      requiredTermMonths: 0,
      message:
        'Congratulations! Your current balance already exceeds your goal',
    }
  }

  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[contributionFrequency]
  const weightedRate = getWeightedAverageRate(accounts)

  const calculateBalanceAtMonth = (months: number): number => {
    const futureValuePrincipal = calculateFutureValueWithoutContributions(
      accounts,
      months,
    )
    const futureValueContributions = calculateFutureValueOfContributions(
      contributionAmount,
      periodsPerYear,
      weightedRate,
      months,
    )
    return futureValuePrincipal + futureValueContributions
  }

  let lowMonths = 1
  let highMonths = 100 * 12

  const balanceAtMax = calculateBalanceAtMonth(highMonths)
  if (balanceAtMax < targetBalance) {
    return {
      isReachable: false,
      message:
        'This goal cannot be reached with the current contribution. Try increasing the amount or adjusting account rates.',
    }
  }

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const midMonths = Math.floor((lowMonths + highMonths) / 2)
    const balanceAtMid = calculateBalanceAtMonth(midMonths)

    if (Math.abs(balanceAtMid - targetBalance) < CONVERGENCE_THRESHOLD) {
      return {
        isReachable: true,
        requiredTermMonths: midMonths,
      }
    }

    if (balanceAtMid < targetBalance) {
      lowMonths = midMonths + 1
    } else {
      highMonths = midMonths
    }

    if (lowMonths >= highMonths) {
      return {
        isReachable: true,
        requiredTermMonths: highMonths,
      }
    }
  }

  return {
    isReachable: true,
    requiredTermMonths: highMonths,
  }
}

/**
 * Calculate how to allocate contributions across accounts.
 * Currently supports proportional strategy only (Phase 1 MVP).
 */
export const calculateAllocation = ({
  accounts,
  totalContribution,
  strategy,
}: {
  accounts: AccountInput[]
  totalContribution: number
  strategy: AllocationStrategy
}): AccountAllocation[] => {
  if (accounts.length === 0 || totalContribution <= 0) {
    return []
  }

  if (strategy === 'equal') {
    const perAccount = totalContribution / accounts.length
    return accounts.map((account) => ({
      accountId: account.id,
      accountName: account.name,
      suggestedContribution: Math.round(perAccount * 100) / 100,
      currentBalance: account.principal,
      annualRatePercent: account.annualRatePercent,
    }))
  }

  if (strategy === 'highest-return') {
    const sorted = [...accounts].sort(
      (a, b) => b.annualRatePercent - a.annualRatePercent,
    )
    return sorted.map((account, index) => ({
      accountId: account.id,
      accountName: account.name,
      suggestedContribution: index === 0 ? totalContribution : 0,
      currentBalance: account.principal,
      annualRatePercent: account.annualRatePercent,
    }))
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.principal, 0)

  if (totalBalance === 0) {
    const perAccount = totalContribution / accounts.length
    return accounts.map((account) => ({
      accountId: account.id,
      accountName: account.name,
      suggestedContribution: Math.round(perAccount * 100) / 100,
      currentBalance: account.principal,
      annualRatePercent: account.annualRatePercent,
    }))
  }

  return accounts.map((account) => {
    const proportion = account.principal / totalBalance
    const suggestedContribution =
      Math.round(totalContribution * proportion * 100) / 100

    return {
      accountId: account.id,
      accountName: account.name,
      suggestedContribution,
      currentBalance: account.principal,
      annualRatePercent: account.annualRatePercent,
    }
  })
}

/**
 * Format term in months to a human-readable string.
 */
export const formatTermFromMonths = (months: number): string => {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
}
