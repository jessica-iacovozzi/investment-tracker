import type { AccountType, ProjectionTotals } from '../types/investment'
import type { ContributionRoomResult } from '../utils/contributionRoom'
import { getFinalAgeLabel } from '../utils/ageLabel'
import { formatCurrency } from '../utils/formatters'
import { isTaxAdvantagedAccount, FHSA_LIFETIME_LIMIT } from '../constants/accountTypes'
import ContributionRoomWarning from './ContributionRoomWarning'

type AccountSummaryProps = {
  totals: ProjectionTotals
  currentAge?: number
  termYears: number
  inflationEnabled?: boolean
  contributionRoom?: number
  accountType?: AccountType
  contributionRoomResult?: ContributionRoomResult
  fhsaLifetimeContributions?: number
}

function AccountSummary({
  totals,
  currentAge,
  termYears,
  inflationEnabled,
  contributionRoom,
  accountType,
  contributionRoomResult,
  fhsaLifetimeContributions,
}: AccountSummaryProps) {
  const finalValueLabel = getFinalAgeLabel({ currentAge, termYears })
  const suffix = inflationEnabled ? " (today's $)" : ''

  const contributionsValue =
    inflationEnabled && totals.realTotalContributions !== undefined
      ? totals.realTotalContributions
      : totals.totalContributions

  const returnsValue =
    inflationEnabled && totals.realTotalReturns !== undefined
      ? totals.realTotalReturns
      : totals.totalReturns

  const balanceValue =
    inflationEnabled && totals.realFinalBalance !== undefined
      ? totals.realFinalBalance
      : totals.finalBalance

  const showContributionRoomSection =
    accountType && isTaxAdvantagedAccount(accountType) && contributionRoomResult

  const contributionRoomItems = showContributionRoomSection
    ? [
        {
          label: 'Current contribution room',
          value: formatCurrency(contributionRoom ?? 0),
        },
        ...(contributionRoomResult.availableRoom !== -1
          ? [
              {
                label: 'Available room (with annual increases)',
                value: formatCurrency(contributionRoomResult.availableRoom),
              },
            ]
          : []),
        ...(contributionRoomResult.remainingRoom !== -1
          ? [
              {
                label: 'Remaining room after contributions',
                value: formatCurrency(contributionRoomResult.remainingRoom),
                isNegative: contributionRoomResult.remainingRoom < 0,
              },
            ]
          : []),
        ...(accountType === 'fhsa'
          ? [
              {
                label: 'FHSA lifetime progress',
                value: `${formatCurrency(fhsaLifetimeContributions ?? 0)} of ${formatCurrency(FHSA_LIFETIME_LIMIT)}`,
              },
            ]
          : []),
      ]
    : []

  const projectionItems = [
    {
      label: `Total contributions${suffix}`,
      value: formatCurrency(contributionsValue),
    },
    {
      label: `Total returns${suffix}`,
      value: formatCurrency(returnsValue),
    },
    {
      label: `${finalValueLabel}${suffix}`,
      value: formatCurrency(balanceValue),
    },
  ]

  return (
    <section className="summary-card" aria-label="Projection summary">
      <h3 className="summary-card__title">Projection summary</h3>

      {showContributionRoomSection && (
        <>
          <h4 className="summary-card__subtitle">Contribution Room</h4>
          <dl className="summary-card__list">
            {contributionRoomItems.map((item) => (
              <div
                key={item.label}
                className={`summary-card__item ${
                  'isNegative' in item && item.isNegative
                    ? 'summary-card__item--negative'
                    : ''
                }`}
              >
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          {contributionRoomResult.overContributionDetails.exceedsRoom && (
            <ContributionRoomWarning
              overContributionDetails={contributionRoomResult.overContributionDetails}
              accountType={accountType}
            />
          )}
        </>
      )}

      <h4 className="summary-card__subtitle">Projections</h4>
      <dl className="summary-card__list">
        {projectionItems.map((item) => (
          <div key={item.label} className="summary-card__item">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default AccountSummary
