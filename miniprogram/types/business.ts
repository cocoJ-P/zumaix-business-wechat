export type OpportunityKind =
  | 'competition'
  | 'policy'
  | 'financial_service'
  | 'equity_funding'
  | 'park_service'
  | 'scenario'

export type ContentNature =
  | 'official'
  | 'official_repost'
  | 'media_repost'
  | 'marketing'
  | 'intermediary'
  | 'unverified'

export type QualificationStatus = 'confirmed' | 'failed' | 'unknown' | 'not_applicable'

export type AdviceKind =
  | 'strong_recommend'
  | 'recommend'
  | 'need_review'
  | 'low_priority'
  | 'not_eligible'

export type LeadStatus = 'pending' | 'approved' | 'on_hold' | 'ignored'

export type PrepCost = '低' | '中' | '高'

export type StrategicLevel = '高' | '中' | '低'

export interface ProvenanceNode {
  role: string
  name: string
}

export interface IntelligenceResult {
  caseId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  nature: ContentNature
  natureLabel: string
  submittedKindLabel: string
  marketingLevel?: string
  hasRealPolicy: boolean
  mustUseAgency?: string
  foundOpportunity: boolean
  foundMessage: string
  opportunityId?: string
  caution?: string
  provenance: ProvenanceNode[]
  officialPublisher?: string
  officialDocument?: string
  publishedAt?: string
  verified: boolean
  notOriginal?: boolean
}

export interface QualificationItem {
  id: string
  label: string
  status: QualificationStatus
  mark: string
}

export interface MatchingResult {
  score: number
  advice: AdviceKind
  adviceLabel: string
  adviceDetail: string
  strategicLevel: StrategicLevel
  strategicReason: string
  qualifications: QualificationItem[]
  deadlineLabel: string
  daysLeft?: number
  expired?: boolean
  requiredMaterials: number
  ownedMaterials: number
  pendingMaterials: number
  prepCost: PrepCost
  referenceOnly?: boolean
}

export interface OpportunityRecord {
  id: string
  kind: OpportunityKind
  typeLabel: string
  title: string
  publisher: string
  deadline: string
  statusLabel: string
  verified: boolean
  expired?: boolean
  matching: MatchingResult
  seedSubmissionCount: number
  following?: boolean
  followStage?: string
}

export interface EnterpriseState {
  enterpriseId: string
  name: string
  registrationRegion: string
  establishedAt: string
  enterpriseType: string
  industry: string
  productStage: string
  businessStage: string
  teamSize: string
  revenueStage: string
  fundingStage: string
  ipCount: number
  qualifications: string[]
  currentGoal: string
  currentConstraint: string
  recentEvents: string[]
  availableMaterials: string[]
}

export interface LeadSubmitter {
  name: string
  isCurrentUser?: boolean
}

export interface EnterpriseLead {
  leadId: string
  enterpriseId: string
  opportunityId: string
  title: string
  status: LeadStatus
  submissionCount: number
  submittedByCurrentUser: boolean
  submitters: LeadSubmitter[]
  createdAt: string
  updatedAt: string
}
