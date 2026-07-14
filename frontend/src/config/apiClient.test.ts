import { describe, it, expect } from 'vitest'
import { apiClient } from './apiClient'

describe('apiClient Configuration', () => {
  it('should have application/json content-type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
  })

  it('should have a default timeout of 10 seconds', () => {
    expect(apiClient.defaults.timeout).toBe(10000)
  })
})
