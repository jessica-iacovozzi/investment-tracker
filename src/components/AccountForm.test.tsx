import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { AccountInput, ContributionFrequency } from '../types/investment'
import AccountForm from './AccountForm'

const buildAccount = ({
  frequency = 'monthly',
  timing = 'end-of-month',
}: {
  frequency?: ContributionFrequency
  timing?: AccountInput['contributionTiming']
} = {}): AccountInput => ({
  id: 'account-1',
  name: 'Test Account',
  currentAge: 30,
  principal: 10000,
  annualRatePercent: 5,
  compoundingFrequency: 'monthly',
  termYears: 10,
  contributionTiming: timing,
  contribution: {
    amount: 200,
    frequency,
    startMonth: 1,
    endMonth: 120,
  },
})

describe('AccountForm', () => {
  it('shows validation and blocks invalid age updates', () => {
    const handleUpdate = vi.fn()
    render(<AccountForm account={buildAccount()} onUpdate={handleUpdate} />)

    const ageInput = screen.getByLabelText('Current age')
    fireEvent.change(ageInput, { target: { value: '200' } })

    expect(screen.getByText('Enter an age between 0 and 120.')).toBeTruthy()
    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('filters timing options based on frequency', () => {
    const { container, rerender } = render(
      <AccountForm account={buildAccount({ frequency: 'monthly' })} onUpdate={vi.fn()} />,
    )

    const timingSelect = within(container).getByLabelText('Contribution timing')
    expect(timingSelect.textContent).toContain('Beginning of month')
    expect(timingSelect.textContent).toContain('End of month')

    rerender(
      <AccountForm account={buildAccount({ frequency: 'quarterly' })} onUpdate={vi.fn()} />,
    )

    const updatedTimingSelect = within(container).getByLabelText(
      'Contribution timing',
    )
    expect(updatedTimingSelect.textContent).toContain('Beginning of quarter')
    expect(updatedTimingSelect.textContent).toContain('End of quarter')
  })

  it('auto-corrects timing when frequency changes', () => {
    const handleUpdate = vi.fn()
    const { container } = render(
      <AccountForm
        account={buildAccount({ frequency: 'monthly', timing: 'beginning-of-month' })}
        onUpdate={handleUpdate}
      />,
    )

    fireEvent.change(within(container).getByLabelText('Contribution Frequency'), {
      target: { value: 'quarterly' },
    })

    expect(handleUpdate).toHaveBeenCalledWith({
      id: 'account-1',
      changes: {
        contribution: {
          amount: 200,
          frequency: 'quarterly',
          startMonth: 1,
          endMonth: 120,
        },
        contributionTiming: 'end-of-quarter',
      },
    })
  })

  it('connects timing helper text via aria-describedby', () => {
    const { container } = render(
      <AccountForm account={buildAccount()} onUpdate={vi.fn()} />,
    )

    const timingSelect = within(container).getByLabelText('Contribution timing')
    expect(timingSelect.getAttribute('aria-describedby')).toBe(
      'account-1-timing-help',
    )
    expect(document.getElementById('account-1-timing-help')).toBeTruthy()
  })
})
