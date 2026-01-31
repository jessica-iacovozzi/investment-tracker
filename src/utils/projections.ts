import type {
  AccountInput,
  AccountProjection,
  ContributionFrequency,
  ContributionSchedule,
  ContributionTiming,
  ProjectionPoint,
  ProjectionTotals,
} from '../types/investment'
import {
  getEffectiveMonthlyRate,
  isContributionBeforeCompounding,
  isTimingMonth,
} from './compounding'
import { isTimingValidForFrequency } from './contributionTiming'

type FrequencyMeta = {
  interval: number
  occurrences: number
  label: string
}

const FREQUENCY_META: Record<ContributionFrequency, FrequencyMeta> = {
  'bi-weekly': { interval: 1, occurrences: 2, label: 'Bi-weekly' },
  monthly: { interval: 1, occurrences: 1, label: 'Monthly' },
  quarterly: { interval: 3, occurrences: 1, label: 'Quarterly' },
  annually: { interval: 12, occurrences: 1, label: 'Annually' },
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const applyContribution = (
  amount: number,
  totals: { balance: number; contributions: number },
) => ({
  balance: totals.balance + amount,
  contributions: totals.contributions + amount,
})

const getContributionInterval = (frequency: ContributionFrequency) =>
  FREQUENCY_META[frequency].interval

const getContributionOccurrences = (frequency: ContributionFrequency) =>
  FREQUENCY_META[frequency].occurrences

const normalizeSchedule = (
  schedule: ContributionSchedule | undefined,
  totalMonths: number,
): ContributionSchedule | undefined => {
  if (!schedule) {
    return undefined
  }

  const startMonth = clamp(schedule.startMonth, 1, totalMonths)
  const endMonth = clamp(schedule.endMonth, startMonth, totalMonths)

  if (schedule.amount <= 0 || endMonth < startMonth) {
    return undefined
  }

  return {
    ...schedule,
    startMonth,
    endMonth,
  }
}

const isContributionMonth = (
  monthIndex: number,
  schedule: ContributionSchedule,
) => {
  if (monthIndex < schedule.startMonth || monthIndex > schedule.endMonth) {
    return false
  }

  const interval = getContributionInterval(schedule.frequency)
  return (monthIndex - schedule.startMonth) % interval === 0
}

const shouldApplyContribution = (
  monthIndex: number,
  schedule: ContributionSchedule,
  timing: ContributionTiming,
) => {
  const isWithinRange =
    monthIndex >= schedule.startMonth && monthIndex <= schedule.endMonth

  if (timing === 'beginning-of-year' || timing === 'end-of-year') {
    return isWithinRange && isTimingMonth({ monthIndex, timing })
  }

  return isContributionMonth(monthIndex, schedule)
}

const buildTotals = (points: ProjectionPoint[]): ProjectionTotals => {
  const lastPoint = points[points.length - 1]
  const totalContributions = lastPoint.totalContributions
  const finalBalance = lastPoint.balance

  return {
    totalContributions,
    totalReturns: finalBalance - totalContributions,
    finalBalance,
  }
}

export const getFrequencyLabel = (frequency: ContributionFrequency) =>
  FREQUENCY_META[frequency].label

// Rules: monthly points are retained while compounding uses an effective monthly
// rate derived from the selected frequency. Contribution timing is applied
// before or after monthly compounding, and year-based timing only applies on
// month 1 (beginning) or 12 (end).
export const buildProjection = (input: AccountInput): AccountProjection => {
  const totalMonths = Math.max(Math.round(input.termYears * 12), 1)
  const timingFrequency = input.contribution?.frequency ?? 'monthly'
  if (
    input.contribution &&
    !isTimingValidForFrequency({
      timing: input.contributionTiming,
      frequency: timingFrequency,
    })
  ) {
    throw new Error(
      `Invalid contribution timing "${input.contributionTiming}" for frequency "${timingFrequency}".`,
    )
  }
  const monthlyRate = getEffectiveMonthlyRate({
    annualRatePercent: input.annualRatePercent,
    compoundingFrequency: input.compoundingFrequency,
  })
  const schedule = normalizeSchedule(input.contribution, totalMonths)
  const applyBeforeCompounding = isContributionBeforeCompounding(
    input.contributionTiming,
  )

  const points: ProjectionPoint[] = [
    {
      month: 0,
      year: 0,
      balance: input.principal,
      totalContributions: input.principal,
    },
  ]

  let runningBalance = input.principal
  let runningContributions = input.principal

  for (let monthIndex = 1; monthIndex <= totalMonths; monthIndex += 1) {
    const hasContribution =
      schedule &&
      shouldApplyContribution(monthIndex, schedule, input.contributionTiming)
    const contributionAmount = hasContribution
      ? schedule.amount * getContributionOccurrences(schedule.frequency)
      : 0
    const totalsBefore = {
      balance: runningBalance,
      contributions: runningContributions,
    }
    const totalsAfterContribution = applyBeforeCompounding
      ? applyContribution(contributionAmount, totalsBefore)
      : totalsBefore
    const balanceAfterInterest =
      totalsAfterContribution.balance * (1 + monthlyRate)
    const totalsAfter = applyBeforeCompounding
      ? { ...totalsAfterContribution, balance: balanceAfterInterest }
      : applyContribution(contributionAmount, {
          balance: balanceAfterInterest,
          contributions: totalsBefore.contributions,
        })

    runningBalance = totalsAfter.balance
    runningContributions = totalsAfter.contributions

    points.push({
      month: monthIndex,
      year: monthIndex / 12,
      balance: runningBalance,
      totalContributions: runningContributions,
    })
  }

  return {
    points,
    totals: buildTotals(points),
  }
}
