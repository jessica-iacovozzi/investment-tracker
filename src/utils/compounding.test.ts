import { describe, expect, it } from 'vitest'
import type { CompoundingFrequency } from '../types/investment'
import {
  getEffectiveMonthlyRate,
  isContributionBeforeCompounding,
  isTimingMonth,
} from './compounding'

const toExpectedMonthlyRate = (
  annualRatePercent: number,
  compoundingFrequency: CompoundingFrequency,
) => {
  if (compoundingFrequency === 'monthly' || compoundingFrequency === 'annually') {
    return Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1
  }

  if (compoundingFrequency === 'continuously') {
    return Math.exp(annualRatePercent / 100 / 12) - 1
  }

  const periodsPerYear: Record<CompoundingFrequency, number> = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    semimonthly: 24,
    biweekly: 26,
    weekly: 52,
    daily: 365,
    continuously: Number.POSITIVE_INFINITY,
  }

  return (
    Math.pow(
      1 + annualRatePercent / 100 / periodsPerYear[compoundingFrequency],
      periodsPerYear[compoundingFrequency] / 12,
    ) - 1
  )
}

describe('getEffectiveMonthlyRate', () => {
  it('matches effective annual conversion for monthly', () => {
    const result = getEffectiveMonthlyRate({
      annualRatePercent: 6,
      compoundingFrequency: 'monthly',
    })

    expect(result).toBeCloseTo(toExpectedMonthlyRate(6, 'monthly'), 8)
  })

  it('handles weekly and continuous compounding conversions', () => {
    const weeklyResult = getEffectiveMonthlyRate({
      annualRatePercent: 6,
      compoundingFrequency: 'weekly',
    })
    const continuousResult = getEffectiveMonthlyRate({
      annualRatePercent: 6,
      compoundingFrequency: 'continuously',
    })

    expect(weeklyResult).toBeCloseTo(toExpectedMonthlyRate(6, 'weekly'), 8)
    expect(continuousResult).toBeCloseTo(
      toExpectedMonthlyRate(6, 'continuously'),
      8,
    )
  })
})

describe('timing helpers', () => {
  it('flags beginning timings as before compounding', () => {
    expect(isContributionBeforeCompounding('beginning-of-month')).toBe(true)
    expect(isContributionBeforeCompounding('beginning-of-year')).toBe(true)
    expect(isContributionBeforeCompounding('end-of-month')).toBe(false)
  })

  it('applies year timing only on boundaries', () => {
    expect(
      isTimingMonth({ timing: 'beginning-of-year', monthIndex: 1 }),
    ).toBe(true)
    expect(
      isTimingMonth({ timing: 'beginning-of-year', monthIndex: 12 }),
    ).toBe(false)
    expect(isTimingMonth({ timing: 'end-of-year', monthIndex: 12 })).toBe(true)
    expect(isTimingMonth({ timing: 'end-of-year', monthIndex: 11 })).toBe(false)
  })
})
