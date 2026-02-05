import type { AccountType } from '../types/investment'
import {
  getFieldSharedMessage,
  getSharedFieldDescription,
} from '../utils/sharedContributionRoom'

type SharedFieldIndicatorProps = {
  field: keyof import('../types/investment').AccountInput
  accountType: AccountType
  accountCount: number
  className?: string
  inputId?: string
}

/**
 * Component to display shared field indicators with proper accessibility.
 * Shows when a field value is shared across multiple accounts of the same type.
 */
export default function SharedFieldIndicator({
  field,
  accountType,
  accountCount,
  className = '',
  inputId,
}: SharedFieldIndicatorProps) {
  const message = getFieldSharedMessage(field, accountType, accountCount)
  const description = getSharedFieldDescription(field)

  if (!message || accountCount <= 1) {
    return null
  }

  const id = inputId ? `${inputId}-shared` : undefined

  return (
    <div className={`field-hint field-hint--shared ${className}`} id={id}>
      <span className="field-hint__icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
      <span className="field-hint__text" title={description}>
        {message}
      </span>
    </div>
  )
}
