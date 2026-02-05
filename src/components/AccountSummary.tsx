import type { AccountType, ProjectionTotals, AccountTypeContributionSummary } from '../types/investment'
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
  accountType?: AccountType
  contributionRoomResult?: ContributionRoomResult
  fhsaLifetimeContributions?: number
  aggregatedSummary?: AccountTypeContributionSummary
  thisAccountContributions?: number
  sameTypeAccountCount?: number
}

function AccountSummary({
  totals,
  currentAge,
  termYears,
  inflationEnabled,
  accountType,
  contributionRoomResult,
  fhsaLifetimeContributions,
  aggregatedSummary,
  thisAccountContributions,
  sameTypeAccountCount,
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

  const hasMultipleSameTypeAccounts = (sameTypeAccountCount ?? 0) > 1
  const accountTypeLabel = accountType?.toUpperCase() ?? ''

  const contributionRoomItems = showContributionRoomSection
    ? [
        {
          label: 'Shared contribution room',
          value: formatCurrency(aggregatedSummary?.sharedContributionRoom ?? 0),
        },
        ...(aggregatedSummary && aggregatedSummary.remainingRoom !== -1
          ? [
              {
                label: 'Available room (with annual increases)',
                value: formatCurrency((aggregatedSummary.remainingRoom ?? 0) + (aggregatedSummary.totalProjectedContributions ?? 0)),
              },
            ]
          : contributionRoomResult.availableRoom !== -1
            ? [
                {
                  label: 'Available room (with annual increases)',
                  value: formatCurrency(contributionRoomResult.availableRoom),
                },
              ]
            : []),
        ...(hasMultipleSameTypeAccounts && thisAccountContributions !== undefined
          ? [
              {
                label: 'This account\'s contributions',
                value: formatCurrency(thisAccountContributions),
              },
            ]
          : []),
        ...(hasMultipleSameTypeAccounts && aggregatedSummary
          ? [
              {
                label: `All ${accountTypeLabel} contributions`,
                value: formatCurrency(aggregatedSummary.totalProjectedContributions),
              },
            ]
          : []),
        ...(aggregatedSummary && aggregatedSummary.remainingRoom !== -1
          ? [
              {
                label: 'Remaining shared room',
                value: formatCurrency(aggregatedSummary.remainingRoom),
                isNegative: aggregatedSummary.remainingRoom < 0,
              },
            ]
          : contributionRoomResult.remainingRoom !== -1
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
          <h4 className="summary-card__subtitle">
            Contribution Room
            {hasMultipleSameTypeAccounts && (
              <span className="summary-card__shared-indicator">
                {' '}(shared across {sameTypeAccountCount} {accountTypeLabel} accounts)
              </span>
            )}
          </h4>
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
          {(aggregatedSummary?.isOverContributing || contributionRoomResult.overContributionDetails.exceedsRoom) && (
            <ContributionRoomWarning
              overContributionDetails={aggregatedSummary?.overContributionDetails ?? contributionRoomResult.overContributionDetails}
              accountType={accountType}
              accountCount={sameTypeAccountCount}
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
