import type { AccountAllocation } from '../types/goal'
import { formatCurrency } from '../utils/formatters'

type AllocationSuggestionsProps = {
  allocations: AccountAllocation[]
  frequency: string
}

function AllocationSuggestions({
  allocations,
  frequency,
}: AllocationSuggestionsProps) {
  if (allocations.length === 0) {
    return null
  }

  const totalContribution = allocations.reduce(
    (sum, a) => sum + a.suggestedContribution,
    0,
  )

  const frequencyLabel =
    frequency === 'bi-weekly'
      ? 'bi-week'
      : frequency === 'annually'
        ? 'year'
        : frequency.replace('ly', '')

  return (
    <div className="allocation-suggestions">
      <h3 className="allocation-suggestions__title">
        Suggested Allocation
        <span className="allocation-suggestions__info" title="Contributions are distributed proportionally based on each account's current balance relative to your total portfolio.">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="sr-only">Info: Contributions are distributed proportionally based on each account's current balance.</span>
        </span>
      </h3>
      <p className="allocation-suggestions__subtitle">
        Distribute {formatCurrency(totalContribution)}/{frequencyLabel} across
        your accounts
      </p>

      <ul className="allocation-suggestions__list" role="list">
        {allocations.map((allocation) => (
          <li
            key={allocation.accountId}
            className="allocation-suggestions__item"
          >
            <div className="allocation-suggestions__account">
              <span className="allocation-suggestions__account-name">
                {allocation.accountName}
              </span>
              <span className="allocation-suggestions__account-rate">
                {allocation.annualRatePercent}% APY
              </span>
            </div>
            <div className="allocation-suggestions__contribution">
              <span className="allocation-suggestions__amount">
                {formatCurrency(allocation.suggestedContribution)}
              </span>
              <span className="allocation-suggestions__frequency">
                /{frequencyLabel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AllocationSuggestions
