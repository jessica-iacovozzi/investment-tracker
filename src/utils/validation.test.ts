import { describe, expect, it } from 'vitest'
import {
  isValidContributionSchedule,
  isValidAccountInput,
  isValidAccountInputArray,
  isValidGoalState,
  isValidInflationState,
  isStoragePayloadWithinLimit,
  sanitizeName,
  MAX_STORAGE_PAYLOAD_BYTES,
} from './validation'
import type { AccountInput, ContributionSchedule } from '../types/investment'
import type { GoalState } from '../types/goal'
import type { InflationState } from '../types/inflation'

const validSchedule: ContributionSchedule = {
  amount: 200,
  frequency: 'monthly',
  startMonth: 1,
  endMonth: 12,
}

const validAccount: AccountInput = {
  id: 'acc-1',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 6.5,
  compoundingFrequency: 'monthly',
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  contribution: validSchedule,
}

const validGoalState: GoalState = {
  isGoalMode: true,
  targetBalance: 1000000,
  calculationType: 'contribution',
  contributionFrequency: 'monthly',
  allocationStrategy: 'proportional',
}

const validInflationState: InflationState = {
  isEnabled: true,
  annualRatePercent: 2.5,
}

describe('isValidContributionSchedule', () => {
  it('returns true for a valid schedule', () => {
    expect(isValidContributionSchedule(validSchedule)).toBe(true)
  })

  it('returns true for all valid frequencies', () => {
    const frequencies = ['bi-weekly', 'monthly', 'quarterly', 'annually']
    frequencies.forEach((frequency) => {
      expect(
        isValidContributionSchedule({ ...validSchedule, frequency }),
      ).toBe(true)
    })
  })

  it('returns false when amount is missing', () => {
    const { amount: _amount, ...rest } = validSchedule
    void _amount
    expect(isValidContributionSchedule(rest)).toBe(false)
  })

  it('returns false when frequency is invalid', () => {
    expect(
      isValidContributionSchedule({ ...validSchedule, frequency: 'weekly' }),
    ).toBe(false)
  })

  it('returns false when startMonth is less than 1', () => {
    expect(
      isValidContributionSchedule({ ...validSchedule, startMonth: 0 }),
    ).toBe(false)
  })

  it('returns false when endMonth is less than 1', () => {
    expect(
      isValidContributionSchedule({ ...validSchedule, endMonth: 0 }),
    ).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidContributionSchedule(null)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(isValidContributionSchedule('string')).toBe(false)
  })
})

describe('isValidAccountInput', () => {
  it('returns true for a valid full account', () => {
    expect(isValidAccountInput(validAccount)).toBe(true)
  })

  it('returns true for an account without optional contribution', () => {
    const { contribution: _contribution, ...accountWithoutContribution } = validAccount
    void _contribution
    expect(isValidAccountInput(accountWithoutContribution)).toBe(true)
  })

  it('returns true for all valid account types', () => {
    const types = ['tfsa', 'rrsp', 'fhsa', 'lira', 'non-registered']
    types.forEach((accountType) => {
      expect(
        isValidAccountInput({ ...validAccount, accountType }),
      ).toBe(true)
    })
  })

  it('returns false when id is missing', () => {
    const { id: _id, ...rest } = validAccount
    void _id
    expect(isValidAccountInput(rest)).toBe(false)
  })

  it('returns false when principal is a string', () => {
    expect(
      isValidAccountInput({ ...validAccount, principal: '10000' }),
    ).toBe(false)
  })

  it('returns false when accountType is invalid', () => {
    expect(
      isValidAccountInput({ ...validAccount, accountType: 'savings' }),
    ).toBe(false)
  })

  it('returns false when compoundingFrequency is invalid', () => {
    expect(
      isValidAccountInput({ ...validAccount, compoundingFrequency: 'hourly' }),
    ).toBe(false)
  })

  it('returns false when contributionTiming is invalid', () => {
    expect(
      isValidAccountInput({ ...validAccount, contributionTiming: 'middle' }),
    ).toBe(false)
  })

  it('returns false when contribution has invalid shape', () => {
    expect(
      isValidAccountInput({
        ...validAccount,
        contribution: { amount: 200 },
      }),
    ).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidAccountInput(null)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(isValidAccountInput(42)).toBe(false)
  })
})

