import { useMemo } from 'react'
import type { AccountInput, AccountUpdatePayload } from '../types/investment'
import { buildProjection } from '../utils/projections'
import { normalizeTimingForFrequency } from '../utils/contributionTiming'
import AccountChart from './AccountChart'
import AccountForm from './AccountForm'
import AccountSummary from './AccountSummary'

type AccountCardProps = {
  account: AccountInput
  currentAge?: number
  onUpdate: (payload: AccountUpdatePayload) => void
  onDelete: (id: string) => void
}

const clampMonth = (value: number, maxMonth: number) =>
  Math.min(Math.max(value, 1), maxMonth)

const adjustContributionRange = (
  account: AccountInput,
  payload: AccountUpdatePayload,
): AccountUpdatePayload => {
  if (!payload.changes.termYears || !account.contribution) {
    return payload
  }

  const previousTotalMonths = Math.max(Math.round(account.termYears * 12), 1)
  const totalMonths = Math.max(Math.round(payload.changes.termYears * 12), 1)
  const startMonth = clampMonth(account.contribution.startMonth, totalMonths)
  const shouldExtendEndMonth =
    totalMonths > previousTotalMonths &&
    account.contribution.endMonth === previousTotalMonths
  const endMonthBase = shouldExtendEndMonth
    ? totalMonths
    : account.contribution.endMonth
  const endMonth = clampMonth(
    Math.max(endMonthBase, startMonth),
    totalMonths,
  )

  return {
    ...payload,
    changes: {
      ...payload.changes,
      contribution: {
        ...account.contribution,
        startMonth,
        endMonth,
      },
    },
  }
}

const normalizeContributionTiming = (
  account: AccountInput,
  payload: AccountUpdatePayload,
): AccountUpdatePayload => {
  const nextContribution = payload.changes.contribution ?? account.contribution
  if (!nextContribution) {
    return payload
  }

  const nextTiming = payload.changes.contributionTiming ?? account.contributionTiming
  const normalizedTiming = normalizeTimingForFrequency({
    timing: nextTiming,
    frequency: nextContribution.frequency,
  })

  if (normalizedTiming === nextTiming) {
    return payload
  }

  return {
    ...payload,
    changes: {
      ...payload.changes,
      contributionTiming: normalizedTiming,
    },
  }
}

function AccountCard({ account, currentAge, onUpdate, onDelete }: AccountCardProps) {
  const projection = useMemo(() => buildProjection(account), [account])

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
        <AccountForm account={account} onUpdate={handleUpdate} />
        <AccountSummary
          totals={projection.totals}
          currentAge={currentAge}
          termYears={account.termYears}
        />
        <AccountChart data={projection.points} />
      </div>
    </section>
  )
}

export default AccountCard
