import type { AccountInput, ContributionFrequency } from '../types/investment'
import type {
  AccountAllocation,
  AllocationStrategy,
  GoalCalculationResult,
} from '../types/goal'
import { getEffectiveMonthlyRate } from './compounding'
import { buildProjection } from './projections'
import { getAnnualContributionRoomLimits, getAnnualProjectedContributions } from './contributionRoom'
import { isTaxAdvantagedAccount } from '../constants/accountTypes'
import { getAccountsByType, getMostRecentAccountByType } from './sharedContributionRoom'

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
 * Calculate the projected future value of accounts including their existing contributions.
 */
export const calculateFutureValueWithExistingContributions = (
  accounts: AccountInput[],
  termYears: number,
): number => {
  return accounts.reduce((total, account) => {
    const accountWithTerm = { ...account, termYears }
    const projection = buildProjection(accountWithTerm)
    return total + projection.totals.finalBalance
  }, 0)
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

  const futureValueWithExistingContributions = calculateFutureValueWithExistingContributions(
    accounts,
    termYears,
  )

  if (futureValueWithExistingContributions >= targetBalance) {
    return {
      isReachable: true,
      requiredContribution: 0,
      message:
        'Congratulations! Your projected balance already exceeds your goal',
    }
  }

  const termMonths = termYears * 12
  const futureValueWithoutContributions = calculateFutureValueWithoutContributions(
    accounts,
    termMonths,
  )
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
 * Normalize a contribution amount to monthly equivalent.
 */
const normalizeToMonthly = (
  amount: number,
  frequency: ContributionFrequency,
): number => {
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[frequency]
  return (amount * periodsPerYear) / 12
}

/**
 * Convert monthly amount to target frequency.
 */
const convertFromMonthly = (
  monthlyAmount: number,
  targetFrequency: ContributionFrequency,
): number => {
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[targetFrequency]
  return (monthlyAmount * 12) / periodsPerYear
}

/**
 * Aggregate annual projected contributions across accounts.
 */
const getCombinedAnnualProjectedContributions = (
  accounts: AccountInput[],
  termYears: number,
): number[] => {
  if (termYears <= 0) {
    return []
  }

  const totals = Array.from({ length: termYears }, () => 0)
  accounts.forEach((account) => {
    const annualContributions = getAnnualProjectedContributions(account, termYears)
    annualContributions.forEach((amount, index) => {
      totals[index] = Math.round((totals[index] + amount) * 100) / 100
    })
  })

  return totals
}

const getInitialAnnualRoom = (annualRooms: number[]): number =>
  annualRooms[0] ?? 0

/**
 * Get the maximum contribution room available for goal allocation.
 * Returns the total available room converted to the target frequency.
 * Returns undefined for non-tax-advantaged accounts (no limit).
 * When allAccounts is provided, calculates shared room minus other same-type accounts' contributions.
 */
const getAvailableRoomForAllocation = (
  account: AccountInput,
  termYears: number,
  targetFrequency: ContributionFrequency,
  allAccounts?: AccountInput[],
): number | undefined => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return undefined
  }

  if (termYears <= 0) {
    return 0
  }

  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[targetFrequency]
  if (periodsPerYear <= 0) {
    return 0
  }

  if (!allAccounts) {
    const annualRooms = getAnnualContributionRoomLimits(account, termYears)
    const initialAnnualRoom = getInitialAnnualRoom(annualRooms)
    return Math.round((initialAnnualRoom / periodsPerYear) * 100) / 100
  }

  const sameTypeAccounts = getAccountsByType(allAccounts, account.accountType)
  const mostRecentAccount = getMostRecentAccountByType(allAccounts, account.accountType)
  const baseAccount = mostRecentAccount ? { ...mostRecentAccount, termYears } : account
  const annualRooms = getAnnualContributionRoomLimits(baseAccount, termYears)

  if (annualRooms.length === 0) {
    return 0
  }

  const otherAccounts = sameTypeAccounts.filter((acc) => acc.id !== account.id)
  const otherAnnualTotals = getCombinedAnnualProjectedContributions(otherAccounts, termYears)
  const remainingAnnualRooms = annualRooms.map((room, index) =>
    Math.max(0, room - (otherAnnualTotals[index] ?? 0)),
  )
  const initialAnnualRoom = getInitialAnnualRoom(remainingAnnualRooms)

  return Math.round((initialAnnualRoom / periodsPerYear) * 100) / 100
}

/**
 * Get the current contribution for an account, normalized to a target frequency.
 */
const getCurrentContribution = (
  account: AccountInput,
  targetFrequency: ContributionFrequency,
): number => {
  if (!account.contribution) {
    return 0
  }
  const monthlyAmount = normalizeToMonthly(
    account.contribution.amount,
    account.contribution.frequency,
  )
  return Math.round(convertFromMonthly(monthlyAmount, targetFrequency) * 100) / 100
}

