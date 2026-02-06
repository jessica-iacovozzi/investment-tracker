import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ViewToggle from './ViewToggle'

afterEach(cleanup)

describe('ViewToggle', () => {
  it('renders both tabs', () => {
    render(<ViewToggle activeView="cards" onChange={vi.fn()} />)

    expect(screen.getByRole('tab', { name: 'Cards' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'List' })).toBeDefined()
  })

  it('highlights the active tab with aria-selected', () => {
    render(<ViewToggle activeView="list" onChange={vi.fn()} />)

    expect(screen.getByRole('tab', { name: 'List' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Cards' }).getAttribute('aria-selected')).toBe('false')
  })

  it('sets tabIndex 0 on active tab and -1 on inactive', () => {
    render(<ViewToggle activeView="cards" onChange={vi.fn()} />)

    expect(screen.getByRole('tab', { name: 'Cards' }).getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: 'List' }).getAttribute('tabindex')).toBe('-1')
  })

  it('calls onChange when clicking a tab', () => {
    const handleChange = vi.fn()
    render(<ViewToggle activeView="cards" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('tab', { name: 'List' }))

    expect(handleChange).toHaveBeenCalledWith('list')
  })

  it('navigates to next tab with ArrowRight', () => {
    const handleChange = vi.fn()
    render(<ViewToggle activeView="cards" onChange={handleChange} />)

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Cards' }), { key: 'ArrowRight' })

    expect(handleChange).toHaveBeenCalledWith('list')
  })

  it('navigates to previous tab with ArrowLeft', () => {
    const handleChange = vi.fn()
    render(<ViewToggle activeView="list" onChange={handleChange} />)

    fireEvent.keyDown(screen.getByRole('tab', { name: 'List' }), { key: 'ArrowLeft' })

    expect(handleChange).toHaveBeenCalledWith('cards')
  })

  it('wraps around from last to first tab with ArrowRight', () => {
    const handleChange = vi.fn()
    render(<ViewToggle activeView="list" onChange={handleChange} />)

    fireEvent.keyDown(screen.getByRole('tab', { name: 'List' }), { key: 'ArrowRight' })

    expect(handleChange).toHaveBeenCalledWith('cards')
  })

  it('wraps around from first to last tab with ArrowLeft', () => {
    const handleChange = vi.fn()
    render(<ViewToggle activeView="cards" onChange={handleChange} />)

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Cards' }), { key: 'ArrowLeft' })

    expect(handleChange).toHaveBeenCalledWith('list')
  })

  it('renders a tablist container with accessible label', () => {
    render(<ViewToggle activeView="cards" onChange={vi.fn()} />)

    const tablist = screen.getByRole('tablist', { name: 'Account view' })
    expect(tablist).toBeDefined()
  })
})
