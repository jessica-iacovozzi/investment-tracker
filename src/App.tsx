import { useEffect, useMemo, useState } from 'react'
import AccountCard from './components/AccountCard'
import AllocationSuggestions from './components/AllocationSuggestions'
import CurrentAgeInput from './components/CurrentAgeInput'
import GoalInputPanel from './components/GoalInputPanel'
import GoalModeToggle from './components/GoalModeToggle'
import GoalProgressBar from './components/GoalProgressBar'
import ShareFooter from './components/ShareFooter'
import {
  DEFAULT_COMPOUNDING_FREQUENCY,
  DEFAULT_CONTRIBUTION_TIMING,
} from './constants/compounding'
import { normalizeAccount } from './utils/accountNormalization'
import { formatCurrency } from './utils/formatters'
import { buildProjection } from './utils/projections'
import {
  isLocalStorageAvailable,
  loadGoalState,
  saveGoalState,
  clearGoalState,
  loadInflationState,
  saveInflationState,
  clearInflationState,
} from './utils/storage'
import {
  calculateRequiredContribution,
  calculateRequiredTerm,
  calculateAllocation,
} from './utils/goalCalculations'
import type { AccountInput, AccountUpdatePayload, ProjectionTotals } from './types/investment'
import type { GoalState, GoalCalculationResult } from './types/goal'
import type { InflationState } from './types/inflation'
import { applyInflationToTotals } from './utils/inflation'
import InflationControls from './components/InflationControls'
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
const AGE_STORAGE_KEY = 'investment-tracker-current-age'
const DEFAULT_AGE = 30

const loadCurrentAge = ({ storageAvailable }: { storageAvailable: boolean }): number | undefined => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return import.meta.env.PROD ? undefined : DEFAULT_AGE
  }

  const storedValue = window.localStorage.getItem(AGE_STORAGE_KEY)
  if (!storedValue) {
    return import.meta.env.PROD ? undefined : DEFAULT_AGE
  }

  const parsed = Number(storedValue)
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 120) {
    return import.meta.env.PROD ? undefined : DEFAULT_AGE
  }

  return parsed
}

const saveCurrentAge = ({
  currentAge,
  storageAvailable,
}: {
  currentAge: number | undefined
  storageAvailable: boolean
}) => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  if (currentAge === undefined) {
    window.localStorage.removeItem(AGE_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AGE_STORAGE_KEY, String(currentAge))
}

