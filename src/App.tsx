import { useEffect, useMemo, useState } from 'react'
import AccountCard from './components/AccountCard'
import ShareFooter from './components/ShareFooter'
import {
  DEFAULT_COMPOUNDING_FREQUENCY,
  DEFAULT_CONTRIBUTION_TIMING,
} from './constants/compounding'
import { normalizeAccount } from './utils/accountNormalization'
import { formatCurrency } from './utils/formatters'
import { buildProjection } from './utils/projections'
import { isLocalStorageAvailable } from './utils/storage'
import type { AccountInput, AccountUpdatePayload } from './types/investment'
import './App.css'

const buildId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `account-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

const buildNewAccount = (index: number): AccountInput => {
  const termYears = 10
  const totalMonths = termYears * 12

  return {
    id: buildId(),
    name: `Account ${index}`,
    currentAge: 30,
    principal: 12000,
    annualRatePercent: 6.5,
    compoundingFrequency: DEFAULT_COMPOUNDING_FREQUENCY,
    termYears,
    contributionTiming: DEFAULT_CONTRIBUTION_TIMING,
    contribution: {
      amount: 250,
      frequency: 'monthly',
      startMonth: 1,
      endMonth: totalMonths,
    },
  }
}

const seedAccounts = (): AccountInput[] =>
  import.meta.env.PROD
    ? []
    : [
        {
          id: buildId(),
          name: 'Brokerage',
          currentAge: 30,
          principal: 18500,
          annualRatePercent: 7.2,
          compoundingFrequency: DEFAULT_COMPOUNDING_FREQUENCY,
          termYears: 12,
          contributionTiming: DEFAULT_CONTRIBUTION_TIMING,
          contribution: {
            amount: 300,
            frequency: 'monthly',
            startMonth: 1,
            endMonth: 144,
          },
        },
        {
          id: buildId(),
          name: 'Roth IRA',
          currentAge: 34,
          principal: 9200,
          annualRatePercent: 6.1,
          compoundingFrequency: DEFAULT_COMPOUNDING_FREQUENCY,
          termYears: 15,
          contributionTiming: DEFAULT_CONTRIBUTION_TIMING,
          contribution: {
            amount: 500,
            frequency: 'quarterly',
            startMonth: 1,
            endMonth: 180,
          },
        },
      ]

const normalizeAccounts = (accounts: AccountInput[]) =>
  accounts.map((account) => normalizeAccount({ account }).account)

const STORAGE_KEY = 'investment-tracker-accounts'

const loadAccounts = ({ storageAvailable }: { storageAvailable: boolean }) => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return normalizeAccounts(seedAccounts())
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY)
  if (!storedValue) {
    return normalizeAccounts(seedAccounts())
  }

  try {
    const parsed = JSON.parse(storedValue) as AccountInput[]
    if (!parsed.length) {
      return normalizeAccounts(seedAccounts())
    }

    return normalizeAccounts(parsed)
  } catch (error) {
    console.warn('Failed to load saved accounts.', error)
    return normalizeAccounts(seedAccounts())
  }
}

const saveAccounts = ({
  accounts,
  storageAvailable,
}: {
  accounts: AccountInput[]
  storageAvailable: boolean
}) => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  const normalizedAccounts = accounts.map(
    (account) => normalizeAccount({ account }).account,
  )
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedAccounts))
}

const clearAccounts = ({ storageAvailable }: { storageAvailable: boolean }) => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

const updateAccount = ({
  accounts,
  payload,
}: {
  accounts: AccountInput[]
  payload: AccountUpdatePayload
}) =>
  accounts.map((account) =>
    account.id === payload.id ? { ...account, ...payload.changes } : account,
  )

function App() {
  const [storageAvailable] = useState(isLocalStorageAvailable)
  const [accounts, setAccounts] = useState<AccountInput[]>(() =>
    loadAccounts({ storageAvailable }),
  )
  const hasAccounts = accounts.length > 0
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://personal-multi-investment-tracker.vercel.app/'

  useEffect(() => {
    saveAccounts({ accounts, storageAvailable })
  }, [accounts, storageAvailable])

  const handleAccountUpdate = (payload: AccountUpdatePayload) => {
    setAccounts((prev) => updateAccount({ accounts: prev, payload }))
  }

  const handleAddAccount = () => {
    setAccounts((prev) => [...prev, buildNewAccount(prev.length + 1)])
  }

  const handleResetAccounts = () => {
    const shouldReset = window.confirm(
      'Reset to default accounts? This will remove saved values.',
    )
    if (!shouldReset) {
      return
    }
    clearAccounts({ storageAvailable })
    setAccounts(normalizeAccounts(seedAccounts()))
  }

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((account) => account.id !== id))
  }

  const grandTotals = useMemo(
    () =>
      accounts.reduce(
        (totals, account) => {
          const projectionTotals = buildProjection(account).totals

          return {
            totalContributions:
              totals.totalContributions + projectionTotals.totalContributions,
            totalReturns: totals.totalReturns + projectionTotals.totalReturns,
            finalBalance: totals.finalBalance + projectionTotals.finalBalance,
          }
        },
        {
          totalContributions: 0,
          totalReturns: 0,
          finalBalance: 0,
        },
      ),
    [accounts],
  )

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Personal investment tracker</p>
          <h1>Forecast multiple accounts with clarity.</h1>
          <p className="app__subtitle">
            Model each investment separately, tune recurring contributions, and
            compare growth over time.
          </p>
          {hasAccounts ? (
            <div className="app__totals" aria-live="polite">
              <div className="app__total-card" aria-label="Grand total">
                <span className="app__total-card-label">Grand total</span>
                <span className="app__total-card-value">
                  {formatCurrency(grandTotals.finalBalance)}
                </span>
              </div>
              <div
                className="app__total-card"
                aria-label="Total contributions"
              >
                <span className="app__total-card-label">
                  Total contributions
                </span>
                <span className="app__total-card-value">
                  {formatCurrency(grandTotals.totalContributions)}
                </span>
              </div>
              <div className="app__total-card" aria-label="Total returns">
                <span className="app__total-card-label">Total returns</span>
                <span className="app__total-card-value">
                  {formatCurrency(grandTotals.totalReturns)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="app__actions">
          <button
            className="button button--ghost"
            type="button"
            onClick={handleResetAccounts}
          >
            Reset defaults
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={handleAddAccount}
          >
            + Add account
          </button>
        </div>
      </header>

      {!storageAvailable && (
        <div className="storage-warning" role="status" aria-live="polite">
          <span className="storage-warning__title">Limited persistence</span>
          <span className="storage-warning__body">
            Local storage is unavailable, so changes will not be saved on this
            device.
          </span>
        </div>
      )}

      {hasAccounts ? (
        <section className="account-grid" aria-label="Investment accounts">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onUpdate={handleAccountUpdate}
              onDelete={handleDeleteAccount}
            />
          ))}
        </section>
      ) : (
        <section
          className="empty-state"
          role="status"
          aria-live="polite"
          aria-label="No accounts yet"
        >
          <p className="empty-state__eyebrow">No accounts yet</p>
          <h2 className="empty-state__title">Start with your first account.</h2>
          <p className="empty-state__body">
            Add a retirement, brokerage, or savings account to begin forecasting
            growth over time.
          </p>
          <button
            className="button button--primary"
            type="button"
            onClick={handleAddAccount}
          >
            + Add your first account
          </button>
        </section>
      )}

      <ShareFooter shareUrl={shareUrl} />
    </div>
  )
}

export default App
