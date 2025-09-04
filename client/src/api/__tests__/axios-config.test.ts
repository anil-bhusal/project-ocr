import { describe, it, expect } from 'vitest'
import { apiClient } from '../axios-config'

describe('axios-config', () => {
  it('should export apiClient', () => {
    expect(apiClient).toBeDefined()
  })

  it('should have correct base configuration', () => {
    expect(apiClient.defaults).toBeDefined()
    expect(apiClient.defaults.headers).toBeDefined()
  })

  it('should have request interceptor', () => {
    expect(apiClient.interceptors.request).toBeDefined()
  })

  it('should have response interceptor', () => {
    expect(apiClient.interceptors.response).toBeDefined()
  })

  it('should have standard axios methods', () => {
    expect(typeof apiClient.get).toBe('function')
    expect(typeof apiClient.post).toBe('function')
    expect(typeof apiClient.put).toBe('function')
    expect(typeof apiClient.delete).toBe('function')
  })
})