export const OPPORTUNITY_GROUPS = [
  '创赛',
  '政策',
  '金融服务',
  '融资',
  '园区服务',
] as const

export type OpportunityType = (typeof OPPORTUNITY_GROUPS)[number]

export type StatusTagText =
  | OpportunityType
  | '场景'
  | '高匹配'
  | '进行中'
  | '等待结果'

export type StatusTagTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning'

export interface Opportunity {
  id: string
  type: OpportunityType
  title: string
  summary?: string
  matchScore: number
  deadline: string
  status?: StatusTagText
}

export type NotificationKind = OpportunityType | '场景' | '系统'

export interface OpportunityGroup {
  type: OpportunityType
  items: Opportunity[]
}

export interface SmartNotification {
  id: string
  kind: NotificationKind
  content: string
  timeLabel: string
  unread: boolean
}

export interface ApplicationSummary {
  id: string
  title: string
  stage: string
  deadline?: string
  opportunityId?: string
}

export type CheckInputKind = 'url' | 'text'

export interface CheckInput {
  raw: string
  kind: CheckInputKind
}

export type HomeViewState = 'loading' | 'success' | 'empty' | 'error'

export type DiscoveryKind =
  | OpportunityType
  | '场景'
  | '场景机会'
  | '股权融资'
  | '其他'
  | '内容'
  | '推荐'

export interface DiscoveryItem {
  id: string
  kind: DiscoveryKind | ''
  eventStatus: string
  title: string
  reason: string
  opportunityId?: string
  summary?: string
  issuerLabel?: string
  issuer?: string
  region?: string
  deadlineText?: string
  hasReferenceSource?: boolean
  seenAt?: string | null
  visualState?: 'fresh' | 'deprioritized'
  backgroundImage?: string
}

export type RecommendedSubmissionStatus =
  | 'pending'
  | 'ingesting'
  | 'analyzing'
  | 'succeeded'
  | 'failed'
  | 'checking'

export type RecommendedDisplayStatus =
  | 'pending'
  | 'ingesting'
  | 'analyzing'
  | 'failed'
  | 'succeeded'
  | 'awaiting_service'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'checking'
  | 'handling'

export type RecommendedServiceCaseStatus = 'open' | 'in_progress' | 'completed' | 'closed'

export type RecommendedItem = {
  id: string
  title: string
  status: RecommendedSubmissionStatus
  displayStatus: RecommendedDisplayStatus
  statusText: string
  statusHint: string
  statusTone: 'brand' | 'muted' | 'complete' | 'neutral' | 'warning'
  isTerminal: boolean
  serviceCaseStatus: RecommendedServiceCaseStatus | null
  canContinueToService: boolean
  preview: string
  originText: string
  timeText: string
  originType: 'user_input' | 'discovery'
  originDiscoveryId?: string | null
  tempDiscoveryId?: string
  listKey: string
}

export type InboxStatus = 'analyzing' | 'waiting' | 'done'

export type InboxSource = 'swipe' | 'link' | 'text' | 'clipboard' | 'file'

export interface InboxItem {
  id: string
  title: string
  status: InboxStatus
  source: InboxSource
  note?: string
  opportunityId?: string
  analyzeStep?: number
}

export type {
  AdviceKind,
  ContentNature,
  EnterpriseLead,
  EnterpriseState,
  IntelligenceResult,
  LeadStatus,
  MatchingResult,
  OpportunityKind,
  OpportunityRecord,
  ProvenanceNode,
  QualificationItem,
  QualificationStatus,
} from './business'
