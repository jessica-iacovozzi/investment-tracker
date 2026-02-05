import { describe, expect, it } from 'vitest'
import type { AccountInput, AccountUpdatePayload } from '../types/investment'
import {
  getAccountsByType,
  getCombinedProjectedContributions,
  getSharedContributionRoom,
  getSharedAvailableRoom,
  getAggregatedContributionSummary,
  syncContributionRoomFields,
} from './sharedContributionRoom'

const buildAccount = (
  overrides: Partial<AccountInput> = {},
): AccountInput => ({
  id: 'test-account',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 5,
  compoundingFrequency: 'monthly',
  termYears: 10,
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  ...overrides,
})

describe('getAccountsByType', () => {
  it('returns empty array when no accounts match', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa' }),
      buildAccount({ id: '2', accountType: 'rrsp' }),
    ]
    expect(getAccountsByType(accounts, 'fhsa')).toEqual([])
  })

  it('returns all accounts of the specified type', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa' }),
      buildAccount({ id: '2', accountType: 'rrsp' }),
      buildAccount({ id: '3', accountType: 'tfsa' }),
    ]
    const result = getAccountsByType(accounts, 'tfsa')
    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toEqual(['1', '3'])
  })

  it('returns empty array for empty accounts list', () => {
    expect(getAccountsByType([], 'tfsa')).toEqual([])
  })
})

describe('getCombinedProjectedContributions', () => {
  it('returns 0 when no accounts of type exist', () => {
    const accounts = [buildAccount({ id: '1', accountType: 'rrsp' })]
    expect(getCombinedProjectedContributions(accounts, 'tfsa')).toBe(0)
  })

  it('sums contributions across all accounts of same type', () => {
    const accounts = [
      buildAccount({
        id: '1',
        accountType: 'tfsa',
        contribution: { amount: 500, frequency: 'monthly', startMonth: 1, endMonth: 12 },
      }),
      buildAccount({
        id: '2',
        accountType: 'tfsa',
        contribution: { amount: 300, frequency: 'monthly', startMonth: 1, endMonth: 12 },
      }),
      buildAccount({
        id: '3',
        accountType: 'rrsp',
        contribution: { amount: 1000, frequency: 'monthly', startMonth: 1, endMonth: 12 },
      }),
    ]
    expect(getCombinedProjectedContributions(accounts, 'tfsa')).toBe(9600)
  })

  it('returns 0 when accounts have no contributions', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa' }),
      buildAccount({ id: '2', accountType: 'tfsa' }),
    ]
    expect(getCombinedProjectedContributions(accounts, 'tfsa')).toBe(0)
  })
})

describe('getSharedContributionRoom', () => {
  it('returns 0 when no accounts of type exist', () => {
    const accounts = [buildAccount({ id: '1', accountType: 'rrsp' })]
    expect(getSharedContributionRoom(accounts, 'tfsa')).toBe(0)
  })

  it('returns most recent account contribution room as shared room', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa', contributionRoom: 50000 }),
      buildAccount({ id: '2', accountType: 'tfsa', contributionRoom: 30000 }),
    ]
    expect(getSharedContributionRoom(accounts, 'tfsa')).toBe(30000)
  })

  it('returns 0 when most recent account has no contribution room', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa', contributionRoom: 30000 }),
      buildAccount({ id: '2', accountType: 'tfsa' }),
    ]
    expect(getSharedContributionRoom(accounts, 'tfsa')).toBe(0)
  })
})

describe('getSharedAvailableRoom', () => {
  it('returns 0 when no accounts of type exist', () => {
    const accounts = [buildAccount({ id: '1', accountType: 'rrsp' })]
    expect(getSharedAvailableRoom(accounts, 'tfsa')).toBe(0)
  })

  it('calculates available room using account with longest term', () => {
    const accounts = [
      buildAccount({
        id: '1',
        accountType: 'tfsa',
        contributionRoom: 50000,
        termYears: 5,
      }),
      buildAccount({
        id: '2',
        accountType: 'tfsa',
        contributionRoom: 50000,
        termYears: 10,
      }),
    ]
    const result = getSharedAvailableRoom(accounts, 'tfsa')
    expect(result).toBe(120000)
  })

  it('returns -1 for non-registered accounts', () => {
    const accounts = [buildAccount({ id: '1', accountType: 'non-registered' })]
    expect(getSharedAvailableRoom(accounts, 'non-registered')).toBe(-1)
  })
})

