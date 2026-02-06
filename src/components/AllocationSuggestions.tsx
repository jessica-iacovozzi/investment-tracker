import type { AccountAllocation } from '../types/goal'
import { formatCurrency } from '../utils/formatters'

type AllocationSuggestionsProps = {
  allocations: AccountAllocation[]
  frequency: string
}

const roundToCents = (value: number): number => Math.round(value * 100) / 100

const buildDisplayIncreases = (
  allocations: AccountAllocation[],
  totalNetIncrease: number,
): Record<string, number> => {
  if (totalNetIncrease <= 0) {
    return {}
  }

  const positiveAllocations = allocations.filter(
    (allocation) =>
      !allocation.isLockedIn && allocation.suggestedContribution > allocation.currentContribution,
  )
  const totalPositive = positiveAllocations.reduce(
    (sum, allocation) => sum + allocation.suggestedContribution - allocation.currentContribution,
    0,
  )

  if (totalPositive <= 0) {
    return {}
  }

  const scaleFactor = totalNetIncrease / totalPositive
  let remainingIncrease = totalNetIncrease

  return positiveAllocations.reduce<Record<string, number>>((acc, allocation, index) => {
    const rawIncrease = allocation.suggestedContribution - allocation.currentContribution
    const scaledIncrease =
      index === positiveAllocations.length - 1
        ? remainingIncrease
        : roundToCents(rawIncrease * scaleFactor)
    const roundedIncrease = roundToCents(scaledIncrease)
    acc[allocation.accountId] = roundedIncrease
    remainingIncrease = roundToCents(remainingIncrease - roundedIncrease)
    return acc
  }, {})
}

function AllocationSuggestions({
  allocations,
  frequency,
}: AllocationSuggestionsProps) {
  if (allocations.length === 0) {
    return null
  }

  const visibleAllocations = allocations.filter(
    (allocation) => !allocation.contributionRoomExceeded,
  )

  if (visibleAllocations.length === 0) {
    return null
  }

  const totalNetIncrease = roundToCents(
    visibleAllocations.reduce(
      (sum, allocation) => sum + allocation.suggestedContribution - allocation.currentContribution,
      0,
    ),
  )

  const FREQUENCY_LABELS: Record<string, string> = {
    'bi-weekly': 'bi-week',
    monthly: 'month',
    quarterly: 'quarter',
    annually: 'year',
  }
  const frequencyLabel = FREQUENCY_LABELS[frequency] || frequency

  const hasAdditionalNeeded = totalNetIncrease > 0
  const displayIncreases = buildDisplayIncreases(visibleAllocations, totalNetIncrease)

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
          ? `Increase contributions by ${formatCurrency(totalNetIncrease)}/${frequencyLabel} total`
          : 'Your current contributions meet or exceed the goal requirements'}
      </p>

      <ul className="allocation-suggestions__list" role="list">
        {visibleAllocations.map((allocation) => {
          const displayIncrease = displayIncreases[allocation.accountId] ?? 0
          const isOnTrack = displayIncrease === 0

          return (
            <li
              key={allocation.accountId}
              className={`allocation-suggestions__item ${
                isOnTrack ? 'allocation-suggestions__item--on-track' : ''
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
              ) : displayIncrease > 0 ? (
                <>
                  <span className="allocation-suggestions__amount allocation-suggestions__amount--additional">
                    +{formatCurrency(displayIncrease)}
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
          )
        })}
      </ul>
    </div>
  )
}

export default AllocationSuggestions
