import { describe, expect, it, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import AccountSummary from './AccountSummary'
import type { ProjectionTotals } from '../types/investment'
import type { ContributionRoomResult } from '../utils/contributionRoom'

const totals: ProjectionTotals = {
  totalContributions: 1200,
  totalReturns: 800,
  finalBalance: 2000,
}

const buildContributionRoomResult = (
  overrides: Partial<ContributionRoomResult> = {},
): ContributionRoomResult => ({
  projectedContributions: 12000,
  availableRoom: 20000,
  remainingRoom: 8000,
  overContributionDetails: {
    exceedsRoom: false,
    excessAmount: 0,
  },
  ...overrides,
})

const totalsWithInflation: ProjectionTotals = {
  totalContributions: 1200,
  totalReturns: 800,
  finalBalance: 2000,
  realTotalContributions: 900,
  realTotalReturns: 600,
  realFinalBalance: 1500,
}

describe('AccountSummary', () => {
  afterEach(() => {
    cleanup()
  })
  it('updates the final value label when age and term change', () => {
    const { rerender } = render(
      <AccountSummary totals={totals} currentAge={undefined} termYears={10} />,
    )

    expect(screen.getByText('Final value')).toBeTruthy()

    rerender(<AccountSummary totals={totals} currentAge={30} termYears={10} />)

    expect(screen.getByText('Final value at 40 years old')).toBeTruthy()
  })

  it('displays nominal values when inflation is disabled', () => {
    render(
      <AccountSummary
        totals={totalsWithInflation}
        currentAge={undefined}
        termYears={10}
        inflationEnabled={false}
      />,
    )

    expect(screen.getByText('Total contributions')).toBeTruthy()
    expect(screen.getByText('$1,200')).toBeTruthy()
    expect(screen.getByText('Total returns')).toBeTruthy()
    expect(screen.getByText('$800')).toBeTruthy()
    expect(screen.getByText('Final value')).toBeTruthy()
    expect(screen.getByText('$2,000')).toBeTruthy()
  })

  it('displays real values with suffix when inflation is enabled', () => {
    render(
      <AccountSummary
        totals={totalsWithInflation}
        currentAge={undefined}
        termYears={10}
        inflationEnabled={true}
      />,
    )

    expect(screen.getByText("Total contributions (today's $)")).toBeTruthy()
    expect(screen.getByText('$900')).toBeTruthy()
    expect(screen.getByText("Total returns (today's $)")).toBeTruthy()
    expect(screen.getByText('$600')).toBeTruthy()
    expect(screen.getByText("Final value (today's $)")).toBeTruthy()
    expect(screen.getByText('$1,500')).toBeTruthy()
  })

  it('falls back to nominal values when real values are undefined', () => {
    render(
      <AccountSummary
        totals={totals}
        currentAge={undefined}
        termYears={10}
        inflationEnabled={true}
      />,
    )

    expect(screen.getByText("Total contributions (today's $)")).toBeTruthy()
    expect(screen.getByText('$1,200')).toBeTruthy()
  })

  it('combines age label with inflation suffix', () => {
    render(
      <AccountSummary
        totals={totalsWithInflation}
        currentAge={30}
        termYears={10}
        inflationEnabled={true}
      />,
    )

    expect(screen.getByText("Final value at 40 years old (today's $)")).toBeTruthy()
  })

  describe('Contribution Room', () => {
    it('hides contribution room section for non-registered accounts', () => {
      const { container } = render(
        <AccountSummary
          totals={totals}
          termYears={10}
          accountType="non-registered"
          contributionRoomResult={buildContributionRoomResult()}
        />,
      )

      expect(within(container).queryByText('Contribution Room')).toBeNull()
    })

    it('shows contribution room section for TFSA accounts', () => {
      const { container } = render(
        <AccountSummary
          totals={totals}
          termYears={10}
          accountType="tfsa"
          contributionRoom={7000}
          contributionRoomResult={buildContributionRoomResult()}
        />,
      )

      expect(within(container).getByText('Contribution Room')).toBeTruthy()
      expect(within(container).getByText('Current contribution room')).toBeTruthy()
      expect(within(container).getByText('$7,000')).toBeTruthy()
    })

    it('shows available and remaining room', () => {
      const { container } = render(
        <AccountSummary
          totals={totals}
          termYears={10}
          accountType="rrsp"
          contributionRoom={10000}
          contributionRoomResult={buildContributionRoomResult({
            availableRoom: 25000,
            remainingRoom: 13000,
          })}
        />,
      )

      expect(within(container).getByText('Available room (with annual increases)')).toBeTruthy()
      expect(within(container).getByText('$25,000')).toBeTruthy()
      expect(within(container).getByText('Remaining room after contributions')).toBeTruthy()
      expect(within(container).getByText('$13,000')).toBeTruthy()
    })

    it('shows FHSA lifetime progress', () => {
      const { container } = render(
        <AccountSummary
          totals={totals}
          termYears={10}
          accountType="fhsa"
          contributionRoom={8000}
          contributionRoomResult={buildContributionRoomResult()}
          fhsaLifetimeContributions={16000}
        />,
      )

      expect(within(container).getByText('FHSA lifetime progress')).toBeTruthy()
      expect(within(container).getByText('$16,000 of $40,000')).toBeTruthy()
    })

    it('shows warning when over-contribution detected', () => {
      const { container } = render(
        <AccountSummary
          totals={totals}
          termYears={10}
          accountType="tfsa"
          contributionRoom={5000}
          contributionRoomResult={buildContributionRoomResult({
            remainingRoom: -3000,
            overContributionDetails: {
              exceedsRoom: true,
              excessAmount: 3000,
              yearOfOverContribution: 2,
              monthOfOverContribution: 6,
            },
          })}
        />,
      )

      expect(within(container).getByRole('alert')).toBeTruthy()
      expect(within(container).getByText(/Over-contribution warning/)).toBeTruthy()
    })

    it('applies negative styling to negative remaining room', () => {
      const { container } = render(
        <AccountSummary
          totals={totals}
          termYears={10}
          accountType="tfsa"
          contributionRoom={5000}
          contributionRoomResult={buildContributionRoomResult({
            remainingRoom: -3000,
            overContributionDetails: {
              exceedsRoom: true,
              excessAmount: 3000,
            },
          })}
        />,
      )

      const negativeItem = container.querySelector('.summary-card__item--negative')
      expect(negativeItem).toBeTruthy()
    })
  })
})
