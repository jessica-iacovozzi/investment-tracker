import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import GoalInputPanel from './GoalInputPanel'
import { DEFAULT_GOAL_STATE } from '../types/goal'
import type { GoalState, GoalCalculationResult } from '../types/goal'

const createGoalState = (overrides: Partial<GoalState> = {}): GoalState => ({
  ...DEFAULT_GOAL_STATE,
  ...overrides,
})

describe('GoalInputPanel', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders target balance input', () => {
    render(
      <GoalInputPanel
        goalState={createGoalState()}
        onUpdate={() => {}}
        calculationResult={null}
        hasAccounts={true}
      />
    )
    expect(screen.getByLabelText('Target Balance')).toBeTruthy()
  })

  it('renders calculation type toggle', () => {
    render(
      <GoalInputPanel
        goalState={createGoalState()}
        onUpdate={() => {}}
        calculationResult={null}
        hasAccounts={true}
      />
    )
    expect(screen.getByText('Calculate Contribution')).toBeTruthy()
    expect(screen.getByText('Calculate Term')).toBeTruthy()
  })

  it('calls onUpdate when target balance changes', () => {
    const handleUpdate = vi.fn()
    render(
      <GoalInputPanel
        goalState={createGoalState()}
        onUpdate={handleUpdate}
        calculationResult={null}
        hasAccounts={true}
      />
    )

    fireEvent.change(screen.getByLabelText('Target Balance'), {
      target: { value: '500000' },
    })

    expect(handleUpdate).toHaveBeenCalledWith({ targetBalance: 500000 })
  })

  it('calls onUpdate when calculation type changes', () => {
    const handleUpdate = vi.fn()
    render(
      <GoalInputPanel
        goalState={createGoalState({ calculationType: 'contribution' })}
        onUpdate={handleUpdate}
        calculationResult={null}
        hasAccounts={true}
      />
    )

    fireEvent.click(screen.getByText('Calculate Term'))

    expect(handleUpdate).toHaveBeenCalledWith({ calculationType: 'term' })
  })

  it('shows frequency selector when calculating contribution', () => {
    render(
      <GoalInputPanel
        goalState={createGoalState({ calculationType: 'contribution' })}
        onUpdate={() => {}}
        calculationResult={null}
        hasAccounts={true}
      />
    )

    expect(screen.getByLabelText('Frequency')).toBeTruthy()
  })

  it('shows contribution input when calculating term', () => {
    render(
      <GoalInputPanel
        goalState={createGoalState({ calculationType: 'term' })}
        onUpdate={() => {}}
        calculationResult={null}
        hasAccounts={true}
      />
    )

    expect(screen.getByLabelText('Contribution')).toBeTruthy()
  })

  it('shows error when no accounts exist', () => {
    render(
      <GoalInputPanel
        goalState={createGoalState()}
        onUpdate={() => {}}
        calculationResult={null}
        hasAccounts={false}
      />
    )

    expect(screen.getByRole('alert').textContent).toContain('Add at least one account')
  })

  it('shows success result for contribution calculation', () => {
    const result: GoalCalculationResult = {
      isReachable: true,
      requiredContribution: 500,
    }

    render(
      <GoalInputPanel
        goalState={createGoalState({ calculationType: 'contribution', contributionFrequency: 'monthly' })}
        onUpdate={() => {}}
        calculationResult={result}
        hasAccounts={true}
      />
    )

    expect(screen.getByRole('status').textContent).toContain('$500')
  })

  it('shows success result for term calculation', () => {
    const result: GoalCalculationResult = {
      isReachable: true,
      requiredTermMonths: 120,
    }

    render(
      <GoalInputPanel
        goalState={createGoalState({ calculationType: 'term' })}
        onUpdate={() => {}}
        calculationResult={result}
        hasAccounts={true}
      />
    )

    expect(screen.getByRole('status').textContent).toContain('10 years')
  })

  it('shows error result when goal unreachable', () => {
    const result: GoalCalculationResult = {
      isReachable: false,
      message: 'Goal cannot be reached',
    }

    render(
      <GoalInputPanel
        goalState={createGoalState()}
        onUpdate={() => {}}
        calculationResult={result}
        hasAccounts={true}
      />
    )

    expect(screen.getByRole('alert').textContent).toContain('Goal cannot be reached')
  })
})
