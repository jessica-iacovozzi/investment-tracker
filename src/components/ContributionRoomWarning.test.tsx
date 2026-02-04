import { describe, expect, it } from 'vitest'
import { render, within } from '@testing-library/react'
import type { OverContributionDetails } from '../utils/contributionRoom'
import ContributionRoomWarning from './ContributionRoomWarning'

const buildOverContributionDetails = (
  overrides: Partial<OverContributionDetails> = {},
): OverContributionDetails => ({
  exceedsRoom: true,
  excessAmount: 5000,
  yearOfOverContribution: 2,
  monthOfOverContribution: 6,
  estimatedPenalty: 350,
  ...overrides,
})

describe('ContributionRoomWarning', () => {
  it('renders nothing when exceedsRoom is false', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails({ exceedsRoom: false })}
        accountType="tfsa"
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders warning when exceedsRoom is true', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails()}
        accountType="tfsa"
      />,
    )

    expect(within(container).getByRole('alert')).toBeTruthy()
    expect(within(container).getByText(/Over-contribution warning/)).toBeTruthy()
  })

  it('displays excess amount', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails({ excessAmount: 5000 })}
        accountType="tfsa"
      />,
    )

    expect(within(container).getByText(/\$5,000/)).toBeTruthy()
  })

  it('displays account type in uppercase', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails()}
        accountType="tfsa"
      />,
    )

    expect(within(container).getByText(/TFSA contribution room/)).toBeTruthy()
  })

  it('displays timing information when available', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails({
          yearOfOverContribution: 2,
          monthOfOverContribution: 6,
        })}
        accountType="rrsp"
      />,
    )

    expect(within(container).getByText(/June of year 2/)).toBeTruthy()
  })

  it('displays estimated penalty when available', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails({ estimatedPenalty: 350 })}
        accountType="tfsa"
      />,
    )

    expect(within(container).getByText(/Estimated CRA penalty/)).toBeTruthy()
    expect(within(container).getByText(/\$350/)).toBeTruthy()
  })

  it('hides penalty section when penalty is 0', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails({ estimatedPenalty: 0 })}
        accountType="tfsa"
      />,
    )

    expect(within(container).queryByText(/Estimated CRA penalty/)).toBeNull()
  })

  it('has appropriate ARIA attributes for accessibility', () => {
    const { container } = render(
      <ContributionRoomWarning
        overContributionDetails={buildOverContributionDetails()}
        accountType="tfsa"
      />,
    )

    const alert = within(container).getByRole('alert')
    expect(alert.getAttribute('aria-live')).toBe('polite')
  })
})
