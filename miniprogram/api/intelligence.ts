import { ANALYZE_TIMEOUT_MS } from './config'
import { request } from './client'
import type { AnalyzeRequest, IntelligenceAnalyzeResponse } from './types'

export function analyzeOpportunitySource(
  sourceId: string,
  input: AnalyzeRequest
): Promise<IntelligenceAnalyzeResponse> {
  return request<IntelligenceAnalyzeResponse>({
    path: `/api/opportunity-sources/${sourceId}/analyze`,
    method: 'POST',
    data: input,
    timeout: ANALYZE_TIMEOUT_MS,
  })
}
