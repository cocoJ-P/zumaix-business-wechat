import { REQUEST_TIMEOUT_MS } from './config'
import { request } from './client'
import type { DiscoveryItemListResponse } from './types'

const DISCOVERY_FEED_LIMIT = 20

export function listDiscoveries(): Promise<DiscoveryItemListResponse> {
  return request<DiscoveryItemListResponse>({
    path: `/api/discoveries?status=active&limit=${DISCOVERY_FEED_LIMIT}&offset=0`,
    method: 'GET',
    timeout: REQUEST_TIMEOUT_MS,
  })
}
