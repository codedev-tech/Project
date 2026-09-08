import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import AppErrorBoundary from './AppErrorBoundary'
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('shows a reload fallback without exposing technical errors or claiming a save failed', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  function BrokenPage() { throw new Error('Technical stack details') }
  render(<AppErrorBoundary><BrokenPage /></AppErrorBoundary>)
  expect(screen.getByRole('heading')).toHaveTextContent('This page could not be displayed')
  expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
  expect(screen.getByText(/check the record before submitting/i)).toBeInTheDocument()
  expect(screen.queryByText(/Technical stack/)).toBeNull()
})
