import { describe, expect, it } from 'vitest'
import { getFinalAgeLabel, isValidAge } from './ageLabel'

describe('isValidAge', () => {
  it('accepts whole ages within range', () => {
    expect(isValidAge(0)).toBe(true)
    expect(isValidAge(45)).toBe(true)
    expect(isValidAge(120)).toBe(true)
  })

  it('rejects ages outside range or non-integers', () => {
    expect(isValidAge(-1)).toBe(false)
    expect(isValidAge(121)).toBe(false)
    expect(isValidAge(32.5)).toBe(false)
  })
})

describe('getFinalAgeLabel', () => {
  it('returns default label when age is missing or invalid', () => {
    expect(getFinalAgeLabel({ currentAge: undefined, termYears: 30 })).toBe(
      'Final value',
    )
    expect(getFinalAgeLabel({ currentAge: 130, termYears: 30 })).toBe(
      'Final value',
    )
  })

  it('returns age-based label when valid', () => {
    expect(getFinalAgeLabel({ currentAge: 30, termYears: 30 })).toBe(
      'Final value at 60 years old',
    )
  })

  it('rounds the final age to whole years', () => {
    expect(getFinalAgeLabel({ currentAge: 30, termYears: 29.6 })).toBe(
      'Final value at 60 years old',
    )
  })
})
