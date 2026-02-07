import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import GlobalTermInput from './GlobalTermInput'

const renderComponent = (props: Partial<{ termYears: number; onChange: (v: number) => void }> = {}) => {
  const defaultProps = { termYears: 10, onChange: vi.fn() }
  const merged = { ...defaultProps, ...props }
  const result = render(<GlobalTermInput {...merged} />)
  const input = result.container.querySelector<HTMLInputElement>('#global-term-years')!
  return { ...result, input, onChange: merged.onChange }
}

describe('GlobalTermInput', () => {
  it('renders with initial value', () => {
    const { input } = renderComponent({ termYears: 10 })
    expect(input.value).toBe('10')
  })

  it('calls onChange with valid value', () => {
    const { input, onChange } = renderComponent()
    fireEvent.change(input, { target: { value: '20' } })
    expect(onChange).toHaveBeenCalledWith(20)
  })

  it('does not call onChange for values below minimum', () => {
    const { input, onChange } = renderComponent()
    fireEvent.change(input, { target: { value: '0' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not call onChange for values above maximum', () => {
    const { input, onChange } = renderComponent()
    fireEvent.change(input, { target: { value: '101' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows error message for invalid input', () => {
    const { container, input } = renderComponent()
    fireEvent.change(input, { target: { value: '0' } })
    const helpText = container.querySelector('#global-term-years-help')
    expect(helpText?.textContent).toMatch(/Enter a value between 1 and 100/)
  })

  it('shows help text as tooltip for valid input', () => {
    const { container } = renderComponent()
    const infoIcon = container.querySelector('.field-label__info')
    expect(infoIcon?.getAttribute('title')).toBe('Applies to all accounts')
  })

  it('sets aria-invalid on error', () => {
    const { input } = renderComponent()
    fireEvent.change(input, { target: { value: '0' } })
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('has aria-describedby pointing to help text on error', () => {
    const { input } = renderComponent()
    expect(input.getAttribute('aria-describedby')).toBeNull()
    fireEvent.change(input, { target: { value: '0' } })
    expect(input.getAttribute('aria-describedby')).toBe('global-term-years-help')
  })
})
