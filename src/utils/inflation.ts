import type {
  AccountProjection,
  ProjectionPoint,
  ProjectionTotals,
} from '../types/investment'

/**
 * Calculate the real (inflation-adjusted) value of a nominal amount.
 * Formula: realValue = nominalValue / (1 + inflationRate)^years
 */
export const calculateRealValue = (
  nominalValue: number,
  inflationRatePercent: number,
  years: number,
): number => {
  if (years <= 0 || inflationRatePercent <= 0) {
    return nominalValue
  }

  const inflationRate = inflationRatePercent / 100
  return nominalValue / Math.pow(1 + inflationRate, years)
}

/**
 * Apply inflation adjustment to a single projection point.
 */
export const applyInflationToPoint = (
  point: ProjectionPoint,
  inflationRatePercent: number,
): ProjectionPoint => ({
  ...point,
  realBalance: calculateRealValue(point.balance, inflationRatePercent, point.year),
  realTotalContributions: calculateRealValue(
    point.totalContributions,
    inflationRatePercent,
    point.year,
  ),
})

/**
 * Apply inflation adjustment to projection totals.
 */
export const applyInflationToTotals = (
  totals: ProjectionTotals,
  inflationRatePercent: number,
  termYears: number,
): ProjectionTotals => {
  const realFinalBalance = calculateRealValue(
    totals.finalBalance,
    inflationRatePercent,
    termYears,
  )
  const realTotalContributions = calculateRealValue(
    totals.totalContributions,
    inflationRatePercent,
    termYears,
  )
  const realTotalReturns = realFinalBalance - realTotalContributions

  return {
    ...totals,
    realFinalBalance,
    realTotalContributions,
    realTotalReturns,
  }
}

/**
 * Apply inflation adjustment to an entire projection (points and totals).
 */
export const applyInflationToProjection = (
  projection: AccountProjection,
  inflationRatePercent: number,
  termYears: number,
): AccountProjection => ({
  points: projection.points.map((point) =>
    applyInflationToPoint(point, inflationRatePercent),
  ),
  totals: applyInflationToTotals(projection.totals, inflationRatePercent, termYears),
})

/**
 * Validate inflation rate is within acceptable bounds.
 */
export const isValidInflationRate = (rate: number): boolean =>
  Number.isFinite(rate) && rate >= 0 && rate <= 15
