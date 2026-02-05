import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, within } from '@testing-library/react'
import type { AccountInput, AccountType, ContributionFrequency } from '../types/investment'
import AccountForm from './AccountForm'

type BuildAccountOverrides = Partial<AccountInput> & {
  frequency?: ContributionFrequency
  timing?: AccountInput['contributionTiming']
  accountType?: AccountType
}

const buildAccount = (overrides: BuildAccountOverrides = {}): AccountInput => {
  const {
    frequency = 'monthly',
    timing = 'end-of-month',
    accountType = 'non-registered',
    ...accountOverrides
  } = overrides

  return {
    id: 'account-1',
    name: 'Test Account',
    principal: 10000,
    annualRatePercent: 5,
    compoundingFrequency: 'monthly',
    termYears: 10,
    contributionTiming: timing,
    accountType,
    contribution: {
      amount: 200,
      frequency: frequency as ContributionFrequency,
      startMonth: 1,
      endMonth: 120,
    },
    ...accountOverrides,
  }
}

describe('AccountForm', () => {
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

  it('has info tooltip on timing label', () => {
    const { container } = render(
      <AccountForm account={buildAccount()} onUpdate={vi.fn()} />,
    )

    const timingLabel = container.querySelector('.field-label--with-info')
    expect(timingLabel).toBeTruthy()
    expect(timingLabel?.querySelector('.field-label__info')).toBeTruthy()
  })

  describe('Account Type', () => {
    it('renders account type dropdown with all options', () => {
      const { container } = render(
        <AccountForm account={buildAccount()} onUpdate={vi.fn()} />,
      )

      const accountTypeSelect = within(container).getByLabelText('Account type')
      expect(accountTypeSelect.textContent).toContain('TFSA')
      expect(accountTypeSelect.textContent).toContain('RRSP')
      expect(accountTypeSelect.textContent).toContain('FHSA')
      expect(accountTypeSelect.textContent).toContain('LIRA')
      expect(accountTypeSelect.textContent).toContain('Non-registered')
    })

    it('shows contribution room field for TFSA', () => {
      const { container } = render(
        <AccountForm account={buildAccount({ accountType: 'tfsa' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Contribution room/)).toBeTruthy()
    })

    it('hides contribution room field for non-registered accounts', () => {
      const { container } = render(
        <AccountForm account={buildAccount({ accountType: 'non-registered' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Contribution room/)).toBeNull()
    })

    it('shows annual income field only for RRSP', () => {
      const { container, rerender } = render(
        <AccountForm account={buildAccount({ accountType: 'rrsp' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Annual income/)).toBeTruthy()

      rerender(
        <AccountForm account={buildAccount({ accountType: 'tfsa' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Annual income/)).toBeNull()
    })

    it('shows lifetime contributions field only for FHSA', () => {
      const { container, rerender } = render(
        <AccountForm account={buildAccount({ accountType: 'fhsa' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Lifetime contributions/)).toBeTruthy()

      rerender(
        <AccountForm account={buildAccount({ accountType: 'tfsa' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Lifetime contributions/)).toBeNull()
    })

    it('shows custom annual room increase field only for TFSA', () => {
      const { container, rerender } = render(
        <AccountForm account={buildAccount({ accountType: 'tfsa' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Custom annual room/)).toBeTruthy()

      rerender(
        <AccountForm account={buildAccount({ accountType: 'rrsp' })} onUpdate={vi.fn()} />,
      )

      expect(within(container).queryByLabelText(/Custom annual room/)).toBeNull()
    })

    it('updates shared room fields when account values change', () => {
      const initialAccount = buildAccount({
        accountType: 'tfsa',
        contributionRoom: 12000,
        customAnnualRoomIncrease: 7000,
      })
      const { container, rerender } = render(
        <AccountForm account={initialAccount} onUpdate={vi.fn()} />,
      )
      const contributionInput = within(container).getByLabelText(/Contribution room/) as HTMLInputElement
      const customRoomInput = within(container).getByLabelText(/Custom annual room/) as HTMLInputElement

      expect(contributionInput.value).toBe('12000')
      expect(customRoomInput.value).toBe('7000')

      rerender(
        <AccountForm
          account={{
            ...initialAccount,
            contributionRoom: 15000,
            customAnnualRoomIncrease: 7500,
          }}
          onUpdate={vi.fn()}
        />,
      )

      expect(contributionInput.value).toBe('15000')
      expect(customRoomInput.value).toBe('7500')
    })

    it('sends zero values for synced fields', () => {
      const handleUpdate = vi.fn()
      const { container, rerender } = render(
        <AccountForm
          account={buildAccount({
            accountType: 'tfsa',
            contributionRoom: 12000,
            customAnnualRoomIncrease: 7000,
          })}
          onUpdate={handleUpdate}
        />,
      )

      fireEvent.change(within(container).getByLabelText(/Contribution room/), {
        target: { value: '0' },
      })
      fireEvent.change(within(container).getByLabelText(/Custom annual room/), {
        target: { value: '0' },
      })

      fireEvent.change(within(container).getByLabelText(/Contribution room/), {
        target: { value: '' },
      })
      fireEvent.change(within(container).getByLabelText(/Custom annual room/), {
        target: { value: '' },
      })

      expect(handleUpdate).toHaveBeenCalledWith({
        id: 'account-1',
        changes: { contributionRoom: 0 },
      })
      expect(handleUpdate).toHaveBeenCalledWith({
        id: 'account-1',
        changes: { customAnnualRoomIncrease: 0 },
      })

      rerender(
        <AccountForm
          account={buildAccount({
            accountType: 'rrsp',
            annualIncomeForRrsp: 90000,
          })}
          onUpdate={handleUpdate}
        />,
      )

      fireEvent.change(within(container).getByLabelText(/Annual income/), {
        target: { value: '0' },
      })

      expect(handleUpdate).toHaveBeenCalledWith({
        id: 'account-1',
        changes: { annualIncomeForRrsp: 0 },
      })

      fireEvent.change(within(container).getByLabelText(/Annual income/), {
        target: { value: '' },
      })

      expect(handleUpdate).toHaveBeenCalledWith({
        id: 'account-1',
        changes: { annualIncomeForRrsp: 0 },
      })
    })

    it('does not render locked-in checkbox for any account type', () => {
      const accountTypes = ['tfsa', 'rrsp', 'fhsa', 'lira', 'non-registered'] as const
      
      accountTypes.forEach((accountType) => {
        const { container, unmount } = render(
          <AccountForm account={buildAccount({ accountType })} onUpdate={vi.fn()} />,
        )
        expect(within(container).queryByLabelText(/Locked-in account/)).toBeNull()
        unmount()
      })
    })

    it('calls onUpdate with new account type when changed', () => {
      const handleUpdate = vi.fn()
      const { container } = render(
        <AccountForm account={buildAccount({ accountType: 'non-registered' })} onUpdate={handleUpdate} />,
      )

      fireEvent.change(within(container).getByLabelText('Account type'), {
        target: { value: 'tfsa' },
      })

      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'account-1',
          changes: expect.objectContaining({
            accountType: 'tfsa',
          }),
        }),
      )
    })
  })
})
