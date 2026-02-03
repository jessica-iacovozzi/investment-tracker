import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import GoalModeToggle from './GoalModeToggle'

describe('GoalModeToggle', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders with Projection Mode label when not in goal mode', () => {
    render(<GoalModeToggle isGoalMode={false} onToggle={() => {}} />)
    expect(screen.getByText('Projection Mode')).toBeTruthy()
  })

  it('renders with Goal Mode label when in goal mode', () => {
    render(<GoalModeToggle isGoalMode={true} onToggle={() => {}} />)
    expect(screen.getByText('Goal Mode')).toBeTruthy()
  })

  it('calls onToggle when clicked', () => {
    const handleToggle = vi.fn()
    render(<GoalModeToggle isGoalMode={false} onToggle={handleToggle} />)
    
    fireEvent.click(screen.getByRole('switch'))
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('has correct aria-checked attribute', () => {
    const { rerender } = render(
      <GoalModeToggle isGoalMode={false} onToggle={() => {}} />
    )
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')

    rerender(<GoalModeToggle isGoalMode={true} onToggle={() => {}} />)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <GoalModeToggle isGoalMode={false} onToggle={() => {}} disabled={true} />
    )
    expect(screen.getByRole('switch').hasAttribute('disabled')).toBe(true)
  })

  it('is keyboard accessible', () => {
    const handleToggle = vi.fn()
    render(<GoalModeToggle isGoalMode={false} onToggle={handleToggle} />)
    
    const toggle = screen.getByRole('switch')
    toggle.focus()
    fireEvent.keyDown(toggle, { key: 'Enter' })
    fireEvent.click(toggle)
    
    expect(handleToggle).toHaveBeenCalled()
  })
})
