import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import InflationControls from './InflationControls'
import type { InflationState } from '../types/inflation'

const defaultInflationState: InflationState = {
  isEnabled: false,
  annualRatePercent: 2.5,
}

describe('InflationControls', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders toggle button with "Real values off" when disabled', () => {
    render(
      <InflationControls
        inflationState={defaultInflationState}
        onUpdate={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Real values off' })).toBeTruthy()
  })

  it('renders toggle button with "Real values on" when enabled', () => {
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Real values on' })).toBeTruthy()
  })

  it('calls onUpdate with isEnabled: true when toggle is clicked', () => {
    const handleUpdate = vi.fn()
    render(
      <InflationControls
        inflationState={defaultInflationState}
        onUpdate={handleUpdate}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Real values off' }))
    expect(handleUpdate).toHaveBeenCalledWith({ isEnabled: true })
  })

  it('calls onUpdate with isEnabled: false when toggle is clicked while enabled', () => {
    const handleUpdate = vi.fn()
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={handleUpdate}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Real values on' }))
    expect(handleUpdate).toHaveBeenCalledWith({ isEnabled: false })
  })

  it('shows inflation rate input when enabled', () => {
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={() => {}}
      />,
    )

    expect(screen.getByLabelText('Inflation rate (%)')).toBeTruthy()
    expect(screen.getByDisplayValue('2.5')).toBeTruthy()
  })

  it('hides inflation rate input when disabled', () => {
    render(
      <InflationControls
        inflationState={defaultInflationState}
        onUpdate={() => {}}
      />,
    )

    expect(screen.queryByLabelText('Inflation rate (%)')).toBeNull()
  })

  it('calls onUpdate with new rate when input changes', () => {
    const handleUpdate = vi.fn()
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={handleUpdate}
      />,
    )

    fireEvent.change(screen.getByLabelText('Inflation rate (%)'), {
      target: { value: '3.5' },
    })

    expect(handleUpdate).toHaveBeenCalledWith({ annualRatePercent: 3.5 })
  })

  it('does not call onUpdate for invalid rate values', () => {
    const handleUpdate = vi.fn()
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={handleUpdate}
      />,
    )

    fireEvent.change(screen.getByLabelText('Inflation rate (%)'), {
      target: { value: '20' },
    })

    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('shows error message for invalid rate', () => {
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText('Inflation rate (%)'), {
      target: { value: '20' },
    })

    expect(screen.getByText(/Enter a rate between 0% and 15%/)).toBeTruthy()
  })

  it('has correct aria-pressed attribute on toggle', () => {
    const { rerender } = render(
      <InflationControls
        inflationState={defaultInflationState}
        onUpdate={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Real values off' }).getAttribute('aria-pressed'),
    ).toBe('false')

    rerender(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Real values on' }).getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('has accessible label for inflation rate input', () => {
    render(
      <InflationControls
        inflationState={{ ...defaultInflationState, isEnabled: true }}
        onUpdate={() => {}}
      />,
    )

    const input = screen.getByLabelText('Inflation rate (%)')
    expect(input.getAttribute('aria-describedby')).toBe('inflation-rate-help')
  })
})
