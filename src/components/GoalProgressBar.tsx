import { formatCurrency } from '../utils/formatters'

type GoalProgressBarProps = {
  currentBalance: number
  targetBalance: number
}

function GoalProgressBar({ currentBalance, targetBalance }: GoalProgressBarProps) {
  if (targetBalance <= 0) {
    return null
  }

  const percentage = Math.min((currentBalance / targetBalance) * 100, 100)
  const actualPercentage = (currentBalance / targetBalance) * 100
  const isExceeded = actualPercentage > 100

  return (
    <div className="goal-progress">
      <div className="goal-progress__header">
        <span className="goal-progress__label">Progress to Goal</span>
        <span className="goal-progress__percentage">
          {actualPercentage.toFixed(1)}%
        </span>
      </div>
      <div
        className="goal-progress__bar"
        role="progressbar"
        aria-valuenow={Math.round(actualPercentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${actualPercentage.toFixed(1)}% progress toward goal of ${formatCurrency(targetBalance)}`}
      >
        <div
          className={`goal-progress__fill ${isExceeded ? 'goal-progress__fill--exceeded' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="goal-progress__details">
        <span className="goal-progress__current">
          {formatCurrency(currentBalance)}
        </span>
        <span className="goal-progress__target">
          Goal: {formatCurrency(targetBalance)}
        </span>
      </div>
    </div>
  )
}

export default GoalProgressBar