describe('isValidAccountInputArray', () => {
  it('returns true for a valid array', () => {
    expect(isValidAccountInputArray([validAccount])).toBe(true)
  })

  it('returns true for an empty array', () => {
    expect(isValidAccountInputArray([])).toBe(true)
  })

  it('returns false when one element is invalid', () => {
    expect(
      isValidAccountInputArray([validAccount, { bad: true }]),
    ).toBe(false)
  })

  it('returns false for a non-array', () => {
    expect(isValidAccountInputArray('not-an-array')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidAccountInputArray(null)).toBe(false)
  })

  it('returns false for a plain object', () => {
    expect(isValidAccountInputArray({ 0: validAccount })).toBe(false)
  })
})

describe('isValidGoalState', () => {
  it('returns true for a valid state', () => {
    expect(isValidGoalState(validGoalState)).toBe(true)
  })

  it('returns true for both calculation types', () => {
    expect(
      isValidGoalState({ ...validGoalState, calculationType: 'term' }),
    ).toBe(true)
  })

  it('returns true for all allocation strategies', () => {
    const strategies = ['proportional', 'highest-return', 'equal']
    strategies.forEach((allocationStrategy) => {
      expect(
        isValidGoalState({ ...validGoalState, allocationStrategy }),
      ).toBe(true)
    })
  })

  it('returns false when isGoalMode is missing', () => {
    const { isGoalMode: _isGoalMode, ...rest } = validGoalState
    void _isGoalMode
    expect(isValidGoalState(rest)).toBe(false)
  })

  it('returns false when calculationType is invalid', () => {
    expect(
      isValidGoalState({ ...validGoalState, calculationType: 'rate' }),
    ).toBe(false)
  })

  it('returns false when contributionFrequency is invalid', () => {
    expect(
      isValidGoalState({ ...validGoalState, contributionFrequency: 'daily' }),
    ).toBe(false)
  })

  it('returns false when allocationStrategy is invalid', () => {
    expect(
      isValidGoalState({ ...validGoalState, allocationStrategy: 'random' }),
    ).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidGoalState(null)).toBe(false)
  })
})

describe('isValidInflationState', () => {
  it('returns true for a valid state', () => {
    expect(isValidInflationState(validInflationState)).toBe(true)
  })

  it('returns false when annualRatePercent is a string', () => {
    expect(
      isValidInflationState({ isEnabled: true, annualRatePercent: '2.5' }),
    ).toBe(false)
  })

  it('returns false when isEnabled is missing', () => {
    expect(
      isValidInflationState({ annualRatePercent: 2.5 }),
    ).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidInflationState(null)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(isValidInflationState('string')).toBe(false)
  })
})

describe('sanitizeName', () => {
  it('passes through a normal string', () => {
    expect(sanitizeName('My Account')).toBe('My Account')
  })

  it('strips control characters', () => {
    expect(sanitizeName('Test\u0000Name\u001F')).toBe('TestName')
  })

  it('strips the DEL character (U+007F)', () => {
    expect(sanitizeName('Hello\u007FWorld')).toBe('HelloWorld')
  })

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeName('  Trimmed  ')).toBe('Trimmed')
  })

  it('caps at 100 characters', () => {
    const longName = 'A'.repeat(200)
    const result = sanitizeName(longName)
    expect(result.length).toBe(100)
    expect(result).toBe('A'.repeat(100))
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeName(42)).toBe('')
    expect(sanitizeName(null)).toBe('')
    expect(sanitizeName(undefined)).toBe('')
  })

  it('handles an empty string', () => {
    expect(sanitizeName('')).toBe('')
  })
})

describe('isStoragePayloadWithinLimit', () => {
  it('returns true for a string under 1 MB', () => {
    expect(isStoragePayloadWithinLimit('hello')).toBe(true)
  })

  it('returns true for an empty string', () => {
    expect(isStoragePayloadWithinLimit('')).toBe(true)
  })

  it('returns false for a string over 1 MB', () => {
    const oversized = 'x'.repeat(MAX_STORAGE_PAYLOAD_BYTES + 1)
    expect(isStoragePayloadWithinLimit(oversized)).toBe(false)
  })

  it('returns true for a string exactly at the limit', () => {
    const atLimit = 'x'.repeat(MAX_STORAGE_PAYLOAD_BYTES)
    expect(isStoragePayloadWithinLimit(atLimit)).toBe(true)
  })
})
