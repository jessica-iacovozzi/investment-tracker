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

const getValidatedTermYears = (termYears: number): number =>
  Math.max(0, Math.floor(termYears))

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
 * Calculate projected contributions for each year of the term.
 */
export const getAnnualProjectedContributions = (
  account: AccountInput,
  termYears: number,
): number[] => {
  const totalYears = getValidatedTermYears(termYears)
  const annualContributions = Array.from({ length: totalYears }, () => 0)

  if (!account.contribution || totalYears === 0) {
    return annualContributions
  }

  const { amount, frequency, startMonth, endMonth } = account.contribution
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[frequency]
  const totalMonths = totalYears * 12
  const clampedStart = Math.max(1, startMonth)
  const clampedEnd = Math.min(endMonth, totalMonths)

  if (clampedEnd < clampedStart) {
    return annualContributions
  }

  for (let yearIndex = 0; yearIndex < totalYears; yearIndex += 1) {
    const yearStartMonth = yearIndex * 12 + 1
    const yearEndMonth = (yearIndex + 1) * 12
    const overlapStart = Math.max(clampedStart, yearStartMonth)
    const overlapEnd = Math.min(clampedEnd, yearEndMonth)
    const overlapMonths = Math.max(0, overlapEnd - overlapStart + 1)
    if (overlapMonths > 0) {
      annualContributions[yearIndex] =
        Math.round(amount * periodsPerYear * (overlapMonths / 12) * 100) / 100
    }
  }

  return annualContributions
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
 * Get yearly contribution room limits for the account term.
 */
export const getAnnualContributionRoomLimits = (
  account: AccountInput,
  termYears: number,
): number[] => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return []
  }

  const totalYears = getValidatedTermYears(termYears)
  if (totalYears === 0) {
    return []
  }

  const initialRoom = Math.max(0, account.contributionRoom ?? 0)
  const annualIncrease = getAnnualRoomIncrease(account)
  const buffer = getOverContributionBuffer(account)
  const rooms: number[] = []
  let remainingLifetime = Math.max(
    0,
    FHSA_LIFETIME_LIMIT - (account.fhsaLifetimeContributions ?? 0),
  )

  for (let yearIndex = 0; yearIndex < totalYears; yearIndex += 1) {
    let room = yearIndex === 0 ? initialRoom : annualIncrease

    if (account.accountType === 'fhsa') {
      const cappedAnnual = Math.min(annualIncrease, FHSA_MAX_ANNUAL_WITH_CARRYFORWARD)
      room = yearIndex === 0
        ? Math.min(initialRoom, remainingLifetime)
        : Math.min(cappedAnnual, remainingLifetime)
      remainingLifetime = Math.max(0, remainingLifetime - room)
    }

    if (yearIndex === 0) {
      room += buffer
    }

    rooms.push(Math.max(0, room))
  }

  return rooms
}

/**
 * Calculate available contribution room over the term.
 * Initial room + annual increases for each year of the term.
 */
export const calculateAvailableRoom = (account: AccountInput, termYears: number): number => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return Infinity
  }

  // Defensive programming: ensure contributionRoom is a non-negative number
  const initialRoom = Math.max(0, account.contributionRoom ?? 0)
  const validTermYears = Math.max(0, Math.floor(termYears))
  const annualIncrease = getAnnualRoomIncrease(account)

  let totalRoom = initialRoom

  if (account.accountType === 'fhsa') {
    const lifetimeContributions = account.fhsaLifetimeContributions ?? 0
    const remainingLifetimeRoom = Math.max(0, FHSA_LIFETIME_LIMIT - lifetimeContributions)

    for (let year = 1; year <= validTermYears; year++) {
      const yearlyIncrease = Math.min(
        annualIncrease,
        FHSA_MAX_ANNUAL_WITH_CARRYFORWARD,
        remainingLifetimeRoom - totalRoom,
      )
      totalRoom += Math.max(0, yearlyIncrease)
    }

    return Math.min(totalRoom, remainingLifetimeRoom)
  }

  totalRoom += annualIncrease * validTermYears

  return totalRoom
}

