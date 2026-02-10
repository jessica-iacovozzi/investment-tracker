import type {
  AccountInput,
  AccountType,
  AccountTypeContributionSummary,
  AccountUpdatePayload,
  OverContributionDetails,
} from '../types/investment'
import { isTaxAdvantagedAccount } from '../constants/accountTypes'
import {
  getAnnualContributionRoomLimits,
  getAnnualProjectedContributions,
  calculateTotalProjectedContributions,
  calculateAvailableRoom,
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
 * This is the source of truth for shared field values across accounts of the same type.
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

const getCombinedAnnualProjectedContributions = (
  accounts: AccountInput[],
  termYears: number,
): number[] => {
  if (termYears <= 0) {
    return []
  }

  const totals = Array.from({ length: termYears }, () => 0)
  accounts.forEach((account) => {
    const annualContributions = getAnnualProjectedContributions(account, termYears)
    annualContributions.forEach((amount, index) => {
      totals[index] = Math.round((totals[index] + amount) * 100) / 100
    })
  })

  return totals
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
  termYears: number,
): number => {
  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  if (sameTypeAccounts.length === 0) {
    // Return -1 for non-registered accounts (unlimited room), 0 for others
    return accountType === 'non-registered' ? -1 : 0
  }

  // Get shared field values from most recent account
  const mostRecentAccount = getMostRecentAccountByType(accounts, accountType)
  const seedValues = mostRecentAccount ? getSharedFieldSeedValues(accounts, accountType, {
    excludeAccountId: mostRecentAccount.id,
  }) : {}

  const baseAccount = { ...sameTypeAccounts[0], ...seedValues }
  
  // For tax-advantaged accounts, if no contribution room is defined, return 0
  // Non-registered accounts have unlimited room (-1)
  if (accountType !== 'non-registered' && (baseAccount.contributionRoom === undefined || baseAccount.contributionRoom === null)) {
    return 0
  }
  
  const availableRoom = calculateAvailableRoom(baseAccount, termYears)
  return availableRoom === Infinity ? -1 : availableRoom
}

/**
 * Calculate shared over-contribution details for an account type.
 */
const getSharedOverContributionDetails = (
  accounts: AccountInput[],
  accountType: AccountType,
  termYears: number,
): OverContributionDetails => {
  if (!isTaxAdvantagedAccount(accountType)) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  if (sameTypeAccounts.length === 0) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const mostRecentAccount = getMostRecentAccountByType(accounts, accountType)
  const seedValues = mostRecentAccount
    ? getSharedFieldSeedValues(accounts, accountType, {
        excludeAccountId: mostRecentAccount.id,
      })
    : {}
  const baseAccount = { ...sameTypeAccounts[0], ...seedValues }
  const annualRooms = getAnnualContributionRoomLimits(baseAccount, termYears)

  if (annualRooms.length === 0) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const annualTotals = getCombinedAnnualProjectedContributions(
    sameTypeAccounts,
    annualRooms.length,
  )
  let cumulativeRoom = 0
  let cumulativeContributions = 0
  const overYearIndex = annualTotals.findIndex((amount, index) => {
    cumulativeRoom += annualRooms[index] ?? 0
    cumulativeContributions += amount
    return cumulativeContributions > cumulativeRoom
  })

  if (overYearIndex === -1) {
    return { exceedsRoom: false, excessAmount: 0 }
  }

  const excessAmount = Math.round(
    (annualTotals[overYearIndex] - (annualRooms[overYearIndex] ?? 0)) * 100,
  ) / 100

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
  termYears: number,
): AccountTypeContributionSummary => {
  const sameTypeAccounts = getAccountsByType(accounts, accountType)
  const sharedContributionRoom = getSharedContributionRoom(sameTypeAccounts, accountType)
  const totalProjectedContributions = getCombinedProjectedContributions(
    sameTypeAccounts,
    accountType,
  )
  const availableRoom = getSharedAvailableRoom(sameTypeAccounts, accountType, termYears)
  const remainingRoom =
    availableRoom === -1
      ? -1
      : Math.round((availableRoom - totalProjectedContributions) * 100) / 100

  const overContributionDetails = getSharedOverContributionDetails(
    sameTypeAccounts,
    accountType,
    termYears,
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
 * 
 * Sync Strategy:
 * 1. Identify which fields changed and are configured for syncing
 * 2. Validate and sanitize values (e.g., prevent negative contribution room)
 * 3. Apply changes to all other accounts of the same type
 * 4. Preserve the original account's values (don't sync back to self)
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

  const syncValues: Partial<AccountInput> = {}
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        syncValues[field] = value as any
      }
    }
  }

  return accounts.map((account) => {
    if (account.accountType !== accountType || account.id === payload.id) {
      return account
    }
    return { ...account, ...syncValues }
  })
}

/**
 * Field configuration for shared indicators.
 */
const SHARED_FIELD_CONFIG: {
  [K in keyof AccountInput]?: { label: string; description: string }
} = {
  contributionRoom: {
    label: 'Contribution room',
    description: 'Available contribution room is shared across all accounts of this type',
  },
  customAnnualRoomIncrease: {
    label: 'Annual room increase',
    description: 'Custom annual increase amount is shared across all TFSA accounts',
  },
  annualIncomeForRrsp: {
    label: 'Annual income',
    description: 'Annual income for RRSP calculation is shared across all RRSP accounts',
  },
  fhsaLifetimeContributions: {
    label: 'Lifetime contributions',
    description: 'Lifetime FHSA contributions are tracked across all FHSA accounts',
  },
}

/**
 * Get the display label for a shared field.
 */
export const getSharedFieldLabel = (field: keyof AccountInput): string => {
  return SHARED_FIELD_CONFIG[field]?.label || ''
}

/**
 * Get the description for a shared field.
 */
export const getSharedFieldDescription = (field: keyof AccountInput): string => {
  return SHARED_FIELD_CONFIG[field]?.description || ''
}

/**
 * Generate the complete shared indicator message for a field.
 */
export const getFieldSharedMessage = (
  field: keyof AccountInput,
  accountType: AccountType,
  accountCount: number,
): string | null => {
  const config = SHARED_FIELD_CONFIG[field]
  if (!config || !config.label) {
    return null
  }

  const accountTypeLabel = accountType.toUpperCase()
  if (accountCount <= 1) {
    return null
  }

  return `Shared across ${accountCount} ${accountTypeLabel} accounts`
}
