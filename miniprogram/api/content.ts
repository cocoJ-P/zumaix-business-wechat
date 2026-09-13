import { INGEST_TIMEOUT_MS } from './config'
import { request } from './client'
import type { IngestRequest, IngestResponse } from './types'

export function ingestContent(input: IngestRequest): Promise<IngestResponse> {
  return request<IngestResponse>({
    path: '/api/content/ingest',
    method: 'POST',
    data: input,
    timeout: INGEST_TIMEOUT_MS,
  })
}
