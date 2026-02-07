import { describe, expect, it } from 'vitest'
import type { AccountInput } from '../types/investment'
import {
  calculateTotalProjectedContributions,
  calculateAvailableRoom,
  calculateRemainingRoom,
  getAnnualRoomIncrease,
  getAnnualProjectedContributions,
  getOverContributionDetails,
  getContributionRoomResult,
  getRemainingContributionRoomForGoal,
} from './contributionRoom'

const buildAccount = (
  overrides: Partial<AccountInput> = {},
): AccountInput => ({
  id: 'test-account',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 5,
  compoundingFrequency: 'monthly',
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  ...overrides,
})

describe('calculateTotalProjectedContributions', () => {
  it('returns 0 when no contribution schedule', () => {
    const account = buildAccount()
    expect(calculateTotalProjectedContributions(account)).toBe(0)
  })

  it('calculates monthly contributions over full term', () => {
    const account = buildAccount({
      contribution: {
        amount: 500,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 60,
      },
    })
    expect(calculateTotalProjectedContributions(account)).toBe(30000)
  })

  it('calculates bi-weekly contributions', () => {
    const account = buildAccount({
      contribution: {
        amount: 200,
        frequency: 'bi-weekly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    expect(calculateTotalProjectedContributions(account)).toBe(5200)
  })

  it('calculates quarterly contributions', () => {
    const account = buildAccount({
      contribution: {
        amount: 1000,
        frequency: 'quarterly',
        startMonth: 1,
        endMonth: 24,
      },
    })
    expect(calculateTotalProjectedContributions(account)).toBe(8000)
  })

  it('calculates annual contributions', () => {
    const account = buildAccount({
      contribution: {
        amount: 7000,
        frequency: 'annually',
        startMonth: 1,
        endMonth: 120,
      },
    })
    expect(calculateTotalProjectedContributions(account)).toBe(70000)
  })

  it('handles partial year contributions', () => {
    const account = buildAccount({
      contribution: {
        amount: 500,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 6,
      },
    })
    expect(calculateTotalProjectedContributions(account)).toBe(3000)
  })
})

describe('getAnnualProjectedContributions', () => {
  it('calculates bi-weekly contributions by year', () => {
    const account = buildAccount({
      contribution: {
        amount: 200,
        frequency: 'bi-weekly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    expect(getAnnualProjectedContributions(account, 1)).toEqual([5200])
  })

  it('handles partial-year bi-weekly contributions', () => {
    const account = buildAccount({
      contribution: {
        amount: 200,
        frequency: 'bi-weekly',
        startMonth: 1,
        endMonth: 6,
      },
    })
    expect(getAnnualProjectedContributions(account, 1)).toEqual([2600])
  })
})

describe('getAnnualRoomIncrease', () => {
  it('returns 0 for non-registered accounts', () => {
    const account = buildAccount({ accountType: 'non-registered' })
    expect(getAnnualRoomIncrease(account)).toBe(0)
  })

  it('returns TFSA default limit', () => {
    const account = buildAccount({ accountType: 'tfsa' })
    expect(getAnnualRoomIncrease(account)).toBe(7000)
  })

  it('returns custom annual increase when specified for TFSA', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      customAnnualRoomIncrease: 8000,
    })
    expect(getAnnualRoomIncrease(account)).toBe(8000)
  })

  it('returns RRSP default max limit', () => {
    const account = buildAccount({ accountType: 'rrsp' })
    expect(getAnnualRoomIncrease(account)).toBe(31560)
  })

  it('returns income-based RRSP limit when income provided', () => {
    const account = buildAccount({
      accountType: 'rrsp',
      annualIncomeForRrsp: 100000,
    })
    expect(getAnnualRoomIncrease(account)).toBe(18000)
  })

  it('caps RRSP limit at maximum when income is high', () => {
    const account = buildAccount({
      accountType: 'rrsp',
      annualIncomeForRrsp: 500000,
    })
    expect(getAnnualRoomIncrease(account)).toBe(31560)
  })

  it('returns FHSA default limit', () => {
    const account = buildAccount({ accountType: 'fhsa' })
    expect(getAnnualRoomIncrease(account)).toBe(8000)
  })

  it('returns 0 for LIRA accounts', () => {
    const account = buildAccount({ accountType: 'lira' })
    expect(getAnnualRoomIncrease(account)).toBe(0)
  })
})

describe('calculateAvailableRoom', () => {
  it('returns Infinity for non-registered accounts', () => {
    const account = buildAccount({ accountType: 'non-registered' })
    expect(calculateAvailableRoom(account, 10)).toBe(Infinity)
  })

  it('calculates TFSA room with initial room and annual increases', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 50000,
    })
    expect(calculateAvailableRoom(account, 5)).toBe(85000)
  })

  it('calculates RRSP room with income-based increases', () => {
    const account = buildAccount({
      accountType: 'rrsp',
      contributionRoom: 20000,
      annualIncomeForRrsp: 100000,
    })
    expect(calculateAvailableRoom(account, 3)).toBe(74000)
  })

  it('calculates FHSA room respecting lifetime limit', () => {
    const account = buildAccount({
      accountType: 'fhsa',
      contributionRoom: 8000,
      fhsaLifetimeContributions: 0,
    })
    expect(calculateAvailableRoom(account, 10)).toBeLessThanOrEqual(40000)
  })

  it('handles FHSA with existing lifetime contributions', () => {
    const account = buildAccount({
      accountType: 'fhsa',
      contributionRoom: 8000,
      fhsaLifetimeContributions: 24000,
    })
    expect(calculateAvailableRoom(account, 5)).toBeLessThanOrEqual(16000)
  })

  it('returns initial room when term is 0', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 50000,
    })
    expect(calculateAvailableRoom(account, 0)).toBe(50000)
  })

  it('returns 0 when no contribution room specified', () => {
    const account = buildAccount({
      accountType: 'tfsa',
    })
    expect(calculateAvailableRoom(account, 0)).toBe(0)
  })
})

