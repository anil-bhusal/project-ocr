import { describe, it, expect } from 'vitest'
import App from '../App'
import { render } from '../test/test-utils'

describe('App', () => {
  it('renders the OCR uploader component', () => {
    render(<App />)
    
    // Check if file input is present
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('has the App class name', () => {
    render(<App />)
    
    const appDiv = document.querySelector('.App')
    expect(appDiv).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })
})