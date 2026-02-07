import { useMemo } from 'react'
import type { AccountInput, AccountUpdatePayload, AccountTypeContributionSummary } from '../types/investment'
import type { InflationState } from '../types/inflation'
import { buildProjection } from '../utils/projections'
import { applyInflationToProjection } from '../utils/inflation'
import { getContributionRoomResult, calculateTotalProjectedContributions } from '../utils/contributionRoom'
import { isTaxAdvantagedAccount } from '../constants/accountTypes'
import { getAggregatedContributionSummary, getAccountsByType } from '../utils/sharedContributionRoom'
import { normalizeContributionTiming } from '../utils/accountCardHelpers'
import AccountChart from './AccountChart'
import AccountForm from './AccountForm'
import AccountSummary from './AccountSummary'

type AccountCardProps = {
  account: AccountInput
  allAccounts: AccountInput[]
  termYears: number
  currentAge?: number
  inflationState: InflationState
  onUpdate: (payload: AccountUpdatePayload) => void
  onDelete: (id: string) => void
}

function AccountCard({ account, allAccounts, termYears, currentAge, inflationState, onUpdate, onDelete }: AccountCardProps) {
  const projection = useMemo(() => {
    const baseProjection = buildProjection(account, termYears)
    if (inflationState.isEnabled) {
      return applyInflationToProjection(
        baseProjection,
        inflationState.annualRatePercent,
        termYears,
      )
    }
    return baseProjection
  }, [account, termYears, inflationState])

  const contributionRoomResult = useMemo(() => {
    if (!isTaxAdvantagedAccount(account.accountType)) {
      return undefined
    }
    return getContributionRoomResult(account, termYears)
  }, [account, termYears])

  const aggregatedSummary: AccountTypeContributionSummary | undefined = useMemo(() => {
    if (!isTaxAdvantagedAccount(account.accountType)) {
      return undefined
    }
    return getAggregatedContributionSummary(allAccounts, account.accountType, termYears)
  }, [allAccounts, account.accountType, termYears])

  const thisAccountContributions = useMemo(() => {
    return calculateTotalProjectedContributions(account)
  }, [account])

  const sameTypeAccountCount = useMemo(() => {
    return getAccountsByType(allAccounts, account.accountType).length
  }, [allAccounts, account.accountType])

  const handleUpdate = (payload: AccountUpdatePayload) => {
    const normalizedPayload = normalizeContributionTiming(account, payload)
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

  return (
    <section className="account-card" aria-label={`${account.name} account`}>
      <div className="account-card__header">
        <h2 className="account-card__title">{account.name}</h2>
        <div className="account-card__actions">
          <button
            className="button button--danger"
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${account.name} account`}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="account-card__content">
        <AccountForm
          account={account}
          termYears={termYears}
          onUpdate={handleUpdate}
          sameTypeAccountCount={sameTypeAccountCount}
          allAccounts={allAccounts}
        />
        <AccountSummary
          totals={projection.totals}
          currentAge={currentAge}
          termYears={termYears}
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
    </section>
  )
}

export default AccountCard
