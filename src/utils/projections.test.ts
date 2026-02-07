import { describe, expect, it } from 'vitest'
import type { AccountInput } from '../types/investment'
import { buildProjection } from './projections'

const baseAccount: AccountInput = {
  id: 'test',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 6,
  compoundingFrequency: 'monthly',
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  contribution: {
    amount: 100,
    frequency: 'monthly',
    startMonth: 1,
    endMonth: 12,
  },
}

describe('buildProjection', () => {
  it('grows balance over time with contributions', () => {
    const result = buildProjection(baseAccount, 1)

    expect(result.points).toHaveLength(13)
    expect(result.totals.totalContributions).toBeGreaterThan(10000)
    expect(result.totals.finalBalance).toBeGreaterThan(
      result.totals.totalContributions,
    )
  })

  it('stops contributions after the end month', () => {
    const account: AccountInput = {
      ...baseAccount,
      contribution: {
        amount: 100,
        frequency: 'monthly',
        startMonth: 1,
        endMonth: 6,
      },
    }
    const result = buildProjection(account, 1)

    expect(result.points[6].totalContributions).toBeGreaterThan(
      result.points[7].totalContributions - 1,
    )
    expect(result.points[12].totalContributions).toBe(
      result.points[6].totalContributions,
    )
  })

  it('handles no contribution schedule', () => {
    const account = { ...baseAccount, contribution: undefined }
    const result = buildProjection(account, 1)

    expect(result.totals.totalContributions).toBe(account.principal)
  })

  it('applies bi-weekly contributions twice per month', () => {
    const account: AccountInput = {
      ...baseAccount,
      contributionTiming: 'end-of-biweekly',
      contribution: {
        amount: 100,
        frequency: 'bi-weekly',
        startMonth: 1,
        endMonth: 1,
      },
    }
    const result = buildProjection(account, 1)

    expect(result.points[1].totalContributions).toBe(
      account.principal + 200,
    )
  })

  it('applies beginning of month contributions before compounding', () => {
    const account: AccountInput = {
      ...baseAccount,
      contributionTiming: 'beginning-of-month',
    }
    const result = buildProjection(account, 1)

    expect(result.points[1].totalContributions).toBe(
      account.principal + 100,
    )
    expect(result.points[1].balance).toBeGreaterThan(
      account.principal + 100,
    )
  })

  it('applies end of year contributions only at year boundaries', () => {
    const account: AccountInput = {
      ...baseAccount,
      contributionTiming: 'end-of-year',
      contribution: {
        amount: 100,
        frequency: 'annually',
        startMonth: 1,
        endMonth: 12,
      },
    }
    const result = buildProjection(account, 1)

    expect(result.points[11].totalContributions).toBe(account.principal)
    expect(result.points[12].totalContributions).toBe(
      account.principal + 100,
    )
  })

  it('adds recurring end of year contributions across multiple years', () => {
    const account: AccountInput = {
      ...baseAccount,
      contributionTiming: 'end-of-year',
      contribution: {
        amount: 100,
        frequency: 'annually',
        startMonth: 1,
        endMonth: 24,
      },
    }
    const result = buildProjection(account, 2)

    expect(result.points[12].totalContributions).toBe(
      account.principal + 100,
    )
    expect(result.points[24].totalContributions).toBe(
      account.principal + 200,
    )
  })

  it('uses compounding frequency to adjust monthly rates', () => {
    const monthlyResult = buildProjection({
      ...baseAccount,
      compoundingFrequency: 'monthly',
    }, 1)
    const dailyResult = buildProjection({
      ...baseAccount,
      compoundingFrequency: 'daily',
    }, 1)

    expect(dailyResult.points[12].balance).not.toBe(
      monthlyResult.points[12].balance,
    )
  })
})
