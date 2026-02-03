import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import AllocationSuggestions from './AllocationSuggestions'
import type { AccountAllocation } from '../types/goal'

const createAllocations = (): AccountAllocation[] => [
  {
    accountId: '1',
    accountName: 'Brokerage',
    suggestedContribution: 750,
    currentBalance: 30000,
    annualRatePercent: 7,
  },
  {
    accountId: '2',
    accountName: 'Roth IRA',
    suggestedContribution: 250,
    currentBalance: 10000,
    annualRatePercent: 6,
  },
]

describe('AllocationSuggestions', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when allocations are empty', () => {
    const { container } = render(
      <AllocationSuggestions allocations={[]} frequency="monthly" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders account names', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="monthly"
      />
    )
    expect(screen.getByText('Brokerage')).toBeTruthy()
    expect(screen.getByText('Roth IRA')).toBeTruthy()
  })

  it('renders suggested contributions', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="monthly"
      />
    )
    expect(screen.getByText('$750')).toBeTruthy()
    expect(screen.getByText('$250')).toBeTruthy()
  })

  it('renders annual rates', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="monthly"
      />
    )
    expect(screen.getByText('7% APY')).toBeTruthy()
    expect(screen.getByText('6% APY')).toBeTruthy()
  })

  it('shows total contribution in subtitle', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="monthly"
      />
    )
    expect(screen.getByText(/\$1,000\/month/)).toBeTruthy()
  })

  it('formats bi-weekly frequency correctly', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="bi-weekly"
      />
    )
    expect(screen.getAllByText(/\/bi-week/).length).toBeGreaterThan(0)
  })

  it('formats annually frequency correctly', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="annually"
      />
    )
    expect(screen.getAllByText(/\/year/).length).toBeGreaterThan(0)
  })

  it('renders as a list for accessibility', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocations()}
        frequency="monthly"
      />
    )
    expect(screen.getByRole('list')).toBeTruthy()
  })
})
