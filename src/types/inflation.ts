export type InflationState = {
  isEnabled: boolean
  annualRatePercent: number
}

export const DEFAULT_INFLATION_STATE: InflationState = {
  isEnabled: false,
  annualRatePercent: 2.5,
}

export const MIN_INFLATION_RATE = 0
export const MAX_INFLATION_RATE = 15
export const INFLATION_RATE_STEP = 0.1
