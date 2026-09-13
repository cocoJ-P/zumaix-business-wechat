export type HealthResponse = {
  status: string
  service: string
  environment: string
  database: string
}

export type CurrentIdentityUser = {
  id: string
  display_name: string
  status: string
}

export type CurrentIdentityEnterprise = {
  id: string
  name: string
}

export type CurrentIdentityMembership = {
  id: string
  role: string
  status: string
}

export type CurrentIdentityResponse = {
  user: CurrentIdentityUser
  enterprise: CurrentIdentityEnterprise
  membership: CurrentIdentityMembership
}

export type BackendErrorBody = {
  code: string
  message: string
  details?: unknown
}

export type BackendErrorResponse = {
  error: BackendErrorBody
}

export type BackendStatus = 'unknown' | 'checking' | 'connected' | 'unavailable'

export type IdentityStatus = 'loading' | 'available' | 'unavailable'

export type AppGlobalData = {
  backendStatus: BackendStatus
  currentIdentity: CurrentIdentityResponse | null
  identityStatus: IdentityStatus
  identityErrorCode: string | null
  identityErrorMessage: string | null
}

export const INITIAL_APP_GLOBAL_DATA: AppGlobalData = {
  backendStatus: 'unknown',
  currentIdentity: null,
  identityStatus: 'loading',
  identityErrorCode: null,
  identityErrorMessage: null,
}

export type ContentInputType = 'url' | 'text'

export type IngestRequest = {
  content_type: ContentInputType
  content: string
}

export type NormalizedContent = {
  input_type: ContentInputType
  title?: string | null
  publisher?: string | null
  resolved_url?: string | null
  source_url?: string | null
  excerpt?: string | null
  fetch_status: string
  extraction_status: string
  warnings?: string[] | null
}

export type IngestSource = {
  id: string
  title?: string | null
  publisher?: string | null
}

export type IngestedContent = {
  id: string
}

export type IngestResponse = {
  normalized_content: NormalizedContent
  source: IngestSource
  ingestion: IngestedContent
}

export type AnalyzeRequest = {
  ingestion_id: string
  force: boolean
}

export type IntelligenceRun = {
  id: string
  status: string
  error_code?: string | null
  error_message?: string | null
}

export type IntelligenceAnalysis = {
  content_nature: string
  opportunity_relevance: string
  confidence: number
  warnings: string[]
}

export type SourceAssessment = {
  apparent_source_type: string
  marketing_level: string
  intermediary_level: string
  originality_claim?: string
}

export type ClaimedFunding = {
  description?: string | null
  amount?: number | null
}

export type ClaimedResourceValue = {
  funding?: ClaimedFunding | null
  scenario?: boolean | string | null
  financing?: string | null
  service?: string | null
  other?: string[]
}

export type ClaimedRequirement = {
  label: string
  description?: string | null
  expected_value?: unknown
  required?: boolean
}

export type OpportunityClaim = {
  claimed_type?: string | null
  claimed_title?: string | null
  claimed_issuer?: string | null
  claimed_region?: string | null
  claimed_publish_date?: string | null
  claimed_deadline?: string | null
  claimed_status?: string | null
  claimed_summary?: string | null
  claimed_resource_value?: ClaimedResourceValue | null
  claimed_requirements?: ClaimedRequirement[]
  claimed_required_materials?: string[]
  claimed_application_process?: string[]
  claimed_official_url?: string | null
}

export type IntelligenceEvidence = {
  id: string
  kind: string
  text: string
}

export type ContentIntelligenceResult = {
  analysis: IntelligenceAnalysis
  source_assessment: SourceAssessment
  opportunity_claim: OpportunityClaim | null
  evidence: IntelligenceEvidence[]
}

export type IntelligenceAnalyzeResponse = {
  run: IntelligenceRun
  reused: boolean
  intelligence_result: ContentIntelligenceResult | null
}