/**
 * Calculate remaining contribution room after projected contributions.
 */
export const calculateRemainingRoom = (account: AccountInput, termYears: number): number => {
  const availableRoom = calculateAvailableRoom(account, termYears)
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
  termYears: number,
): OverContributionDetails => {
  if (!isTaxAdvantagedAccount(account.accountType)) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const annualRooms = getAnnualContributionRoomLimits(account, termYears)
  const annualContributions = getAnnualProjectedContributions(account, annualRooms.length)

  let cumulativeRoom = 0
  let cumulativeContributions = 0
  const overYearIndex = annualContributions.findIndex((amount, index) => {
    cumulativeRoom += annualRooms[index] ?? 0
    cumulativeContributions += amount
    return cumulativeContributions > cumulativeRoom
  })

  if (overYearIndex === -1) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const excessAmount = Math.round((cumulativeContributions - cumulativeRoom) * 100) / 100
  const overContributionTiming = findOverContributionTimingByYear(account, annualRooms)
  const monthsOfExcess = calculateMonthsOfExcess(termYears, overContributionTiming)
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
 * Find the first month/year when cumulative contribution room is exceeded.
 */
const findOverContributionTimingByYear = (
  account: AccountInput,
  annualRooms: number[],
): { year: number; month: number } => {
  if (!account.contribution || annualRooms.length === 0) {
    return { year: 1, month: 1 }
  }

  const { amount, frequency, startMonth, endMonth } = account.contribution
  const periodsPerYear = CONTRIBUTION_PERIODS_PER_YEAR[frequency]
  const monthlyContribution = (amount * periodsPerYear) / 12
  const totalMonths = annualRooms.length * 12
  const clampedStart = Math.max(1, startMonth)
  const lastMonth = Math.min(endMonth, totalMonths)

  let currentMonth = clampedStart
  let yearIndex = Math.min(annualRooms.length - 1, Math.floor((currentMonth - 1) / 12))
  let remainingRoom = annualRooms[yearIndex] ?? 0

  while (currentMonth <= lastMonth) {
    const nextYearIndex = Math.min(
      annualRooms.length - 1,
      Math.floor((currentMonth - 1) / 12),
    )
    if (nextYearIndex !== yearIndex) {
      yearIndex = nextYearIndex
      remainingRoom += annualRooms[yearIndex] ?? 0
    }

    remainingRoom -= monthlyContribution
    if (remainingRoom < 0) {
      const year = Math.ceil(currentMonth / 12)
      const monthInYear = Math.ceil(((currentMonth - 1) % 12) + 1)
      return { year, month: monthInYear }
    }
    currentMonth += 1
  }

  return { year: Math.ceil(lastMonth / 12), month: Math.ceil(((lastMonth - 1) % 12) + 1) }
}

/**
 * Calculate how many months the excess contribution would be in effect.
 */
const calculateMonthsOfExcess = (
  termYears: number,
  overContributionTiming: { year: number; month: number },
): number => {
  const totalMonths = termYears * 12
  const overContributionMonth =
    (overContributionTiming.year - 1) * 12 + overContributionTiming.month
  return Math.max(0, totalMonths - overContributionMonth + 1)
}

/**
 * Get complete contribution room analysis for an account.
 */
export const getContributionRoomResult = (
  account: AccountInput,
  termYears: number,
): ContributionRoomResult => {
  const availableRoom = calculateAvailableRoom(account, termYears)
  const projectedContributions = calculateTotalProjectedContributions(account)
  const remainingRoom = calculateRemainingRoom(account, termYears)
  const overContributionDetails = getOverContributionDetails(account, termYears)

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

  const remainingRoom = calculateRemainingRoom(account, termYears)

  return remainingRoom === Infinity ? Infinity : Math.max(0, remainingRoom)
}
