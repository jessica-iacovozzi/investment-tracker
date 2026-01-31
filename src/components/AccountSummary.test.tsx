import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AccountSummary from './AccountSummary'

const totals = {
  totalContributions: 1200,
  totalReturns: 800,
  finalBalance: 2000,
}

describe('AccountSummary', () => {
  it('updates the final value label when age and term change', () => {
    const { rerender } = render(
      <AccountSummary totals={totals} currentAge={undefined} termYears={10} />,
    )

    expect(screen.getByText('Final value')).toBeTruthy()

    rerender(<AccountSummary totals={totals} currentAge={30} termYears={10} />)

    expect(screen.getByText('Final value at 40 years old')).toBeTruthy()
  })
})