describe('calculateRemainingRoom', () => {
  it('returns Infinity for non-registered accounts', () => {
    const account = buildAccount({ accountType: 'non-registered' })
    expect(calculateRemainingRoom(account, 10)).toBe(Infinity)
  })

  it('calculates remaining room after contributions', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 50000,
      contribution: {
        amount: 500,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 60,
      },
    })
    expect(calculateRemainingRoom(account, 5)).toBe(55000)
  })

  it('returns negative when over-contributing', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 10000,
      contribution: {
        amount: 2000,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    expect(calculateRemainingRoom(account, 1)).toBeLessThan(0)
  })
})

describe('getOverContributionDetails', () => {
  it('returns no excess for non-registered accounts', () => {
    const account = buildAccount({
      accountType: 'non-registered',
      contribution: {
        amount: 10000,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    const result = getOverContributionDetails(account, 10)
    expect(result.exceedsRoom).toBe(false)
    expect(result.excessAmount).toBe(0)
  })

  it('returns no excess when within room', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 50000,
      contribution: {
        amount: 500,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 60,
      },
    })
    const result = getOverContributionDetails(account, 5)
    expect(result.exceedsRoom).toBe(false)
  })

  it('detects over-contribution for TFSA', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 10000,
      contribution: {
        amount: 2000,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    const result = getOverContributionDetails(account, 1)
    expect(result.exceedsRoom).toBe(true)
    expect(result.excessAmount).toBeGreaterThan(0)
    expect(result.estimatedPenalty).toBeGreaterThan(0)
  })

  it('flags over-contribution when annual room is exceeded', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 5000,
      customAnnualRoomIncrease: 0,
      contribution: {
        amount: 600,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 24,
      },
    })
    const result = getOverContributionDetails(account, 2)
    expect(result.exceedsRoom).toBe(true)
    expect(result.yearOfOverContribution).toBe(1)
  })

  it('allows carry-forward room to cover later contributions', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 5000,
      customAnnualRoomIncrease: 5000,
      contribution: {
        amount: 7000,
        frequency: 'annually',
        startMonth: 13,
        endMonth: 24,
      },
    })
    const result = getOverContributionDetails(account, 2)
    expect(result.exceedsRoom).toBe(false)
  })

  it('applies RRSP buffer before flagging over-contribution', () => {
    const account = buildAccount({
      accountType: 'rrsp',
      contributionRoom: 10000,
      contribution: {
        amount: 1000,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    const result = getOverContributionDetails(account, 1)
    expect(result.exceedsRoom).toBe(false)
  })

  it('detects over-contribution for RRSP beyond buffer', () => {
    const account = buildAccount({
      accountType: 'rrsp',
      contributionRoom: 5000,
      annualIncomeForRrsp: 50000,
      contribution: {
        amount: 2000,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    const result = getOverContributionDetails(account, 1)
    expect(result.exceedsRoom).toBe(true)
  })
})

describe('getContributionRoomResult', () => {
  it('returns complete result for tax-advantaged account', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 50000,
      contribution: {
        amount: 500,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 60,
      },
    })
    const result = getContributionRoomResult(account, 5)
    expect(result.availableRoom).toBe(85000)
    expect(result.projectedContributions).toBe(30000)
    expect(result.remainingRoom).toBe(55000)
    expect(result.overContributionDetails.exceedsRoom).toBe(false)
  })

  it('returns -1 for non-registered account room values', () => {
    const account = buildAccount({ accountType: 'non-registered' })
    const result = getContributionRoomResult(account, 10)
    expect(result.availableRoom).toBe(-1)
    expect(result.remainingRoom).toBe(-1)
  })
})

describe('getRemainingContributionRoomForGoal', () => {
  it('returns Infinity for non-registered accounts', () => {
    const account = buildAccount({ accountType: 'non-registered' })
    expect(getRemainingContributionRoomForGoal(account, 5)).toBe(Infinity)
  })

  it('returns remaining room for TFSA', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 50000,
      contribution: {
        amount: 500,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 60,
      },
    })
    const result = getRemainingContributionRoomForGoal(account, 5)
    expect(result).toBe(55000)
  })

  it('returns 0 when room is exhausted', () => {
    const account = buildAccount({
      accountType: 'tfsa',
      contributionRoom: 5000,
      contribution: {
        amount: 1000,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 12,
      },
    })
    const result = getRemainingContributionRoomForGoal(account, 1)
    expect(result).toBe(0)
  })
})
