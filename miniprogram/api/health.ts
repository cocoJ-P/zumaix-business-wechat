import { request } from './client'
import type { HealthResponse } from './types'

export function getBackendHealth(): Promise<HealthResponse> {
  return request<HealthResponse>({
    path: '/api/health',
    method: 'GET',
    timeout: 8_000,
  })
}
