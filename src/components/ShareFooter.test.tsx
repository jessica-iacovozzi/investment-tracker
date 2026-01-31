import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ShareFooter from './ShareFooter'

describe('ShareFooter', () => {
  it('renders share and privacy copy', () => {
    render(<ShareFooter shareUrl="https://example.com" />)

    expect(screen.getByText('Share this app')).toBeTruthy()
    expect(screen.getByText('Data stays in your browser.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'https://example.com' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeTruthy()
  })
})