const clearCurrentAge = ({ storageAvailable }: { storageAvailable: boolean }) => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  window.localStorage.removeItem(AGE_STORAGE_KEY)
}

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
  const [goalState, setGoalState] = useState<GoalState>(() =>
    loadGoalState({ storageAvailable }),
  )
  const [currentAge, setCurrentAge] = useState<number | undefined>(() =>
    loadCurrentAge({ storageAvailable }),
  )
  const [inflationState, setInflationState] = useState<InflationState>(() =>
    loadInflationState({ storageAvailable }),
  )
  const hasAccounts = accounts.length > 0
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://personal-multi-investment-tracker.vercel.app/'

  useEffect(() => {
    saveAccounts({ accounts, storageAvailable })
  }, [accounts, storageAvailable])

  useEffect(() => {
    saveGoalState({ goalState, storageAvailable })
  }, [goalState, storageAvailable])

  useEffect(() => {
    saveCurrentAge({ currentAge, storageAvailable })
  }, [currentAge, storageAvailable])

  useEffect(() => {
    saveInflationState({ inflationState, storageAvailable })
  }, [inflationState, storageAvailable])

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
    clearGoalState({ storageAvailable })
    clearCurrentAge({ storageAvailable })
    clearInflationState({ storageAvailable })
    setAccounts(normalizeAccounts(seedAccounts()))
    setGoalState(loadGoalState({ storageAvailable: false }))
    setCurrentAge(loadCurrentAge({ storageAvailable: false }))
    setInflationState(loadInflationState({ storageAvailable: false }))
  }

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((account) => account.id !== id))
  }

  const handleGoalStateUpdate = (updates: Partial<GoalState>) => {
    setGoalState((prev) => ({ ...prev, ...updates }))
  }

  const handleToggleGoalMode = () => {
    setGoalState((prev) => ({ ...prev, isGoalMode: !prev.isGoalMode }))
  }

  const handleInflationStateUpdate = (updates: Partial<InflationState>) => {
    setInflationState((prev) => ({ ...prev, ...updates }))
  }

  const maxTermYears = useMemo(
    () => Math.max(...accounts.map((a) => a.termYears), 0),
    [accounts],
  )

  const grandTotals: ProjectionTotals = useMemo(() => {
    const nominalTotals: ProjectionTotals = accounts.reduce(
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
    )

    if (inflationState.isEnabled && maxTermYears > 0) {
      return applyInflationToTotals(
        nominalTotals,
        inflationState.annualRatePercent,
        maxTermYears,
      )
    }

    return nominalTotals
  }, [accounts, inflationState, maxTermYears])

  const goalCalculationResult: GoalCalculationResult | null = useMemo(() => {
    if (!goalState.isGoalMode || !hasAccounts) {
      return null
    }

    if (goalState.calculationType === 'contribution') {
      return calculateRequiredContribution({
        accounts,
        targetBalance: goalState.targetBalance,
        termYears: goalState.termYears ?? 30,
        contributionFrequency: goalState.contributionFrequency,
      })
    }

    return calculateRequiredTerm({
      accounts,
      targetBalance: goalState.targetBalance,
      contributionAmount: goalState.contributionAmount ?? 0,
      contributionFrequency: goalState.contributionFrequency,
    })
  }, [accounts, goalState, hasAccounts])

  const allocations = useMemo(() => {
    if (!goalState.isGoalMode || !hasAccounts || !goalCalculationResult?.isReachable) {
      return []
    }

    const totalContribution =
      goalState.calculationType === 'contribution'
        ? goalCalculationResult.requiredContribution
        : goalState.contributionAmount

    if (!totalContribution || totalContribution === 0) {
      return []
    }

    return calculateAllocation({
      accounts,
      totalContribution,
      strategy: goalState.allocationStrategy,
      targetFrequency: goalState.contributionFrequency,
    })
  }, [accounts, goalState, hasAccounts, goalCalculationResult])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-top">
          <div>
            <p className="app__eyebrow">Personal investment tracker</p>
            <h1>Forecast multiple accounts with clarity.</h1>
            <p className="app__subtitle">
              Model each investment separately, tune recurring contributions, and
              compare growth over time.
            </p>
          </div>
          <div className="app__header-controls">
            <CurrentAgeInput currentAge={currentAge} onChange={setCurrentAge} />
            <InflationControls
              inflationState={inflationState}
              onUpdate={handleInflationStateUpdate}
            />
            <GoalModeToggle
              isGoalMode={goalState.isGoalMode}
              onToggle={handleToggleGoalMode}
              disabled={!hasAccounts}
            />
          </div>
        </div>
        {hasAccounts ? (
          <div className="app__totals" aria-live="polite">
            <div
              className="app__total-card app__total-card--grand"
              aria-label="Grand total"
            >
              <span className="app__total-card-label">
                {inflationState.isEnabled ? "Grand total (today's $)" : 'Grand total'}
              </span>
              <span className="app__total-card-value">
                {formatCurrency(
                  inflationState.isEnabled && grandTotals.realFinalBalance !== undefined
                    ? grandTotals.realFinalBalance
                    : grandTotals.finalBalance
                )}
              </span>
            </div>
            <div
              className="app__total-card"
              aria-label="Total contributions"
            >
              <span className="app__total-card-label">
                {inflationState.isEnabled ? "Total contributions (today's $)" : 'Total contributions'}
              </span>
              <span className="app__total-card-value">
                {formatCurrency(
                  inflationState.isEnabled && grandTotals.realTotalContributions !== undefined
                    ? grandTotals.realTotalContributions
                    : grandTotals.totalContributions
                )}
              </span>
            </div>
            <div className="app__total-card" aria-label="Total returns">
              <span className="app__total-card-label">
                {inflationState.isEnabled ? "Total returns (today's $)" : 'Total returns'}
              </span>
              <span className="app__total-card-value">
                {formatCurrency(
                  inflationState.isEnabled && grandTotals.realTotalReturns !== undefined
                    ? grandTotals.realTotalReturns
                    : grandTotals.totalReturns
                )}
              </span>
            </div>
          </div>
        ) : null}
        {goalState.isGoalMode && hasAccounts && (
          <GoalProgressBar
            currentBalance={grandTotals.finalBalance}
            targetBalance={goalState.targetBalance}
          />
        )}
        {hasAccounts ? (
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
        ) : null}
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

      {goalState.isGoalMode && (
        <section className="goal-section" aria-label="Goal calculator">
          <GoalInputPanel
            goalState={goalState}
            onUpdate={handleGoalStateUpdate}
            calculationResult={goalCalculationResult}
            hasAccounts={hasAccounts}
          />
          {allocations.length > 0 && (
            <AllocationSuggestions
              allocations={allocations}
              frequency={goalState.contributionFrequency}
            />
          )}
        </section>
      )}

      {hasAccounts ? (
        <section className="account-grid" aria-label="Investment accounts">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              currentAge={currentAge}
              inflationState={inflationState}
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
      <footer className="app__credit">
        Made by{' '}
        <a
          className="app__credit-link"
          href="https://jessicaiacovozzi.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Jessica Iacovozzi
        </a>
      </footer>
    </div>
  )
}

export default App
