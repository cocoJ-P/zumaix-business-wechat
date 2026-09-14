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

export type SubmissionStatus =
  | 'pending'
  | 'ingesting'
  | 'analyzing'
  | 'succeeded'
  | 'failed'

export type SubmissionFailureStage = 'ingest' | 'analyze' | null

export type CreateUserSubmissionRequest = {
  input_type: ContentInputType
  content: string
}

export type SubmissionActor = {
  id: string
  display_name: string
}

export type SubmissionOriginType = 'user_input' | 'discovery'

export type CreateUserSubmissionResponse = {
  id: string
  status: SubmissionStatus
  input_type: ContentInputType
  input_preview: string
  origin_type: SubmissionOriginType
  origin_discovery_id: string | null
  created_at: string
  user: SubmissionActor
  enterprise: CurrentIdentityEnterprise
}

export type UserSubmissionSummary = {
  id: string
  status: SubmissionStatus
  failure_stage: SubmissionFailureStage
  input_type: ContentInputType
  input_preview: string
  display_title: string
  submitted_by: SubmissionActor
  origin_type: SubmissionOriginType
  origin_discovery_id: string | null
  source_id: string | null
  ingestion_id: string | null
  intelligence_run_id: string | null
  created_at: string
  completed_at: string | null
}

export type UserSubmissionListResponse = {
  items: UserSubmissionSummary[]
  limit: number
  offset: number
}

export type UserSubmission = {
  id: string
  status: SubmissionStatus
  failure_stage: SubmissionFailureStage
  input_type: ContentInputType
  input_preview?: string
  origin_type?: SubmissionOriginType
  origin_discovery_id?: string | null
  created_at?: string
  completed_at?: string | null
  error_code?: string | null
  error_message?: string | null
}

export type SubmissionContentSummary = {
  title?: string | null
  publisher?: string | null
  resolved_url?: string | null
  excerpt?: string | null
  fetch_status?: string | null
  extraction_status?: string | null
  warnings?: string[]
}

export type SubmissionIntelligenceSummary = {
  run_id: string
  status: string
  result: ContentIntelligenceResult | null
}

export type UserSubmissionDetail = {
  submission: UserSubmission
  submitted_by?: SubmissionActor
  enterprise?: CurrentIdentityEnterprise
  content: SubmissionContentSummary | null
  intelligence: SubmissionIntelligenceSummary | null
}

export type DiscoveryStatus = 'active' | 'withdrawn'

export type DiscoveryPriority = 'high' | 'normal' | 'low'

export type DiscoveryReferenceType = 'opportunity' | 'source' | 'manual'

export type DiscoveryOpportunityType =
  | 'policy'
  | 'competition'
  | 'financial_service'
  | 'equity_funding'
  | 'park_service'
  | 'scenario'
  | 'other'

export type DiscoveryActor = {
  id: string
  display_name: string
}

export type DiscoveryItemSummary = {
  id: string
  status: DiscoveryStatus
  priority: DiscoveryPriority
  reference_type: DiscoveryReferenceType
  opportunity_id: string | null
  source_id: string | null
  title: string
  summary: string | null
  reason: string | null
  opportunity_type: DiscoveryOpportunityType | null
  issuer: string | null
  region: string | null
  deadline: string | null
  reference_url: string | null
  created_by: DiscoveryActor | null
  created_at: string
}

export type DiscoveryItemListResponse = {
  items: DiscoveryItemSummary[]
  limit: number
  offset: number
}

export type DiscoveryDisposition = 'saved' | 'deprioritized'

export type DiscoveryCurrentUserState = {
  seen_at: string | null
  disposition: DiscoveryDisposition | null
  disposition_at?: string | null
}

export type DiscoveryFeedItem = {
  id: string
  status: DiscoveryStatus
  priority: DiscoveryPriority
  reference_type: DiscoveryReferenceType
  title: string
  summary: string | null
  reason: string | null
  opportunity_type: DiscoveryOpportunityType | null
  issuer: string | null
  region: string | null
  deadline: string | null
  reference_url: string | null
  created_at: string
  opportunity_id?: string | null
  current_user_state: DiscoveryCurrentUserState | null
}

export type DiscoveryFeedResponse = {
  items: DiscoveryFeedItem[]
  limit: number
  offset: number
}

export type DiscoveryUserStateResponse = {
  discovery_id: string
  user_id: string
  seen_at: string | null
  disposition: DiscoveryDisposition | null
  disposition_at: string | null
  updated_at?: string | null
}

export type UpdateDiscoveryDispositionRequest = {
  disposition: DiscoveryDisposition
}

export type AcceptDiscoveryResponse = {
  created: boolean
  user_state: DiscoveryUserStateResponse
  submission: CreateUserSubmissionResponse
}
