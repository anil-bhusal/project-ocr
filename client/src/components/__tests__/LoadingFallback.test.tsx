import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingFallback } from '../LoadingFallback'

describe('LoadingFallback', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingFallback />)
    expect(container.firstChild).toBeTruthy()
  })

  it('displays default loading text', () => {
    const { getByText } = render(<LoadingFallback />)
    expect(getByText(/Loading Component/i)).toBeTruthy()
  })

  it('displays custom component name', () => {
    const { getByText } = render(<LoadingFallback name="OCR Processor" />)
    expect(getByText(/Loading OCR Processor/i)).toBeTruthy()
  })

  it('renders with different sizes', () => {
    const { rerender, container } = render(<LoadingFallback size="small" />)
    expect(container.firstChild).toBeTruthy()
    
    rerender(<LoadingFallback size="large" />)
    expect(container.firstChild).toBeTruthy()
  })
})