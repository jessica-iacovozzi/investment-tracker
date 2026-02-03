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

  const totalAdditional = Math.round(
    allocations.reduce((sum, a) => sum + a.additionalContribution, 0) * 100
  ) / 100

  const FREQUENCY_LABELS: Record<string, string> = {
    'bi-weekly': 'bi-week',
    monthly: 'month',
    quarterly: 'quarter',
    annually: 'year',
  }
  const frequencyLabel = FREQUENCY_LABELS[frequency] || frequency

  const hasAdditionalNeeded = totalAdditional > 0

  return (
    <div className="allocation-suggestions">
      <h3 className="allocation-suggestions__title">
        {hasAdditionalNeeded ? 'Additional Contributions Needed' : 'You\'re On Track!'}
        <span className="allocation-suggestions__info" title="Shows how much MORE you need to contribute to each account beyond your current settings to reach your goal.">
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
          <span className="sr-only">Info: Shows additional contributions needed beyond current settings.</span>
        </span>
      </h3>
      <p className="allocation-suggestions__subtitle">
        {hasAdditionalNeeded
          ? `Increase contributions by ${formatCurrency(totalAdditional)}/${frequencyLabel} total`
          : 'Your current contributions meet or exceed the goal requirements'}
      </p>

      <ul className="allocation-suggestions__list" role="list">
        {allocations.map((allocation) => (
          <li
            key={allocation.accountId}
            className={`allocation-suggestions__item ${
              allocation.additionalContribution === 0
                ? 'allocation-suggestions__item--on-track'
                : ''
            } ${allocation.isLockedIn ? 'allocation-suggestions__item--locked' : ''}`}
          >
            <div className="allocation-suggestions__account">
              <span className="allocation-suggestions__account-name">
                {allocation.accountName}
                {allocation.isLockedIn && (
                  <span className="allocation-suggestions__locked-badge" title="Locked-in account - no additional contributions allowed">
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
                      aria-hidden="true"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
              </span>
              <span className="allocation-suggestions__account-rate">
                Current: {formatCurrency(allocation.currentContribution)}/{frequencyLabel}
              </span>
            </div>
            <div className="allocation-suggestions__contribution">
              {allocation.isLockedIn ? (
                <span className="allocation-suggestions__locked">Locked</span>
              ) : allocation.additionalContribution > 0 ? (
                <>
                  <span className="allocation-suggestions__amount allocation-suggestions__amount--additional">
                    +{formatCurrency(allocation.additionalContribution)}
                  </span>
                  <span className="allocation-suggestions__frequency">
                    /{frequencyLabel}
                  </span>
                </>
              ) : (
                <span className="allocation-suggestions__on-track">✓ On track</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AllocationSuggestions
