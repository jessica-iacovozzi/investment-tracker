import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import AllocationSuggestions from './AllocationSuggestions'
import type { AccountAllocation } from '../types/goal'

const createAllocationsWithAdditional = (): AccountAllocation[] => [
  {
    accountId: '1',
    accountName: 'Brokerage',
    suggestedContribution: 750,
    currentContribution: 300,
    additionalContribution: 450,
    currentBalance: 30000,
    annualRatePercent: 7,
  },
  {
    accountId: '2',
    accountName: 'Roth IRA',
    suggestedContribution: 250,
    currentContribution: 100,
    additionalContribution: 150,
    currentBalance: 10000,
    annualRatePercent: 6,
  },
]

const createAllocationsWithNetIncrease = (): AccountAllocation[] => [
  {
    accountId: '1',
    accountName: 'Brokerage',
    suggestedContribution: 600,
    currentContribution: 300,
    additionalContribution: 300,
    currentBalance: 30000,
    annualRatePercent: 7,
  },
  {
    accountId: '2',
    accountName: 'Roth IRA',
    suggestedContribution: 59,
    currentContribution: 300,
    additionalContribution: 0,
    currentBalance: 10000,
    annualRatePercent: 6,
  },
]

const createAllocationsOnTrack = (): AccountAllocation[] => [
  {
    accountId: '1',
    accountName: 'Brokerage',
    suggestedContribution: 300,
    currentContribution: 400,
    additionalContribution: 0,
    currentBalance: 30000,
    annualRatePercent: 7,
  },
  {
    accountId: '2',
    accountName: 'Roth IRA',
    suggestedContribution: 100,
    currentContribution: 200,
    additionalContribution: 0,
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
      <AllocationSuggestions allocations={[]} frequency="monthly" isGoalMet={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders account names', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByText('Brokerage')).toBeTruthy()
    expect(screen.getByText('Roth IRA')).toBeTruthy()
  })

  it('renders additional contributions needed', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByText('+$450')).toBeTruthy()
    expect(screen.getByText('+$150')).toBeTruthy()
  })

  it('renders current contributions', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByText('Current: $300/month')).toBeTruthy()
    expect(screen.getByText('Current: $100/month')).toBeTruthy()
  })

  it('shows total additional in subtitle when needed', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByText(/Increase contributions by \$600\/month/)).toBeTruthy()
  })

  it('shows net increase in subtitle when decreases exist', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithNetIncrease()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByText(/Increase contributions by \$59\/month/)).toBeTruthy()
    expect(screen.getByText('+$59')).toBeTruthy()
  })

  it('shows on track message when no additional needed', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsOnTrack()}
        frequency="monthly"
        isGoalMet={true}
      />
    )
    expect(screen.getByText("You're On Track!")).toBeTruthy()
    expect(screen.getByText(/meet or exceed/)).toBeTruthy()
  })

  it('shows close-but-not-met message when goal not met but no net increase needed', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsOnTrack()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByText("You're On Track!")).toBeTruthy()
    expect(screen.getByText(/close but has not yet reached/)).toBeTruthy()
  })

  it('shows on track when goal met even if allocations suggest increases', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="monthly"
        isGoalMet={true}
      />
    )
    expect(screen.getByText("You're On Track!")).toBeTruthy()
    expect(screen.getByText(/meet or exceed/)).toBeTruthy()
  })

  it('hides accounts that exceed contribution room', () => {
    const allocations: AccountAllocation[] = [
      {
        accountId: '1',
        accountName: 'TFSA',
        suggestedContribution: 500,
        currentContribution: 200,
        additionalContribution: 300,
        currentBalance: 10000,
        annualRatePercent: 6,
        contributionRoomExceeded: true,
      },
      {
        accountId: '2',
        accountName: 'Brokerage',
        suggestedContribution: 400,
        currentContribution: 100,
        additionalContribution: 300,
        currentBalance: 8000,
        annualRatePercent: 5,
      },
    ]

    render(
      <AllocationSuggestions
        allocations={allocations}
        frequency="monthly"
        isGoalMet={false}
      />
    )

    expect(screen.queryByText('TFSA')).toBeNull()
    expect(screen.getByText('Brokerage')).toBeTruthy()
  })

  it('formats bi-weekly frequency correctly', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="bi-weekly"
        isGoalMet={false}
      />
    )
    expect(screen.getAllByText(/\/bi-week/).length).toBeGreaterThan(0)
  })

  it('formats annually frequency correctly', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="annually"
        isGoalMet={false}
      />
    )
    expect(screen.getAllByText(/\/year/).length).toBeGreaterThan(0)
  })

  it('renders as a list for accessibility', () => {
    render(
      <AllocationSuggestions
        allocations={createAllocationsWithAdditional()}
        frequency="monthly"
        isGoalMet={false}
      />
    )
    expect(screen.getByRole('list')).toBeTruthy()
  })
})
