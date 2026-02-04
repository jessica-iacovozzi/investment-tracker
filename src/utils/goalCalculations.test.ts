import { describe, it, expect } from 'vitest'
import {
  calculateRequiredContribution,
  calculateRequiredTerm,
  calculateAllocation,
  calculateFutureValueWithoutContributions,
  getWeightedAverageRate,
  formatTermFromMonths,
} from './goalCalculations'
import type { AccountInput } from '../types/investment'

const createMockAccount = (
  overrides: Partial<AccountInput> = {},
): AccountInput => ({
  id: 'test-1',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 7,
  compoundingFrequency: 'monthly',
  termYears: 10,
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  ...overrides,
})

describe('calculateFutureValueWithoutContributions', () => {
  it('calculates future value for single account', () => {
    const accounts = [createMockAccount({ principal: 10000, annualRatePercent: 7 })]
    const result = calculateFutureValueWithoutContributions(accounts, 120)
    expect(result).toBeGreaterThan(10000)
    expect(result).toBeGreaterThan(19000)
  })

  it('calculates future value for multiple accounts', () => {
    const accounts = [
      createMockAccount({ id: '1', principal: 10000, annualRatePercent: 7 }),
      createMockAccount({ id: '2', principal: 5000, annualRatePercent: 5 }),
    ]
    const result = calculateFutureValueWithoutContributions(accounts, 120)
    expect(result).toBeGreaterThan(15000)
  })

  it('returns 0 for empty accounts', () => {
    const result = calculateFutureValueWithoutContributions([], 120)
    expect(result).toBe(0)
  })
})

describe('getWeightedAverageRate', () => {
  it('calculates weighted average for multiple accounts', () => {
    const accounts = [
      createMockAccount({ principal: 10000, annualRatePercent: 8 }),
      createMockAccount({ principal: 10000, annualRatePercent: 6 }),
    ]
    const result = getWeightedAverageRate(accounts)
    expect(result).toBe(7)
  })

  it('weights by principal correctly', () => {
    const accounts = [
      createMockAccount({ principal: 30000, annualRatePercent: 8 }),
      createMockAccount({ principal: 10000, annualRatePercent: 4 }),
    ]
    const result = getWeightedAverageRate(accounts)
    expect(result).toBe(7)
  })

  it('returns simple average when all principals are 0', () => {
    const accounts = [
      createMockAccount({ principal: 0, annualRatePercent: 8 }),
      createMockAccount({ principal: 0, annualRatePercent: 6 }),
    ]
    const result = getWeightedAverageRate(accounts)
    expect(result).toBe(7)
  })

  it('returns 0 for empty accounts', () => {
    const result = getWeightedAverageRate([])
    expect(result).toBe(0)
  })
})