describe('getAggregatedContributionSummary', () => {
  it('returns complete summary for account type', () => {
    const accounts = [
      buildAccount({
        id: '1',
        accountType: 'tfsa',
        contributionRoom: 50000,
        termYears: 5,
        contribution: { amount: 500, frequency: 'monthly', startMonth: 1, endMonth: 60 },
      }),
      buildAccount({
        id: '2',
        accountType: 'tfsa',
        contributionRoom: 50000,
        termYears: 5,
        contribution: { amount: 300, frequency: 'monthly', startMonth: 1, endMonth: 60 },
      }),
    ]
    const result = getAggregatedContributionSummary(accounts, 'tfsa')

    expect(result.accountType).toBe('tfsa')
    expect(result.sharedContributionRoom).toBe(50000)
    expect(result.totalProjectedContributions).toBe(48000)
    expect(result.accountCount).toBe(2)
    expect(result.accountIds).toEqual(['1', '2'])
    expect(result.isOverContributing).toBe(false)
  })

  it('detects over-contribution across multiple accounts', () => {
    const accounts = [
      buildAccount({
        id: '1',
        accountType: 'tfsa',
        contributionRoom: 20000,
        termYears: 1,
        contribution: { amount: 1500, frequency: 'monthly', startMonth: 1, endMonth: 12 },
      }),
      buildAccount({
        id: '2',
        accountType: 'tfsa',
        contributionRoom: 20000,
        termYears: 1,
        contribution: { amount: 1500, frequency: 'monthly', startMonth: 1, endMonth: 12 },
      }),
    ]
    const result = getAggregatedContributionSummary(accounts, 'tfsa')

    expect(result.isOverContributing).toBe(true)
    expect(result.overContributionDetails.exceedsRoom).toBe(true)
    expect(result.overContributionDetails.excessAmount).toBeGreaterThan(0)
  })

  it('returns empty summary for non-existent account type', () => {
    const accounts = [buildAccount({ id: '1', accountType: 'rrsp' })]
    const result = getAggregatedContributionSummary(accounts, 'tfsa')

    expect(result.accountCount).toBe(0)
    expect(result.accountIds).toEqual([])
    expect(result.sharedContributionRoom).toBe(0)
  })
})

describe('syncContributionRoomFields', () => {
  it('syncs contributionRoom across same-type accounts', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa', contributionRoom: 50000 }),
      buildAccount({ id: '2', accountType: 'tfsa', contributionRoom: 50000 }),
      buildAccount({ id: '3', accountType: 'rrsp', contributionRoom: 30000 }),
    ]
    const payload: AccountUpdatePayload = {
      id: '1',
      changes: { contributionRoom: 60000 },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result[0].contributionRoom).toBe(50000)
    expect(result[1].contributionRoom).toBe(60000)
    expect(result[2].contributionRoom).toBe(30000)
  })

  it('syncs annualIncomeForRrsp across RRSP accounts', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'rrsp', annualIncomeForRrsp: 80000 }),
      buildAccount({ id: '2', accountType: 'rrsp', annualIncomeForRrsp: 80000 }),
    ]
    const payload: AccountUpdatePayload = {
      id: '1',
      changes: { annualIncomeForRrsp: 100000 },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result[0].annualIncomeForRrsp).toBe(80000)
    expect(result[1].annualIncomeForRrsp).toBe(100000)
  })

  it('syncs fhsaLifetimeContributions across FHSA accounts', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'fhsa', fhsaLifetimeContributions: 8000 }),
      buildAccount({ id: '2', accountType: 'fhsa', fhsaLifetimeContributions: 8000 }),
    ]
    const payload: AccountUpdatePayload = {
      id: '1',
      changes: { fhsaLifetimeContributions: 16000 },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result[0].fhsaLifetimeContributions).toBe(8000)
    expect(result[1].fhsaLifetimeContributions).toBe(16000)
  })

  it('does not sync non-synced fields', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa', name: 'TFSA 1' }),
      buildAccount({ id: '2', accountType: 'tfsa', name: 'TFSA 2' }),
    ]
    const payload: AccountUpdatePayload = {
      id: '1',
      changes: { name: 'My TFSA' },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result[0].name).toBe('TFSA 1')
    expect(result[1].name).toBe('TFSA 2')
  })

  it('does not sync to different account types', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'tfsa', contributionRoom: 50000 }),
      buildAccount({ id: '2', accountType: 'rrsp', contributionRoom: 30000 }),
    ]
    const payload: AccountUpdatePayload = {
      id: '1',
      changes: { contributionRoom: 60000 },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result[1].contributionRoom).toBe(30000)
  })

  it('does not sync for non-registered accounts', () => {
    const accounts = [
      buildAccount({ id: '1', accountType: 'non-registered' }),
      buildAccount({ id: '2', accountType: 'non-registered' }),
    ]
    const payload: AccountUpdatePayload = {
      id: '1',
      changes: { principal: 20000 },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result).toEqual(accounts)
  })

  it('returns original accounts when updated account not found', () => {
    const accounts = [buildAccount({ id: '1', accountType: 'tfsa' })]
    const payload: AccountUpdatePayload = {
      id: 'non-existent',
      changes: { contributionRoom: 60000 },
    }

    const result = syncContributionRoomFields(accounts, payload)

    expect(result).toEqual(accounts)
  })
})
