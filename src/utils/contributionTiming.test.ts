import { describe, expect, it } from 'vitest'
import {
  getDefaultTimingForFrequency,
  getValidTimingsForFrequency,
  isTimingValidForFrequency,
  normalizeTimingForFrequency,
} from './contributionTiming'

describe('contribution timing helpers', () => {
  it('returns valid timings for each frequency', () => {
    expect(getValidTimingsForFrequency('monthly')).toEqual([
      'beginning-of-month',
      'end-of-month',
    ])
    expect(getValidTimingsForFrequency('quarterly')).toEqual([
      'beginning-of-quarter',
      'end-of-quarter',
    ])
    expect(getValidTimingsForFrequency('bi-weekly')).toEqual([
      'beginning-of-biweekly',
      'end-of-biweekly',
    ])
    expect(getValidTimingsForFrequency('annually')).toEqual([
      'beginning-of-year',
      'end-of-year',
    ])
  })

  it('returns default timing per frequency', () => {
    expect(getDefaultTimingForFrequency('monthly')).toBe('end-of-month')
    expect(getDefaultTimingForFrequency('quarterly')).toBe('end-of-quarter')
    expect(getDefaultTimingForFrequency('bi-weekly')).toBe('end-of-biweekly')
    expect(getDefaultTimingForFrequency('annually')).toBe('end-of-year')
  })

  it('validates timing/frequency combinations', () => {
    expect(
      isTimingValidForFrequency({
        timing: 'beginning-of-quarter',
        frequency: 'quarterly',
      }),
    ).toBe(true)
    expect(
      isTimingValidForFrequency({
        timing: 'beginning-of-year',
        frequency: 'monthly',
      }),
    ).toBe(false)
  })

  it('normalizes invalid combinations to defaults', () => {
    expect(
      normalizeTimingForFrequency({
        timing: 'beginning-of-year',
        frequency: 'monthly',
      }),
    ).toBe('end-of-month')
  })
})
