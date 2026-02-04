import type { AccountType } from '../types/investment'

export const ACCOUNT_TYPES: AccountType[] = [
  'tfsa',
  'rrsp',
  'fhsa',
  'lira',
  'non-registered',
]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  tfsa: 'TFSA',
  rrsp: 'RRSP',
  fhsa: 'FHSA',
  lira: 'LIRA',
  'non-registered': 'Non-registered',
}

export const DEFAULT_ACCOUNT_TYPE: AccountType = 'non-registered'

/**
 * Annual contribution limits for tax-advantaged accounts.
 * TFSA: $7,000 (2024-2026)
 * RRSP: 18% of income up to $31,560 (2024)
 * FHSA: $8,000 per year, $40,000 lifetime
 */
export const ANNUAL_CONTRIBUTION_LIMITS: Partial<Record<AccountType, number>> = {
  tfsa: 7000,
  rrsp: 31560,
  fhsa: 8000,
}

export const FHSA_LIFETIME_LIMIT = 40000
export const FHSA_MAX_ANNUAL_WITH_CARRYFORWARD = 16000
export const RRSP_INCOME_PERCENTAGE = 0.18
export const RRSP_OVERCONTRIBUTION_BUFFER = 2000

/**
 * Account types that have contribution room limits.
 */
export const TAX_ADVANTAGED_ACCOUNT_TYPES: AccountType[] = [
  'tfsa',
  'rrsp',
  'fhsa',
]

/**
 * Account types that are always locked (no contributions allowed).
 */
export const LOCKED_ACCOUNT_TYPES: AccountType[] = ['lira']

/**
 * Check if an account type is tax-advantaged (has contribution room).
 */
export const isTaxAdvantagedAccount = (accountType: AccountType): boolean =>
  TAX_ADVANTAGED_ACCOUNT_TYPES.includes(accountType)

/**
 * Check if an account type is always locked.
 */
export const isLockedAccountType = (accountType: AccountType): boolean =>
  LOCKED_ACCOUNT_TYPES.includes(accountType)

/**
 * Check if a value is a valid account type.
 */
export const isValidAccountType = (value: string): value is AccountType =>
  ACCOUNT_TYPES.includes(value as AccountType)
