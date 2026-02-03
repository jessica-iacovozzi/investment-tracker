import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import GoalProgressBar from './GoalProgressBar'

describe('GoalProgressBar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders progress percentage', () => {
    render(<GoalProgressBar currentBalance={50000} targetBalance={100000} />)
    expect(screen.getByText('50.0%')).toBeTruthy()
  })

  it('renders current balance', () => {
    render(<GoalProgressBar currentBalance={50000} targetBalance={100000} />)
    expect(screen.getByText('$50,000')).toBeTruthy()
  })

  it('renders target balance', () => {
    render(<GoalProgressBar currentBalance={50000} targetBalance={100000} />)
    expect(screen.getByText('Goal: $100,000')).toBeTruthy()
  })

  it('has correct aria attributes', () => {
    render(<GoalProgressBar currentBalance={25000} targetBalance={100000} />)
    const progressbar = screen.getByRole('progressbar')
    
    expect(progressbar.getAttribute('aria-valuenow')).toBe('25')
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0')
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('caps visual progress at 100%', () => {
    render(<GoalProgressBar currentBalance={150000} targetBalance={100000} />)
    expect(screen.getByText('150.0%')).toBeTruthy()
  })

  it('returns null for zero target balance', () => {
    const { container } = render(<GoalProgressBar currentBalance={50000} targetBalance={0} />)
    expect(container.querySelector('.goal-progress')).toBeNull()
  })

  it('shows exceeded state when over 100%', () => {
    const { container } = render(
      <GoalProgressBar currentBalance={150000} targetBalance={100000} />
    )
    const fill = container.querySelector('.goal-progress__fill--exceeded')
    expect(fill).toBeTruthy()
  })
})