describe('calculateRequiredContribution', () => {
  it('returns error for empty accounts', () => {
    const result = calculateRequiredContribution({
      accounts: [],
      targetBalance: 100000,
      termYears: 10,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('Add at least one account')
  })

  it('returns error for invalid target balance', () => {
    const result = calculateRequiredContribution({
      accounts: [createMockAccount()],
      targetBalance: 0,
      termYears: 10,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('positive')
  })

  it('returns error for invalid term', () => {
    const result = calculateRequiredContribution({
      accounts: [createMockAccount()],
      targetBalance: 100000,
      termYears: 0,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('at least 1 year')
  })

  it('returns 0 contribution when goal already reached', () => {
    const result = calculateRequiredContribution({
      accounts: [createMockAccount({ principal: 100000 })],
      targetBalance: 50000,
      termYears: 10,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(true)
    expect(result.requiredContribution).toBe(0)
    expect(result.message).toContain('already exceeds')
  })

  it('calculates required monthly contribution', () => {
    const result = calculateRequiredContribution({
      accounts: [createMockAccount({ principal: 10000, annualRatePercent: 7 })],
      targetBalance: 100000,
      termYears: 10,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(true)
    expect(result.requiredContribution).toBeGreaterThan(0)
    expect(result.requiredContribution).toBeLessThan(1000)
  })

  it('calculates required quarterly contribution', () => {
    const result = calculateRequiredContribution({
      accounts: [createMockAccount({ principal: 10000, annualRatePercent: 7 })],
      targetBalance: 100000,
      termYears: 10,
      contributionFrequency: 'quarterly',
    })
    expect(result.isReachable).toBe(true)
    expect(result.requiredContribution).toBeGreaterThan(0)
  })

  it('handles zero interest rate', () => {
    const result = calculateRequiredContribution({
      accounts: [createMockAccount({ principal: 10000, annualRatePercent: 0 })],
      targetBalance: 100000,
      termYears: 10,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(true)
    expect(result.requiredContribution).toBeCloseTo(750, 0)
  })
})

describe('calculateRequiredTerm', () => {
  it('returns error for empty accounts', () => {
    const result = calculateRequiredTerm({
      accounts: [],
      targetBalance: 100000,
      contributionAmount: 500,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('Add at least one account')
  })

  it('returns error for invalid target balance', () => {
    const result = calculateRequiredTerm({
      accounts: [createMockAccount()],
      targetBalance: 0,
      contributionAmount: 500,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('positive')
  })

  it('returns error for invalid contribution amount', () => {
    const result = calculateRequiredTerm({
      accounts: [createMockAccount()],
      targetBalance: 100000,
      contributionAmount: 0,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('Contribution amount must be positive')
  })

  it('returns 0 months when goal already reached', () => {
    const result = calculateRequiredTerm({
      accounts: [createMockAccount({ principal: 100000 })],
      targetBalance: 50000,
      contributionAmount: 500,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(true)
    expect(result.requiredTermMonths).toBe(0)
    expect(result.message).toContain('already exceeds')
  })

  it('calculates required term in months', () => {
    const result = calculateRequiredTerm({
      accounts: [createMockAccount({ principal: 10000, annualRatePercent: 7 })],
      targetBalance: 100000,
      contributionAmount: 500,
      contributionFrequency: 'monthly',
    })
    expect(result.isReachable).toBe(true)
    expect(result.requiredTermMonths).toBeGreaterThan(0)
    expect(result.requiredTermMonths).toBeLessThan(360)
  })

  it('returns unreachable for very low contribution', () => {
    const result = calculateRequiredTerm({
      accounts: [createMockAccount({ principal: 1000, annualRatePercent: 0.1 })],
      targetBalance: 100000000,
      contributionAmount: 1,
      contributionFrequency: 'annually',
    })
    expect(result.isReachable).toBe(false)
    expect(result.message).toContain('cannot be reached')
  })
})

describe('calculateAllocation', () => {
  it('returns empty array for no accounts', () => {
    const result = calculateAllocation({
      accounts: [],
      totalContribution: 1000,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result).toEqual([])
  })

  it('returns empty array for zero contribution', () => {
    const result = calculateAllocation({
      accounts: [createMockAccount()],
      totalContribution: 0,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result).toEqual([])
  })

  it('allocates proportionally by balance', () => {
    const accounts = [
      createMockAccount({ id: '1', name: 'Account 1', principal: 30000 }),
      createMockAccount({ id: '2', name: 'Account 2', principal: 10000 }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result).toHaveLength(2)
    expect(result[0].suggestedContribution).toBe(750)
    expect(result[1].suggestedContribution).toBe(250)
  })

  it('allocates equally with equal strategy', () => {
    const accounts = [
      createMockAccount({ id: '1', name: 'Account 1', principal: 30000 }),
      createMockAccount({ id: '2', name: 'Account 2', principal: 10000 }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'equal',
      targetFrequency: 'monthly',
    })
    expect(result).toHaveLength(2)
    expect(result[0].suggestedContribution).toBe(500)
    expect(result[1].suggestedContribution).toBe(500)
  })

  it('allocates to highest return account with highest-return strategy', () => {
    const accounts = [
      createMockAccount({ id: '1', name: 'Account 1', annualRatePercent: 5 }),
      createMockAccount({ id: '2', name: 'Account 2', annualRatePercent: 8 }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'highest-return',
      targetFrequency: 'monthly',
    })
    expect(result).toHaveLength(2)
    const highestReturn = result.find((a) => a.annualRatePercent === 8)
    expect(highestReturn?.suggestedContribution).toBe(1000)
  })

  it('falls back to equal split when all principals are 0', () => {
    const accounts = [
      createMockAccount({ id: '1', name: 'Account 1', principal: 0 }),
      createMockAccount({ id: '2', name: 'Account 2', principal: 0 }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result[0].suggestedContribution).toBe(500)
    expect(result[1].suggestedContribution).toBe(500)
  })

  it('calculates additional contribution needed', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'Account 1',
        principal: 10000,
        contribution: { amount: 200, frequency: 'monthly', startMonth: 1, endMonth: 120 },
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 500,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result[0].currentContribution).toBe(200)
    expect(result[0].additionalContribution).toBe(300)
  })

  it('shows zero additional when current exceeds suggested', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'Account 1',
        principal: 10000,
        contribution: { amount: 600, frequency: 'monthly', startMonth: 1, endMonth: 120 },
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 500,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result[0].currentContribution).toBe(600)
    expect(result[0].additionalContribution).toBe(0)
  })

  it('normalizes contribution frequency correctly', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'Account 1',
        principal: 10000,
        contribution: { amount: 1200, frequency: 'annually', startMonth: 1, endMonth: 120 },
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 200,
      strategy: 'proportional',
      targetFrequency: 'monthly',
    })
    expect(result[0].currentContribution).toBe(100)
    expect(result[0].additionalContribution).toBe(100)
  })
})

describe('calculateAllocation with contribution room', () => {
  it('caps suggested contribution at available room for TFSA', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'TFSA',
        principal: 10000,
        accountType: 'tfsa',
        contributionRoom: 5000,
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'proportional',
      targetFrequency: 'monthly',
      termYears: 10,
    })
    const tfsaAllocation = result.find((a) => a.accountId === '1')
    expect(tfsaAllocation?.availableContributionRoom).toBeDefined()
    expect(tfsaAllocation?.suggestedContribution).toBeLessThanOrEqual(
      tfsaAllocation?.availableContributionRoom ?? Infinity
    )
  })

  it('sets contributionRoomExceeded when suggestion exceeds room', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'TFSA',
        principal: 10000,
        accountType: 'tfsa',
        contributionRoom: 100,
        customAnnualRoomIncrease: 0,
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 500,
      strategy: 'proportional',
      targetFrequency: 'monthly',
      termYears: 1,
    })
    const tfsaAllocation = result.find((a) => a.accountId === '1')
    expect(tfsaAllocation?.contributionRoomExceeded).toBe(true)
  })

  it('redistributes excess to accounts with remaining room', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'TFSA',
        principal: 10000,
        accountType: 'tfsa',
        contributionRoom: 100,
        customAnnualRoomIncrease: 0,
      }),
      createMockAccount({
        id: '2',
        name: 'Non-registered',
        principal: 10000,
        accountType: 'non-registered',
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'equal',
      targetFrequency: 'monthly',
      termYears: 1,
    })
    const tfsaAllocation = result.find((a) => a.accountId === '1')
    const nonRegAllocation = result.find((a) => a.accountId === '2')
    
    expect(tfsaAllocation?.contributionRoomExceeded).toBe(true)
    expect(nonRegAllocation?.availableContributionRoom).toBeUndefined()
    expect(nonRegAllocation?.suggestedContribution).toBeGreaterThan(500)
  })

  it('does not limit non-registered accounts', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'Non-registered',
        principal: 10000,
        accountType: 'non-registered',
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 10000,
      strategy: 'proportional',
      targetFrequency: 'monthly',
      termYears: 10,
    })
    expect(result[0].availableContributionRoom).toBeUndefined()
    expect(result[0].contributionRoomExceeded).toBeFalsy()
  })

  it('handles highest-return strategy with contribution room limits', () => {
    const accounts = [
      createMockAccount({
        id: '1',
        name: 'High Return TFSA',
        principal: 10000,
        annualRatePercent: 10,
        accountType: 'tfsa',
        contributionRoom: 100,
        customAnnualRoomIncrease: 0,
      }),
      createMockAccount({
        id: '2',
        name: 'Lower Return',
        principal: 10000,
        annualRatePercent: 5,
        accountType: 'non-registered',
      }),
    ]
    const result = calculateAllocation({
      accounts,
      totalContribution: 1000,
      strategy: 'highest-return',
      targetFrequency: 'monthly',
      termYears: 1,
    })
    const tfsaAllocation = result.find((a) => a.accountId === '1')
    const nonRegAllocation = result.find((a) => a.accountId === '2')
    
    expect(tfsaAllocation?.contributionRoomExceeded).toBe(true)
    expect(nonRegAllocation?.suggestedContribution).toBeGreaterThan(0)
  })
})

describe('formatTermFromMonths', () => {
  it('formats months only', () => {
    expect(formatTermFromMonths(6)).toBe('6 months')
  })

  it('formats single month', () => {
    expect(formatTermFromMonths(1)).toBe('1 month')
  })

  it('formats years only', () => {
    expect(formatTermFromMonths(24)).toBe('2 years')
  })

  it('formats single year', () => {
    expect(formatTermFromMonths(12)).toBe('1 year')
  })

  it('formats years and months', () => {
    expect(formatTermFromMonths(26)).toBe('2 years, 2 months')
  })

  it('formats year and single month', () => {
    expect(formatTermFromMonths(13)).toBe('1 year, 1 month')
  })
})
