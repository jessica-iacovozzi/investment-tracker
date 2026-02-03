export type ContributionFrequency =
  | 'bi-weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'

export type CompoundingFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'semimonthly'
  | 'biweekly'
  | 'weekly'
  | 'daily'
  | 'continuously'

export type ContributionTiming =
  | 'beginning-of-month'
  | 'end-of-month'
  | 'beginning-of-quarter'
  | 'end-of-quarter'
  | 'beginning-of-biweekly'
  | 'end-of-biweekly'
  | 'beginning-of-year'
  | 'end-of-year'

export type ContributionSchedule = {
  amount: number
  frequency: ContributionFrequency
  startMonth: number
  endMonth: number
}

export type AccountInput = {
  id: string
  name: string
  principal: number
  annualRatePercent: number
  compoundingFrequency: CompoundingFrequency
  termYears: number
  currentAge?: number
  contributionTiming: ContributionTiming
  contribution?: ContributionSchedule
  isLockedIn?: boolean
}

export type AccountUpdatePayload = {
  id: string
  changes: Partial<AccountInput>
}

export type ProjectionPoint = {
  month: number
  year: number
  balance: number
  totalContributions: number
}

export type ProjectionTotals = {
  totalContributions: number
  totalReturns: number
  finalBalance: number
}

export type AccountProjection = {
  points: ProjectionPoint[]
  totals: ProjectionTotals
}
