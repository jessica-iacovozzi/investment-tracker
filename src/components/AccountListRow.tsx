import { useMemo } from 'react'
import type { AccountInput, AccountUpdatePayload, AccountTypeContributionSummary } from '../types/investment'
import type { InflationState } from '../types/inflation'
import { buildProjection } from '../utils/projections'
import { applyInflationToProjection } from '../utils/inflation'
import { formatCurrency } from '../utils/formatters'
import { getContributionRoomResult, calculateTotalProjectedContributions } from '../utils/contributionRoom'
import { isTaxAdvantagedAccount } from '../constants/accountTypes'
import { ACCOUNT_TYPE_LABELS } from '../constants/accountTypes'
import { getAggregatedContributionSummary, getAccountsByType } from '../utils/sharedContributionRoom'
import { adjustContributionRange, normalizeContributionTiming } from '../utils/accountCardHelpers'
import AccountChart from './AccountChart'
import AccountForm from './AccountForm'
import AccountSummary from './AccountSummary'

type AccountListRowProps = {
  account: AccountInput
  allAccounts: AccountInput[]
  currentAge?: number
  inflationState: InflationState
  isExpanded: boolean
  onToggle: (id: string) => void
  onUpdate: (payload: AccountUpdatePayload) => void
  onDelete: (id: string) => void
}

/**
 * Compact list row for a single account. Shows key metrics in collapsed state.
 * When expanded, renders the full AccountForm, AccountSummary, and AccountChart.
 */
function AccountListRow({
  account,
  allAccounts,
  currentAge,
  inflationState,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
}: AccountListRowProps) {
  const projection = useMemo(() => {
    try {
      const baseProjection = buildProjection(account)
      if (inflationState.isEnabled) {
        return applyInflationToProjection(
          baseProjection,
          inflationState.annualRatePercent,
          account.termYears,
        )
      }
      return baseProjection
    } catch {
      return null
    }
  }, [account, inflationState])

  const contributionRoomResult = useMemo(() => {
    if (!isTaxAdvantagedAccount(account.accountType)) {
      return undefined
    }
    return getContributionRoomResult(account)
  }, [account])

  const aggregatedSummary: AccountTypeContributionSummary | undefined = useMemo(() => {
    if (!isTaxAdvantagedAccount(account.accountType)) {
      return undefined
    }
    return getAggregatedContributionSummary(allAccounts, account.accountType)
  }, [allAccounts, account.accountType])

  const thisAccountContributions = useMemo(() => {
    return calculateTotalProjectedContributions(account)
  }, [account])

  const sameTypeAccountCount = useMemo(() => {
    return getAccountsByType(allAccounts, account.accountType).length
  }, [allAccounts, account.accountType])

  const handleUpdate = (payload: AccountUpdatePayload) => {
    const adjustedPayload = adjustContributionRange(account, payload)
    const normalizedPayload = normalizeContributionTiming(account, adjustedPayload)
    onUpdate(normalizedPayload)
  }

  const handleDelete = () => {
    const shouldDelete = window.confirm(
      `Delete ${account.name}? This cannot be undone.`,
    )
    if (!shouldDelete) {
      return
    }
    onDelete(account.id)
  }

  const principalDisplay = formatCurrency(account.principal)
  const typeLabel = ACCOUNT_TYPE_LABELS[account.accountType]

  const balanceValue = projection
    ? inflationState.isEnabled && projection.totals.realFinalBalance !== undefined
      ? projection.totals.realFinalBalance
      : projection.totals.finalBalance
    : 0

  const returnsValue = projection
    ? inflationState.isEnabled && projection.totals.realTotalReturns !== undefined
      ? projection.totals.realTotalReturns
      : projection.totals.totalReturns
    : 0

  return (
    <div
      className={`account-list-row${isExpanded ? ' account-list-row--expanded' : ''}`}
      aria-label={`${account.name} account`}
    >
      <button
        className="account-list-row__header"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => onToggle(account.id)}
      >
        <span className="account-list-row__name">{account.name}</span>
        <span className="account-list-row__type-badge">{typeLabel}</span>
        <span className="account-list-row__metric">
          <span className="account-list-row__metric-label">Principal</span>
          <span className="account-list-row__metric-value">{principalDisplay}</span>
        </span>
        <span className="account-list-row__metric">
          <span className="account-list-row__metric-label">Projected</span>
          <span className="account-list-row__metric-value">
            {projection ? formatCurrency(balanceValue) : 'Error'}
          </span>
        </span>
        <span className="account-list-row__metric">
          <span className="account-list-row__metric-label">Returns</span>
          <span className="account-list-row__metric-value">
            {projection ? formatCurrency(returnsValue) : 'Error'}
          </span>
        </span>
        <span className="account-list-row__chevron" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="account-list-row__detail" role="region" aria-label={`${account.name} details`}>
          <div className="account-list-row__detail-actions">
            <button
              className="button button--danger"
              type="button"
              onClick={handleDelete}
              aria-label={`Delete ${account.name} account`}
            >
              Delete
            </button>
          </div>

          {projection ? (
            <div className="account-list-row__detail-content">
              <AccountForm
                account={account}
                onUpdate={handleUpdate}
                sameTypeAccountCount={sameTypeAccountCount}
                allAccounts={allAccounts}
              />
              <AccountSummary
                totals={projection.totals}
                currentAge={currentAge}
                termYears={account.termYears}
                inflationEnabled={inflationState.isEnabled}
                accountType={account.accountType}
                contributionRoomResult={contributionRoomResult}
                fhsaLifetimeContributions={account.fhsaLifetimeContributions}
                aggregatedSummary={aggregatedSummary}
                thisAccountContributions={thisAccountContributions}
                sameTypeAccountCount={sameTypeAccountCount}
                allAccounts={allAccounts}
              />
              <AccountChart
                data={projection.points}
                inflationEnabled={inflationState.isEnabled}
              />
            </div>
          ) : (
            <p className="account-list-row__error">
              Unable to compute projection for this account.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountListRow
