import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AccountInput } from '../types/investment'
import type { InflationState } from '../types/inflation'
import AccountCard from './AccountCard'

const buildAccount = ({
  endMonth = 120,
}: {
  endMonth?: number
} = {}): AccountInput => ({
  id: 'account-1',
  name: 'Test Account',
  principal: 10000,
  annualRatePercent: 5,
  compoundingFrequency: 'monthly',
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
  it('renders account name and delete button', () => {
    const account = buildAccount()
    render(
      <AccountCard
        account={account}
        allAccounts={[account]}
        termYears={10}
        inflationState={defaultInflationState}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Test Account')).toBeDefined()
    expect(screen.getByRole('button', { name: /Delete Test Account account/ })).toBeDefined()
  })

  it('renders account form with termYears prop', () => {
    const account = buildAccount()
    const { container } = render(
      <AccountCard
        account={account}
        allAccounts={[account]}
        termYears={10}
        inflationState={defaultInflationState}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(container.querySelector('.account-form')).toBeTruthy()
  })
})
