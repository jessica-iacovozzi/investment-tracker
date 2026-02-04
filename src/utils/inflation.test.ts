import { describe, it, expect } from 'vitest'
import {
  calculateRealValue,
  applyInflationToPoint,
  applyInflationToTotals,
  applyInflationToProjection,
  isValidInflationRate,
} from './inflation'
import type { ProjectionPoint, ProjectionTotals, AccountProjection } from '../types/investment'

describe('calculateRealValue', () => {
  it('returns nominal value when inflation rate is 0', () => {
    expect(calculateRealValue(1000, 0, 10)).toBe(1000)
  })

  it('returns nominal value when years is 0', () => {
    expect(calculateRealValue(1000, 2.5, 0)).toBe(1000)
  })

  it('returns nominal value when years is negative', () => {
    expect(calculateRealValue(1000, 2.5, -5)).toBe(1000)
  })

  it('calculates real value correctly for 2.5% inflation over 10 years', () => {
    const result = calculateRealValue(1000, 2.5, 10)
    const expected = 1000 / Math.pow(1.025, 10)
    expect(result).toBeCloseTo(expected, 10)
    expect(result).toBeCloseTo(781.2, 1)
  })

  it('calculates real value correctly for 3% inflation over 30 years', () => {
    const result = calculateRealValue(1000000, 3, 30)
    const expected = 1000000 / Math.pow(1.03, 30)
    expect(result).toBeCloseTo(expected, 10)
    expect(result).toBeCloseTo(411987, 0)
  })

  it('handles high inflation rates (10%)', () => {
    const result = calculateRealValue(1000, 10, 10)
    const expected = 1000 / Math.pow(1.1, 10)
    expect(result).toBeCloseTo(expected, 10)
    expect(result).toBeCloseTo(385.54, 1)
  })

  it('handles very long terms (50 years)', () => {
    const result = calculateRealValue(1000000, 2.5, 50)
    const expected = 1000000 / Math.pow(1.025, 50)
    expect(result).toBeCloseTo(expected, 10)
    expect(result).toBeCloseTo(290942, 0)
  })

  it('handles fractional years', () => {
    const result = calculateRealValue(1000, 2.5, 5.5)
    const expected = 1000 / Math.pow(1.025, 5.5)
    expect(result).toBeCloseTo(expected, 10)
  })
})

describe('applyInflationToPoint', () => {
  it('adds real values to projection point', () => {
    const point: ProjectionPoint = {
      month: 120,
      year: 10,
      balance: 10000,
      totalContributions: 5000,
    }

    const result = applyInflationToPoint(point, 2.5)

    expect(result.month).toBe(120)
    expect(result.year).toBe(10)
    expect(result.balance).toBe(10000)
    expect(result.totalContributions).toBe(5000)
    expect(result.realBalance).toBeCloseTo(10000 / Math.pow(1.025, 10), 10)
    expect(result.realTotalContributions).toBeCloseTo(5000 / Math.pow(1.025, 10), 10)
  })

  it('handles year 0 (no inflation adjustment)', () => {
    const point: ProjectionPoint = {
      month: 0,
      year: 0,
      balance: 1000,
      totalContributions: 1000,
    }

    const result = applyInflationToPoint(point, 2.5)

    expect(result.realBalance).toBe(1000)
    expect(result.realTotalContributions).toBe(1000)
  })
})

describe('applyInflationToTotals', () => {
  it('adds real values to projection totals', () => {
    const totals: ProjectionTotals = {
      totalContributions: 50000,
      totalReturns: 30000,
      finalBalance: 80000,
    }

    const result = applyInflationToTotals(totals, 2.5, 10)

    expect(result.totalContributions).toBe(50000)
    expect(result.totalReturns).toBe(30000)
    expect(result.finalBalance).toBe(80000)
    expect(result.realFinalBalance).toBeCloseTo(80000 / Math.pow(1.025, 10), 10)
    expect(result.realTotalContributions).toBeCloseTo(50000 / Math.pow(1.025, 10), 10)
    expect(result.realTotalReturns).toBeCloseTo(
      result.realFinalBalance! - result.realTotalContributions!,
      10,
    )
  })

  it('calculates real returns as difference between real balance and real contributions', () => {
    const totals: ProjectionTotals = {
      totalContributions: 100000,
      totalReturns: 50000,
      finalBalance: 150000,
    }

    const result = applyInflationToTotals(totals, 3, 20)

    expect(result.realTotalReturns).toBeCloseTo(
      result.realFinalBalance! - result.realTotalContributions!,
      10,
    )
  })
})

describe('applyInflationToProjection', () => {
  it('applies inflation to all points and totals', () => {
    const projection: AccountProjection = {
      points: [
        { month: 0, year: 0, balance: 1000, totalContributions: 1000 },
        { month: 60, year: 5, balance: 5000, totalContributions: 3000 },
        { month: 120, year: 10, balance: 10000, totalContributions: 5000 },
      ],
      totals: {
        totalContributions: 5000,
        totalReturns: 5000,
        finalBalance: 10000,
      },
    }

    const result = applyInflationToProjection(projection, 2.5, 10)

    expect(result.points).toHaveLength(3)
    expect(result.points[0].realBalance).toBe(1000)
    expect(result.points[1].realBalance).toBeCloseTo(5000 / Math.pow(1.025, 5), 10)
    expect(result.points[2].realBalance).toBeCloseTo(10000 / Math.pow(1.025, 10), 10)
    expect(result.totals.realFinalBalance).toBeCloseTo(10000 / Math.pow(1.025, 10), 10)
  })
})

describe('isValidInflationRate', () => {
  it('returns true for valid rates', () => {
    expect(isValidInflationRate(0)).toBe(true)
    expect(isValidInflationRate(2.5)).toBe(true)
    expect(isValidInflationRate(15)).toBe(true)
    expect(isValidInflationRate(7.5)).toBe(true)
  })

  it('returns false for negative rates', () => {
    expect(isValidInflationRate(-1)).toBe(false)
    expect(isValidInflationRate(-0.1)).toBe(false)
  })

  it('returns false for rates above 15%', () => {
    expect(isValidInflationRate(15.1)).toBe(false)
    expect(isValidInflationRate(20)).toBe(false)
  })

  it('returns false for non-finite values', () => {
    expect(isValidInflationRate(NaN)).toBe(false)
    expect(isValidInflationRate(Infinity)).toBe(false)
    expect(isValidInflationRate(-Infinity)).toBe(false)
  })
})
