import { describe, it, expect } from 'vitest'
import { ImageViewer } from '../ImageViewer'

describe('ImageViewer', () => {
  it('should be defined', () => {
    expect(ImageViewer).toBeDefined()
  })

  it('should be a function component', () => {
    expect(typeof ImageViewer).toBe('function')
  })
})