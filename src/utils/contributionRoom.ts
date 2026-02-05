import type {
  AccountInput,
  ContributionFrequency,
  OverContributionDetails,
} from '../types/investment'
import {
  ANNUAL_CONTRIBUTION_LIMITS,
  FHSA_LIFETIME_LIMIT,
  FHSA_MAX_ANNUAL_WITH_CARRYFORWARD,
  RRSP_INCOME_PERCENTAGE,
  RRSP_OVERCONTRIBUTION_BUFFER,
  isTaxAdvantagedAccount,
} from '../constants/accountTypes'

const CONTRIBUTION_PERIODS_PER_YEAR: Record<ContributionFrequency, number> = {
  'bi-weekly': 26,
  monthly: 12,
  quarterly: 4,
  annually: 1,
}

export type ContributionRoomResult = {
  availableRoom: number
  projectedContributions: number
  remainingRoom: number
  overContributionDetails: OverContributionDetails
}

/**
 * Calculate total projected contributions over the account term.
 */
export const calculateTotalProjectedContributions = (
  account: AccountInput,
): number => {
  if (!account.contribution) {
    return 0
  }

  const { amount, frequency, startMonth, endMonth } = account.contribution
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[frequency]
  const contributionMonths = Math.max(0, endMonth - startMonth + 1)
  const contributionYears = contributionMonths / 12
  const totalContributions = amount * periodsPerYear * contributionYears

  return Math.round(totalContributions * 100) / 100
}

/**
 * Get the annual room increase for an account based on its type.
 */
export const getAnnualRoomIncrease = (account: AccountInput): number => {
  const { accountType, customAnnualRoomIncrease, annualIncomeForRrsp } = account

  if (customAnnualRoomIncrease !== undefined) {
    return customAnnualRoomIncrease
  }

  switch (accountType) {
    case 'tfsa':
      return ANNUAL_CONTRIBUTION_LIMITS.tfsa ?? 7000

    case 'rrsp': {
      if (annualIncomeForRrsp !== undefined && annualIncomeForRrsp > 0) {
        const incomeBasedLimit = annualIncomeForRrsp * RRSP_INCOME_PERCENTAGE
        const maxLimit = ANNUAL_CONTRIBUTION_LIMITS.rrsp ?? 31560
        return Math.min(incomeBasedLimit, maxLimit)
      }
      return ANNUAL_CONTRIBUTION_LIMITS.rrsp ?? 31560
    }

    case 'fhsa':
      return ANNUAL_CONTRIBUTION_LIMITS.fhsa ?? 8000

    default:
      return 0
  }
}

/**
 * Calculate available contribution room over the term.
 * Initial room + annual increases for each year of the term.
 */
export const calculateAvailableRoom = (account: AccountInput): number => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return Infinity
  }

  // Defensive programming: ensure contributionRoom is a non-negative number
  const initialRoom = Math.max(0, account.contributionRoom ?? 0)
  const termYears = Math.max(0, Math.floor(account.termYears))
  const annualIncrease = getAnnualRoomIncrease(account)

  let totalRoom = initialRoom

  if (account.accountType === 'fhsa') {
    const lifetimeContributions = account.fhsaLifetimeContributions ?? 0
    const remainingLifetimeRoom = Math.max(0, FHSA_LIFETIME_LIMIT - lifetimeContributions)

    for (let year = 1; year <= termYears; year++) {
      const yearlyIncrease = Math.min(
        annualIncrease,
        FHSA_MAX_ANNUAL_WITH_CARRYFORWARD,
        remainingLifetimeRoom - totalRoom,
      )
      totalRoom += Math.max(0, yearlyIncrease)
    }

    return Math.min(totalRoom, remainingLifetimeRoom)
  }

  totalRoom += annualIncrease * termYears

  return totalRoom
}

/**
 * Calculate remaining contribution room after projected contributions.
 */
