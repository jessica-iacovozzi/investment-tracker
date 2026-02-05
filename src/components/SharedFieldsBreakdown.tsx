import type { AccountInput, AccountType } from '../types/investment'
import { formatCurrency } from '../utils/formatters'
import { getSharedFieldLabel, getSyncedFieldsForType } from '../utils/sharedContributionRoom'

type SharedFieldsBreakdownProps = {
  accountType: AccountType
  accounts: AccountInput[]
  className?: string
}

/**
 * Component to display a breakdown of shared field values across accounts.
 * Shows which fields are being shared and their current values.
 */
export default function SharedFieldsBreakdown({
  accountType,
  accounts,
  className = '',
}: SharedFieldsBreakdownProps) {
  const syncedFields = getSyncedFieldsForType(accountType)
  
  if (syncedFields.length === 0 || accounts.length <= 1) {
    return null
  }

  // Get the most recent account for field values
  const mostRecentAccount = accounts[accounts.length - 1]

  const fieldItems = syncedFields
    .map((field) => {
      const value = mostRecentAccount[field]
      const label = getSharedFieldLabel(field)
      
      if (!label || value === undefined || value === null) {
        return null
      }

      return {
        field,
        label,
        value: typeof value === 'number' ? formatCurrency(value) : String(value),
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (fieldItems.length === 0) {
    return null
  }

  return (
    <div className={`shared-fields-breakdown ${className}`}>
      <h5 className="shared-fields-breakdown__title">Shared field values</h5>
      <dl className="shared-fields-breakdown__list">
        {fieldItems.map((item) => (
          <div key={item.field} className="shared-fields-breakdown__item">
            <dt className="shared-fields-breakdown__label">{item.label}</dt>
            <dd className="shared-fields-breakdown__value">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
