import type { ContributionFrequency } from '../types/investment'
import type { CalculationType, GoalState } from '../types/goal'
import {
  CALCULATION_TYPE_LABELS,
  CONTRIBUTION_FREQUENCY_LABELS,
  CONTRIBUTION_FREQUENCIES,
  GOAL_VALIDATION,
} from '../constants/goal'
import { formatCurrency } from '../utils/formatters'
import { formatTermFromMonths } from '../utils/goalCalculations'
import type { GoalCalculationResult } from '../types/goal'

type GoalInputPanelProps = {
  goalState: GoalState
  onUpdate: (updates: Partial<GoalState>) => void
  calculationResult: GoalCalculationResult | null
  hasAccounts: boolean
}

function GoalInputPanel({
  goalState,
  onUpdate,
  calculationResult,
  hasAccounts,
}: GoalInputPanelProps) {
  const handleTargetBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0)
    onUpdate({ targetBalance: value })
  }

  const handleCalculationTypeChange = (type: CalculationType) => {
    onUpdate({ calculationType: type })
  }

  const handleContributionAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0)
    onUpdate({ contributionAmount: value })
  }

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ contributionFrequency: e.target.value as ContributionFrequency })
  }

  const renderResult = () => {
    if (!hasAccounts) {
      return (
        <div className="goal-result goal-result--error" role="alert">
          Add at least one account to use Goal Mode
        </div>
      )
    }

    if (!calculationResult) {
      return null
    }

    if (!calculationResult.isReachable) {
      return (
        <div className="goal-result goal-result--error" role="alert">
          {calculationResult.message}
        </div>
      )
    }

    if (calculationResult.message) {
      return (
        <div className="goal-result goal-result--success" role="status">
          {calculationResult.message}
        </div>
      )
    }

    if (goalState.calculationType === 'contribution') {
      return (
        <div className="goal-result goal-result--success" role="status">
          <span className="goal-result__label">Required contribution:</span>
          <span className="goal-result__value">
            {formatCurrency(calculationResult.requiredContribution ?? 0)}/
            {goalState.contributionFrequency === 'bi-weekly'
              ? 'bi-week'
              : goalState.contributionFrequency === 'annually'
                ? 'year'
                : goalState.contributionFrequency.replace('ly', '')}
          </span>
        </div>
      )
    }

    return (
      <div className="goal-result goal-result--success" role="status">
        <span className="goal-result__label">Time to reach goal:</span>
        <span className="goal-result__value">
          {formatTermFromMonths(calculationResult.requiredTermMonths ?? 0)}
        </span>
      </div>
    )
  }

  return (
    <div className="goal-input-panel">
      <h2 className="goal-input-panel__title">Goal Settings</h2>

      <div className="goal-input-panel__form">
        <div className="field-group">
          <label htmlFor="target-balance" className="field-label">
            Target Balance
          </label>
          <div className="field-input-wrapper">
            <span className="field-prefix">$</span>
            <input
              id="target-balance"
              type="number"
              className="field-input field-input--with-prefix"
              value={goalState.targetBalance || ''}
              onChange={handleTargetBalanceChange}
              min={GOAL_VALIDATION.MIN_TARGET_BALANCE}
              max={GOAL_VALIDATION.MAX_TARGET_BALANCE}
              aria-describedby="target-balance-hint"
            />
          </div>
          <span id="target-balance-hint" className="field-hint">
            Your financial goal amount
          </span>
        </div>

        <div className="field-group">
          <span className="field-label">Calculate</span>
          <div className="goal-input-panel__toggle-group" role="radiogroup">
            {(['contribution', 'term'] as CalculationType[]).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={goalState.calculationType === type}
                className={`goal-input-panel__toggle-btn ${
                  goalState.calculationType === type
                    ? 'goal-input-panel__toggle-btn--active'
                    : ''
                }`}
                onClick={() => handleCalculationTypeChange(type)}
              >
                {CALCULATION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {goalState.calculationType === 'contribution' ? (
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="contribution-frequency" className="field-label">
                Frequency
              </label>
              <select
                id="contribution-frequency"
                className="field-select"
                value={goalState.contributionFrequency}
                onChange={handleFrequencyChange}
              >
                {CONTRIBUTION_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {CONTRIBUTION_FREQUENCY_LABELS[freq]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="contribution-amount" className="field-label">
                Contribution
              </label>
              <div className="field-input-wrapper">
                <span className="field-prefix">$</span>
                <input
                  id="contribution-amount"
                  type="number"
                  className="field-input field-input--with-prefix"
                  value={goalState.contributionAmount || ''}
                  onChange={handleContributionAmountChange}
                  min={GOAL_VALIDATION.MIN_CONTRIBUTION}
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="contribution-frequency-term" className="field-label">
                Frequency
              </label>
              <select
                id="contribution-frequency-term"
                className="field-select"
                value={goalState.contributionFrequency}
                onChange={handleFrequencyChange}
              >
                {CONTRIBUTION_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {CONTRIBUTION_FREQUENCY_LABELS[freq]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {renderResult()}
      </div>
    </div>
  )
}

export default GoalInputPanel