export const calculateRemainingRoom = (account: AccountInput): number => {
  const availableRoom = calculateAvailableRoom(account)
  const projectedContributions = calculateTotalProjectedContributions(account)

  if (availableRoom === Infinity) {
    return Infinity
  }

  return Math.round((availableRoom - projectedContributions) * 100) / 100
}

/**
 * Get the over-contribution buffer for an account type.
 */
export const getOverContributionBuffer = (account: AccountInput): number => {
  if (account.accountType === 'rrsp') {
    return RRSP_OVERCONTRIBUTION_BUFFER
  }
  return 0
}

/**
 * Get details about over-contribution including when it occurs and penalty estimate.
 */
export const getOverContributionDetails = (
  account: AccountInput,
): OverContributionDetails => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const availableRoom = calculateAvailableRoom(account)
  const projectedContributions = calculateTotalProjectedContributions(account)
  const buffer = getOverContributionBuffer(account)
  const effectiveRoom = availableRoom + buffer

  if (projectedContributions <= effectiveRoom) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const excessAmount = Math.round((projectedContributions - effectiveRoom) * 100) / 100

  const overContributionTiming = findOverContributionTiming(account, effectiveRoom)
  const monthsOfExcess = calculateMonthsOfExcess(account, overContributionTiming)
  const estimatedPenalty = Math.round(excessAmount * 0.01 * monthsOfExcess * 100) / 100

  return {
    exceedsRoom: true,
    excessAmount,
    yearOfOverContribution: overContributionTiming.year,
    monthOfOverContribution: overContributionTiming.month,
    estimatedPenalty,
  }
}

/**
 * Find the year and month when over-contribution first occurs.
 */
const findOverContributionTiming = (
  account: AccountInput,
  effectiveRoom: number,
): { year: number; month: number } => {
  if (!account.contribution) {
    return { year: 1, month: 1 }
  }

  const { amount, frequency, startMonth, endMonth } = account.contribution
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[frequency]
  const monthsPerPeriod = 12 / periodsPerYear

  let cumulativeContributions = 0
  let currentMonth = startMonth

  while (currentMonth <= endMonth) {
    cumulativeContributions += amount
    if (cumulativeContributions > effectiveRoom) {
      const year = Math.ceil(currentMonth / 12)
      const monthInYear = ((currentMonth - 1) % 12) + 1
      return { year, month: monthInYear }
    }
    currentMonth += monthsPerPeriod
  }

  return { year: Math.ceil(endMonth / 12), month: ((endMonth - 1) % 12) + 1 }
}

/**
 * Calculate how many months the excess contribution would be in effect.
 */
const calculateMonthsOfExcess = (
  account: AccountInput,
  overContributionTiming: { year: number; month: number },
): number => {
  const totalMonths = account.termYears * 12
  const overContributionMonth =
    (overContributionTiming.year - 1) * 12 + overContributionTiming.month
  return Math.max(0, totalMonths - overContributionMonth + 1)
}

/**
 * Get complete contribution room analysis for an account.
 */
export const getContributionRoomResult = (
  account: AccountInput,
): ContributionRoomResult => {
  const availableRoom = calculateAvailableRoom(account)
  const projectedContributions = calculateTotalProjectedContributions(account)
  const remainingRoom = calculateRemainingRoom(account)
  const overContributionDetails = getOverContributionDetails(account)

  return {
    availableRoom: availableRoom === Infinity ? -1 : availableRoom,
    projectedContributions,
    remainingRoom: remainingRoom === Infinity ? -1 : remainingRoom,
    overContributionDetails,
  }
}

/**
 * Get remaining contribution room for goal allocation purposes.
 * Returns the room available for additional contributions over the term.
 */
export const getRemainingContributionRoomForGoal = (
  account: AccountInput,
  termYears: number,
): number => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return Infinity
  }

  const accountWithTerm = { ...account, termYears }
  const remainingRoom = calculateRemainingRoom(accountWithTerm)

  return remainingRoom === Infinity ? Infinity : Math.max(0, remainingRoom)
}
