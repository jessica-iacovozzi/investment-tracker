import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AccountInput } from '../types/investment'
import type { InflationState } from '../types/inflation'
import AccountListRow from './AccountListRow'

const buildAccount = (): AccountInput => ({
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
    endMonth: 120,
  },
})

const defaultInflationState: InflationState = {
  isEnabled: false,
  annualRatePercent: 2.5,
}

const defaultProps = () => {
  const account = buildAccount()
  return {
    account,
    allAccounts: [account],
    termYears: 10,
    inflationState: defaultInflationState,
    isExpanded: false,
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  }
}

afterEach(cleanup)

describe('AccountListRow', () => {
  it('renders account name and type badge in collapsed state', () => {
    render(<AccountListRow {...defaultProps()} />)

    expect(screen.getByText('Test Account')).toBeDefined()
    expect(screen.getByText('Non-registered')).toBeDefined()
  })

  it('renders principal metric in collapsed state', () => {
    render(<AccountListRow {...defaultProps()} />)

    expect(screen.getByText('Principal')).toBeDefined()
  })

  it('renders annual return and projected metrics', () => {
    render(<AccountListRow {...defaultProps()} />)

    expect(screen.getByText('Return')).toBeDefined()
    expect(screen.getByText('Projected')).toBeDefined()
  })

  it('sets aria-expanded to false when collapsed', () => {
    render(<AccountListRow {...defaultProps()} />)

    const header = screen.getByRole('button', { name: /Test Account/ })
    expect(header.getAttribute('aria-expanded')).toBe('false')
  })

  it('sets aria-expanded to true when expanded', () => {
    const props = defaultProps()
    render(<AccountListRow {...props} isExpanded={true} />)

    const header = screen.getByRole('button', { name: /^Test Account/ })
    expect(header.getAttribute('aria-expanded')).toBe('true')
  })

  it('calls onToggle with account id when header is clicked', () => {
    const props = defaultProps()
    render(<AccountListRow {...props} />)

    fireEvent.click(screen.getByRole('button', { name: /Test Account/ }))

    expect(props.onToggle).toHaveBeenCalledWith('account-1')
  })

  it('does not render detail panel when collapsed', () => {
    render(<AccountListRow {...defaultProps()} />)

    expect(screen.queryByRole('region')).toBeNull()
  })

  it('renders detail panel with form, summary, and chart when expanded', () => {
    const props = defaultProps()
    render(<AccountListRow {...props} isExpanded={true} />)

    const region = screen.getByRole('region', { name: 'Test Account details' })
    expect(region).toBeDefined()
  })

  it('renders delete button when expanded', () => {
    const props = defaultProps()
    render(<AccountListRow {...props} isExpanded={true} />)

    const deleteButton = screen.getByRole('button', { name: /Delete Test Account account/ })
    expect(deleteButton).toBeDefined()
  })
})
