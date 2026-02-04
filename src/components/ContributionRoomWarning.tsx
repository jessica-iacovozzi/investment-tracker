import type { OverContributionDetails } from '../utils/contributionRoom'

type ContributionRoomWarningProps = {
  overContributionDetails: OverContributionDetails
  accountType: string
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const getMonthName = (month: number): string => {
  const date = new Date(2024, month - 1)
  return date.toLocaleString('en-CA', { month: 'long' })
}

function ContributionRoomWarning({
  overContributionDetails,
  accountType,
}: ContributionRoomWarningProps) {
  const {
    exceedsRoom,
    excessAmount,
    yearOfOverContribution,
    monthOfOverContribution,
    estimatedPenalty,
  } = overContributionDetails

  if (!exceedsRoom) {
    return null
  }

  const timingText =
    yearOfOverContribution && monthOfOverContribution
      ? `in ${getMonthName(monthOfOverContribution)} of year ${yearOfOverContribution}`
      : ''

  return (
    <div
      className="contribution-room-warning"
      role="alert"
      aria-live="polite"
    >
      <div className="contribution-room-warning__icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className="contribution-room-warning__content">
        <p className="contribution-room-warning__title">
          Over-contribution warning
        </p>
        <p className="contribution-room-warning__message">
          Your projected contributions exceed your {accountType.toUpperCase()} contribution room by{' '}
          <strong>{formatCurrency(excessAmount)}</strong>
          {timingText && ` starting ${timingText}`}.
        </p>
        {estimatedPenalty !== undefined && estimatedPenalty > 0 && (
          <p className="contribution-room-warning__penalty">
            Estimated CRA penalty: <strong>{formatCurrency(estimatedPenalty)}</strong>{' '}
            (1% per month on excess amount)
          </p>
        )}
      </div>
    </div>
  )
}

export default ContributionRoomWarning
