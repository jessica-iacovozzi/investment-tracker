import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AccountInput } from '../types/investment'
import type { InflationState } from '../types/inflation'
import AccountCard from './AccountCard'

const buildAccount = ({
  termYears = 10,
  endMonth = 120,
}: {
  termYears?: number
  endMonth?: number
} = {}): AccountInput => ({
  id: 'account-1',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 5,
  compoundingFrequency: 'monthly',
  termYears,
  contributionTiming: 'end-of-month',
  accountType: 'non-registered',
  contribution: {
    amount: 200,
    frequency: 'monthly',
    startMonth: 1,
    endMonth,
  },
})

const defaultInflationState: InflationState = {
  isEnabled: false,
  annualRatePercent: 2.5,
}

describe('AccountCard', () => {
  it('extends end month when term increases from the previous max', () => {
    const handleUpdate = vi.fn()
    const account = buildAccount({ termYears: 10, endMonth: 120 })
    const { rerender } = render(
      <AccountCard
        account={account}
        allAccounts={[account]}
        inflationState={defaultInflationState}
        onUpdate={handleUpdate}
        onDelete={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Term (years)'), {
      target: { value: '11' },
    })

    expect(handleUpdate).toHaveBeenLastCalledWith({
      id: 'account-1',
      changes: {
        termYears: 11,
        contribution: {
          amount: 200,
          frequency: 'monthly',
          startMonth: 1,
          endMonth: 132,
        },
      },
    })

    handleUpdate.mockClear()

    const updatedAccount = buildAccount({ termYears: 11, endMonth: 132 })
    rerender(
      <AccountCard
        account={updatedAccount}
        allAccounts={[updatedAccount]}
        inflationState={defaultInflationState}
        onUpdate={handleUpdate}
        onDelete={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Term (years)'), {
      target: { value: '12' },
    })

    expect(handleUpdate).toHaveBeenLastCalledWith({
      id: 'account-1',
      changes: {
        termYears: 12,
        contribution: {
          amount: 200,
          frequency: 'monthly',
          startMonth: 1,
          endMonth: 144,
        },
      },
    })
  })
})
