import { describe, expect, it } from 'vitest'
import type { AccountInput } from '../types/investment'
import {
  adjustContributionRangeForTermChange,
  adjustAllAccountsForTermChange,
} from './accountCardHelpers'

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

describe('adjustContributionRangeForTermChange', () => {
  it('returns account unchanged when no contribution', () => {
    const account = buildAccount()
    const result = adjustContributionRangeForTermChange(account, 5, 10)
    expect(result).toEqual(account)
  })

  it('clamps start and end months when term shrinks', () => {
    const account = buildAccount({
      contribution: { amount: 100, frequency: 'monthly', startMonth: 1, endMonth: 120 },
    })
    const result = adjustContributionRangeForTermChange(account, 10, 5)
    expect(result.contribution?.startMonth).toBe(1)
    expect(result.contribution?.endMonth).toBe(60)
  })

  it('auto-extends end month when term grows and end was at previous max', () => {
    const account = buildAccount({
      contribution: { amount: 100, frequency: 'monthly', startMonth: 1, endMonth: 60 },
    })
    const result = adjustContributionRangeForTermChange(account, 5, 10)
    expect(result.contribution?.endMonth).toBe(120)
  })

  it('does not extend end month when it was not at previous max', () => {
    const account = buildAccount({
      contribution: { amount: 100, frequency: 'monthly', startMonth: 1, endMonth: 36 },
    })
    const result = adjustContributionRangeForTermChange(account, 5, 10)
    expect(result.contribution?.endMonth).toBe(36)
  })

  it('clamps start month when it exceeds new total months', () => {
    const account = buildAccount({
      contribution: { amount: 100, frequency: 'monthly', startMonth: 100, endMonth: 120 },
    })
    const result = adjustContributionRangeForTermChange(account, 10, 5)
    expect(result.contribution?.startMonth).toBe(60)
    expect(result.contribution?.endMonth).toBe(60)
  })
})

describe('adjustAllAccountsForTermChange', () => {
  it('adjusts all accounts in the array', () => {
    const accounts = [
      buildAccount({
        id: '1',
        contribution: { amount: 100, frequency: 'monthly', startMonth: 1, endMonth: 60 },
      }),
      buildAccount({
        id: '2',
        contribution: { amount: 200, frequency: 'monthly', startMonth: 1, endMonth: 60 },
      }),
      buildAccount({ id: '3' }),
    ]
    const result = adjustAllAccountsForTermChange(accounts, 5, 10)
    expect(result[0].contribution?.endMonth).toBe(120)
    expect(result[1].contribution?.endMonth).toBe(120)
    expect(result[2].contribution).toBeUndefined()
  })

  it('returns same length array', () => {
    const accounts = [buildAccount({ id: '1' }), buildAccount({ id: '2' })]
    const result = adjustAllAccountsForTermChange(accounts, 5, 10)
    expect(result).toHaveLength(2)
  })
})