/**
 * Apply remainder adjustment to an allocation to ensure total matches exactly.
 */
const applyRemainderAdjustment = (
  allocation: AccountAllocation & { _index: number },
  remainder: number,
): void => {
  const newSuggested = Math.round((allocation.suggestedContribution + remainder) * 100) / 100
  allocation.suggestedContribution = newSuggested
  allocation.additionalContribution = Math.max(
    0,
    Math.round((newSuggested - allocation.currentContribution) * 100) / 100,
  )
}

/**
 * Calculate how to allocate contributions across accounts.
 * Returns suggested total contribution, current contribution, and additional needed.
 * Respects contribution room limits for tax-advantaged accounts.
 */
export const calculateAllocation = ({
  accounts,
  totalContribution,
  strategy,
  targetFrequency,
  termYears = 30,
}: {
  accounts: AccountInput[]
  totalContribution: number
  strategy: AllocationStrategy
  targetFrequency: ContributionFrequency
  termYears?: number
}): AccountAllocation[] => {
  if (accounts.length === 0 || totalContribution <= 0) {
    return []
  }

  const contributableAccounts = accounts.filter((acc) => !acc.isLockedIn)
  const lockedAccounts = accounts.filter((acc) => acc.isLockedIn)

  const buildAllocation = (
    account: AccountInput,
    suggestedContribution: number,
    contributionRoomExceeded = false,
  ): AccountAllocation => {
    const currentContribution = getCurrentContribution(account, targetFrequency)
    const availableRoom = getAvailableRoomForAllocation(account, termYears, targetFrequency, accounts)
    
    const additionalContribution = account.isLockedIn
      ? 0
      : Math.max(
          0,
          Math.round((suggestedContribution - currentContribution) * 100) / 100,
        )
    return {
      accountId: account.id,
      accountName: account.name,
      suggestedContribution: account.isLockedIn ? currentContribution : suggestedContribution,
      currentContribution,
      additionalContribution,
      currentBalance: account.principal,
      annualRatePercent: account.annualRatePercent,
      isLockedIn: account.isLockedIn,
      contributionRoomExceeded,
      availableContributionRoom: availableRoom,
    }
  }

  const buildLockedAllocations = (): AccountAllocation[] =>
    lockedAccounts.map((account) => buildAllocation(account, 0))

  if (contributableAccounts.length === 0) {
    return buildLockedAllocations()
  }

  const applyContributionRoomCaps = (
    allocations: (AccountAllocation & { account: AccountInput })[]
  ): (AccountAllocation & { account: AccountInput })[] => {
    let excessToRedistribute = 0
    const cappedAllocations = allocations.map((allocation) => {
      const availableRoom = allocation.availableContributionRoom
      if (availableRoom !== undefined && allocation.suggestedContribution > availableRoom) {
        const excess = allocation.suggestedContribution - availableRoom
        excessToRedistribute += excess
        return {
          ...allocation,
          suggestedContribution: availableRoom,
          additionalContribution: Math.max(0, availableRoom - allocation.currentContribution),
          contributionRoomExceeded: true,
        }
      }
      return allocation
    })

    if (excessToRedistribute <= 0) {
      return cappedAllocations
    }

    const accountsWithRoom = cappedAllocations.filter((a) => {
      if (a.contributionRoomExceeded) return false
      if (a.availableContributionRoom === undefined) return true
      return a.suggestedContribution < a.availableContributionRoom
    })

    if (accountsWithRoom.length === 0) {
      return cappedAllocations
    }

    const redistributePerAccount = excessToRedistribute / accountsWithRoom.length
    const redistributedAllocations = cappedAllocations.map((allocation) => {
      if (allocation.contributionRoomExceeded) return allocation
      
      const hasRoom = allocation.availableContributionRoom === undefined ||
        allocation.suggestedContribution < allocation.availableContributionRoom

      if (!hasRoom) return allocation

      let additionalAmount = redistributePerAccount
      if (allocation.availableContributionRoom !== undefined) {
        const roomLeft = allocation.availableContributionRoom - allocation.suggestedContribution
        additionalAmount = Math.min(redistributePerAccount, roomLeft)
      }

      const newSuggested = Math.round((allocation.suggestedContribution + additionalAmount) * 100) / 100
      const newAdditional = Math.max(0, Math.round((newSuggested - allocation.currentContribution) * 100) / 100)
      const exceeds = allocation.availableContributionRoom !== undefined && 
        newSuggested > allocation.availableContributionRoom

      return {
        ...allocation,
        suggestedContribution: newSuggested,
        additionalContribution: newAdditional,
        contributionRoomExceeded: exceeds,
      }
    })

    return redistributedAllocations
  }

  if (strategy === 'equal') {
    const perAccount = totalContribution / contributableAccounts.length
    let allocations = contributableAccounts.map((account) => ({
      ...buildAllocation(account, Math.round(perAccount * 100) / 100),
      account,
    }))
    allocations = applyContributionRoomCaps(allocations)
    const contributableAllocations = allocations.map((a) => ({
      accountId: a.accountId,
      accountName: a.accountName,
      suggestedContribution: a.suggestedContribution,
      currentContribution: a.currentContribution,
      additionalContribution: a.additionalContribution,
      currentBalance: a.currentBalance,
      annualRatePercent: a.annualRatePercent,
      isLockedIn: a.isLockedIn,
      contributionRoomExceeded: a.contributionRoomExceeded,
      availableContributionRoom: a.availableContributionRoom,
    }))
    return [...contributableAllocations, ...buildLockedAllocations()]
  }

  if (strategy === 'highest-return') {
    const sorted = [...contributableAccounts].sort(
      (a, b) => b.annualRatePercent - a.annualRatePercent,
    )
    let allocations = sorted.map((account, index) => ({
      ...buildAllocation(account, index === 0 ? totalContribution : 0),
      account,
    }))
    allocations = applyContributionRoomCaps(allocations)
    const contributableAllocations = allocations.map((a) => ({
      accountId: a.accountId,
      accountName: a.accountName,
      suggestedContribution: a.suggestedContribution,
      currentContribution: a.currentContribution,
      additionalContribution: a.additionalContribution,
      currentBalance: a.currentBalance,
      annualRatePercent: a.annualRatePercent,
      isLockedIn: a.isLockedIn,
      contributionRoomExceeded: a.contributionRoomExceeded,
      availableContributionRoom: a.availableContributionRoom,
    }))
    return [...contributableAllocations, ...buildLockedAllocations()]
  }

  const totalBalance = contributableAccounts.reduce((sum, acc) => sum + acc.principal, 0)

  if (totalBalance === 0) {
    const perAccount = totalContribution / contributableAccounts.length
    let allocations = contributableAccounts.map((account, index) => ({
      ...buildAllocation(account, Math.round(perAccount * 100) / 100),
      _index: index,
      account,
    }))

    const allocatedSum = allocations.reduce((sum, a) => sum + a.suggestedContribution, 0)
    const remainder = Math.round((totalContribution - allocatedSum) * 100) / 100

    if (remainder !== 0 && allocations.length > 0) {
      applyRemainderAdjustment(allocations[0], remainder)
    }

    allocations = applyContributionRoomCaps(allocations) as typeof allocations
    const contributableAllocations = allocations.map(({ accountId, accountName, suggestedContribution, currentContribution, additionalContribution, currentBalance, annualRatePercent, isLockedIn, contributionRoomExceeded, availableContributionRoom }) => ({
      accountId,
      accountName,
      suggestedContribution,
      currentContribution,
      additionalContribution,
      currentBalance,
      annualRatePercent,
      isLockedIn,
      contributionRoomExceeded,
      availableContributionRoom,
    }))
    return [...contributableAllocations, ...buildLockedAllocations()]
  }

  let allocations = contributableAccounts.map((account, index) => {
    const proportion = account.principal / totalBalance
    const suggestedContribution =
      Math.round(totalContribution * proportion * 100) / 100

    return {
      ...buildAllocation(account, suggestedContribution),
      _index: index,
      account,
    }
  })

  const allocatedSum = allocations.reduce((sum, a) => sum + a.suggestedContribution, 0)
  const remainder = Math.round((totalContribution - allocatedSum) * 100) / 100

  if (remainder !== 0 && allocations.length > 0) {
    const largestIndex = allocations.reduce(
      (maxIdx, curr, idx, arr) =>
        curr.suggestedContribution > arr[maxIdx].suggestedContribution ? idx : maxIdx,
      0,
    )
    applyRemainderAdjustment(allocations[largestIndex], remainder)
  }

  allocations = applyContributionRoomCaps(allocations) as typeof allocations
  const contributableAllocations = allocations.map(({ accountId, accountName, suggestedContribution, currentContribution, additionalContribution, currentBalance, annualRatePercent, isLockedIn, contributionRoomExceeded, availableContributionRoom }) => ({
    accountId,
    accountName,
    suggestedContribution,
    currentContribution,
    additionalContribution,
    currentBalance,
    annualRatePercent,
    isLockedIn,
    contributionRoomExceeded,
    availableContributionRoom,
  }))
  return [...contributableAllocations, ...buildLockedAllocations()]
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
