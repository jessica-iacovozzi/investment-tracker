import type {
  AccountInput,
  AccountType,
  AccountTypeContributionSummary,
  AccountUpdatePayload,
  OverContributionDetails,
} from '../types/investment'
import { isTaxAdvantagedAccount } from '../constants/accountTypes'
import {
  calculateTotalProjectedContributions,
  calculateAvailableRoom,
  getOverContributionBuffer,
} from './contributionRoom'

/**
 * Get all accounts of a specific type.
 */
export const getAccountsByType = (
  accounts: AccountInput[],
  accountType: AccountType,
): AccountInput[] => accounts.filter((acc) => acc.accountType === accountType)

/**
 * Get the most recently updated account of a specific type.
 * Uses array order as a proxy for recency (last updated account appears later in array).
 */
export const getMostRecentAccountByType = (
  accounts: AccountInput[],
  accountType: AccountType,
): AccountInput | undefined => {
  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  return sameTypeAccounts[sameTypeAccounts.length - 1]
}

/**
 * Calculate combined projected contributions for all accounts of a given type.
 */
export const getCombinedProjectedContributions = (
  accounts: AccountInput[],
  accountType: AccountType,
): number => {
  try {
    const sameTypeAccounts = getAccountsByType(accounts, accountType)
    
    // Validate accounts before processing
    const validAccounts = sameTypeAccounts.filter(account => {
      if (!account || typeof account !== 'object') return false
      if (!account.id || typeof account.id !== 'string') return false
      if (typeof account.termYears !== 'number' || account.termYears < 0) return false
      return true
    })

    return validAccounts.reduce(
      (total, acc) => {
        try {
          const contributions = calculateTotalProjectedContributions(acc)
          return total + (typeof contributions === 'number' && !isNaN(contributions) ? contributions : 0)
        } catch {
          // Skip malformed accounts and continue
          return total
        }
      },
      0,
    )
  } catch {
    // Return 0 if anything goes wrong with the aggregation
    return 0
  }
}

/**
 * Get the shared contribution room for an account type.
 * Uses the most recently updated account's contribution room as the source of truth.
 */
export const getSharedContributionRoom = (
  accounts: AccountInput[],
  accountType: AccountType,
): number => {
  const mostRecentAccount = getMostRecentAccountByType(accounts, accountType)
  if (!mostRecentAccount) {
    return 0
  }
  
  // Graceful handling: if contribution room is undefined, return 0
  // This prevents NaN errors in calculations
  return Math.max(0, mostRecentAccount.contributionRoom ?? 0)
}

/**
 * Fields that should be synced across accounts of the same type.
 */
const SYNCED_FIELDS_BY_TYPE: Record<AccountType, (keyof AccountInput)[]> = {
  tfsa: ['contributionRoom', 'customAnnualRoomIncrease'],
  rrsp: ['contributionRoom', 'annualIncomeForRrsp', 'customAnnualRoomIncrease'],
  fhsa: ['contributionRoom', 'fhsaLifetimeContributions', 'customAnnualRoomIncrease'],
  lira: [],
  'non-registered': [],
}

/**
 * Get the fields that should be synced for a given account type.
 */
export const getSyncedFieldsForType = (
  accountType: AccountType,
): (keyof AccountInput)[] => SYNCED_FIELDS_BY_TYPE[accountType] ?? []

/**
 * Get shared field values from existing accounts of the same type.
 * Uses the most recently updated account with defined synced field values.
 */
export const getSharedFieldSeedValues = (
  accounts: AccountInput[],
  accountType: AccountType,
  options: { excludeAccountId?: string } = {},
): Partial<AccountInput> => {
  const sameTypeAccounts = getAccountsByType(accounts, accountType).filter(
    (account) => account.id !== options.excludeAccountId,
  )
  const syncedFields = getSyncedFieldsForType(accountType)

  // Find most recent account that has any defined synced field values
  const seedAccount = [...sameTypeAccounts].reverse().find((account) =>
    syncedFields.some((field) => account[field] !== undefined),
  )

  if (!seedAccount) {
    return {}
  }

  const seedValues: Partial<AccountInput> = {}
  const writableSeedValues = seedValues as Record<
    keyof AccountInput,
    AccountInput[keyof AccountInput]
  >

  for (const field of syncedFields) {
    const value = seedAccount[field]
    if (value !== undefined) {
      writableSeedValues[field] = value
    }
  }

  return seedValues
}

/**
 * Get the shared available room for an account type.
 * Uses the most recently updated account with the longest term to calculate available room.
 */
