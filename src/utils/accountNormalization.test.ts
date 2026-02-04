import { describe, expect, it, vi } from 'vitest'
import type { AccountInput } from '../types/investment'
import { normalizeAccount } from './accountNormalization'

const baseAccount: AccountInput = {
  id: 'test',
  name: 'Test',
  principal: 1000,
  annualRatePercent: 5,
  compoundingFrequency: 'monthly',
  termYears: 1,
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  contribution: {
    amount: 100,
    frequency: 'monthly',
    startMonth: 1,
    endMonth: 12,
  },
}

// Note: currentAge is now global and not part of AccountInput

describe('normalizeAccount', () => {
  it('falls back to defaults for invalid compounding frequency and timing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { account } = normalizeAccount({
      account: {
        ...baseAccount,
        compoundingFrequency: 'invalid' as AccountInput['compoundingFrequency'],
        contributionTiming: 'invalid' as AccountInput['contributionTiming'],
      },
    })

    expect(account.compoundingFrequency).toBe('monthly')
    expect(account.contributionTiming).toBe('end-of-month')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('normalizes timing to the default for the selected frequency', () => {
    const { account } = normalizeAccount({
      account: {
        ...baseAccount,
        contribution: {
          amount: 100,
          frequency: 'quarterly',
          startMonth: 1,
          endMonth: 12,
        },
        contributionTiming: 'beginning-of-month',
      },
    })

    expect(account.contributionTiming).toBe('end-of-quarter')
  })

  it('defaults to non-registered when accountType is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const accountWithoutType = { ...baseAccount } as Partial<AccountInput>
    delete (accountWithoutType as Record<string, unknown>).accountType
    const { account } = normalizeAccount({
      account: accountWithoutType as AccountInput,
    })

    expect(account.accountType).toBe('non-registered')
    expect(warnSpy).toHaveBeenCalledWith(
      'Missing or invalid account type. Defaulting to non-registered.',
    )
    warnSpy.mockRestore()
  })

  it('defaults to non-registered when accountType is invalid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { account } = normalizeAccount({
      account: {
        ...baseAccount,
        accountType: 'invalid-type' as AccountInput['accountType'],
      },
    })

    expect(account.accountType).toBe('non-registered')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('preserves valid accountType', () => {
    const { account } = normalizeAccount({
      account: {
        ...baseAccount,
        accountType: 'tfsa',
      },
    })

    expect(account.accountType).toBe('tfsa')
  })

  it('forces isLockedIn to true for LIRA accounts', () => {
    const { account } = normalizeAccount({
      account: {
        ...baseAccount,
        accountType: 'lira',
        isLockedIn: false,
      },
    })

    expect(account.accountType).toBe('lira')
    expect(account.isLockedIn).toBe(true)
  })

  it('preserves isLockedIn for non-LIRA accounts', () => {
    const { account } = normalizeAccount({
      account: {
        ...baseAccount,
        accountType: 'tfsa',
        isLockedIn: false,
      },
    })

    expect(account.isLockedIn).toBe(false)
  })
})
