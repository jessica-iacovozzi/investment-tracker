type GoalModeToggleProps = {
  isGoalMode: boolean
  onToggle: () => void
  disabled?: boolean
}

function GoalModeToggle({
  isGoalMode,
  onToggle,
  disabled = false,
}: GoalModeToggleProps) {
  return (
    <div className="goal-mode-toggle">
      <span className="goal-mode-toggle__label" id="goal-mode-label">
        {isGoalMode ? 'Goal Mode' : 'Projection Mode'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isGoalMode}
        aria-labelledby="goal-mode-label"
        className={`goal-mode-toggle__switch ${isGoalMode ? 'goal-mode-toggle__switch--active' : ''}`}
        onClick={onToggle}
        disabled={disabled}
      >
        <span className="goal-mode-toggle__thumb" />
      </button>
    </div>
  )
}

export default GoalModeToggle