export const getSharedAvailableRoom = (
  accounts: AccountInput[],
  accountType: AccountType,
): number => {
  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  if (sameTypeAccounts.length === 0) {
    // Return -1 for non-registered accounts (unlimited room), 0 for others
    return accountType === 'non-registered' ? -1 : 0
  }

  // Find account with longest term among same-type accounts
  const maxTermAccount = sameTypeAccounts.reduce((maxAcc, acc) =>
    acc.termYears > maxAcc.termYears ? acc : maxAcc,
  )

  // Get shared field values from most recent account
  const mostRecentAccount = getMostRecentAccountByType(accounts, accountType)
  const seedValues = mostRecentAccount ? getSharedFieldSeedValues(accounts, accountType, {
    excludeAccountId: mostRecentAccount.id,
  }) : {}

  const baseAccount = { ...maxTermAccount, ...seedValues }
  const availableRoom = calculateAvailableRoom(baseAccount)
  return availableRoom === Infinity ? -1 : availableRoom
}

/**
 * Calculate shared over-contribution details for an account type.
 */
const getSharedOverContributionDetails = (
  accounts: AccountInput[],
  accountType: AccountType,
  availableRoom: number,
  totalContributions: number,
): OverContributionDetails => {
  if (!isTaxAdvantagedAccount(accountType) || availableRoom === -1) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  const buffer =
    sameTypeAccounts.length > 0 ? getOverContributionBuffer(sameTypeAccounts[0]) : 0
  const effectiveRoom = availableRoom + buffer

  if (totalContributions <= effectiveRoom) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const excessAmount = Math.round((totalContributions - effectiveRoom) * 100) / 100

  return {
    exceedsRoom: true,
    excessAmount,
    estimatedPenalty: Math.round(excessAmount * 0.01 * 12 * 100) / 100,
  }
}

/**
 * Get aggregated contribution room summary for an account type.
 */
export const getAggregatedContributionSummary = (
  accounts: AccountInput[],
  accountType: AccountType,
): AccountTypeContributionSummary => {
  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  const sharedContributionRoom = getSharedContributionRoom(accounts, accountType)
  const totalProjectedContributions = getCombinedProjectedContributions(
    accounts,
    accountType,
  )
  const availableRoom = getSharedAvailableRoom(accounts, accountType)
  const remainingRoom =
    availableRoom === -1
      ? -1
      : Math.round((availableRoom - totalProjectedContributions) * 100) / 100

  const overContributionDetails = getSharedOverContributionDetails(
    accounts,
    accountType,
    availableRoom,
    totalProjectedContributions,
  )

  return {
    accountType,
    sharedContributionRoom,
    totalProjectedContributions,
    remainingRoom,
    accountIds: sameTypeAccounts.map((acc) => acc.id),
    accountCount: sameTypeAccounts.length,
    isOverContributing: overContributionDetails.exceedsRoom,
    overContributionDetails,
  }
}

/**
 * Check if a field should be synced for a given account type.
 */
const isSyncedField = (
  accountType: AccountType,
  field: keyof AccountInput,
): boolean => SYNCED_FIELDS_BY_TYPE[accountType]?.includes(field) ?? false

/**
 * Sync contribution room fields across all accounts of the same type.
 * When a synced field changes on one account, propagate to all accounts of the same type.
 */
export const syncContributionRoomFields = (
  accounts: AccountInput[],
  payload: AccountUpdatePayload,
): AccountInput[] => {
  const updatedAccount = accounts.find((acc) => acc.id === payload.id)
  if (!updatedAccount) {
    return accounts
  }

  const accountType = updatedAccount.accountType
  if (!isTaxAdvantagedAccount(accountType)) {
    return accounts
  }

  const changedSyncFields = Object.keys(payload.changes).filter((key) =>
    isSyncedField(accountType, key as keyof AccountInput),
  ) as (keyof AccountInput)[]

  if (changedSyncFields.length === 0) {
    return accounts
  }

  const syncValues: Record<string, unknown> = {}
  for (const field of changedSyncFields) {
    const value = payload.changes[field]
    if (value !== undefined) {
      // Validate negative values for contribution room fields
      if (field === 'contributionRoom' && typeof value === 'number' && value < 0) {
        syncValues[field] = 0
      } else if (field === 'fhsaLifetimeContributions' && typeof value === 'number' && value < 0) {
        syncValues[field] = 0
      } else if (field === 'annualIncomeForRrsp' && typeof value === 'number' && value < 0) {
        syncValues[field] = 0
      } else if (field === 'customAnnualRoomIncrease' && typeof value === 'number' && value < 0) {
        syncValues[field] = 0
      } else {
        syncValues[field] = value
      }
    }
  }

  return accounts.map((account) => {
    if (account.accountType !== accountType || account.id === payload.id) {
      return account
    }
    return { ...account, ...syncValues as Partial<AccountInput> }
  })
}
