import { REQUEST_TIMEOUT_MS } from './config'
import { request } from './client'
import type {
  AcceptDiscoveryResponse,
  DiscoveryDisposition,
  DiscoveryFeedResponse,
  DiscoveryUserStateResponse,
  UpdateDiscoveryDispositionRequest,
} from './types'

const DISCOVERY_FEED_LIMIT = 20

export function listDiscoveryFeed(): Promise<DiscoveryFeedResponse> {
  return request<DiscoveryFeedResponse>({
    path: `/api/discoveries/feed?limit=${DISCOVERY_FEED_LIMIT}&offset=0`,
    method: 'GET',
    timeout: REQUEST_TIMEOUT_MS,
  })
}

export function acceptDiscovery(discoveryId: string): Promise<AcceptDiscoveryResponse> {
  return request<AcceptDiscoveryResponse>({
    path: `/api/discoveries/${discoveryId}/accept`,
    method: 'POST',
    timeout: REQUEST_TIMEOUT_MS,
  })
}

export function markDiscoverySeen(
  discoveryId: string
): Promise<DiscoveryUserStateResponse> {
  return request<DiscoveryUserStateResponse>({
    path: `/api/discoveries/${discoveryId}/seen`,
    method: 'POST',
    timeout: REQUEST_TIMEOUT_MS,
  })
}

export function updateDiscoveryDisposition(
  discoveryId: string,
  disposition: DiscoveryDisposition
): Promise<DiscoveryUserStateResponse> {
  const data: UpdateDiscoveryDispositionRequest = { disposition }
  return request<DiscoveryUserStateResponse>({
    path: `/api/discoveries/${discoveryId}/user-state`,
    method: 'PATCH',
    data,
    timeout: REQUEST_TIMEOUT_MS,
  })
}
