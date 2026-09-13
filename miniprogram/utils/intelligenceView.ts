import type { ApiError } from '../api/errors'
import type {
  ClaimedRequirement,
  ClaimedResourceValue,
  ContentInputType,
  IngestResponse,
  IntelligenceAnalyzeResponse,
  IntelligenceEvidence,
  OpportunityClaim,
} from '../api/types'

export type CheckPhase = 'idle' | 'ingesting' | 'analyzing' | 'success' | 'error'
export type ErrorStage = 'ingest' | 'analyze' | null

export type SourcePreviewView = {
  kind: ContentInputType
  title: string
  publisher: string
  url: string
  excerpt: string
}

export type FactView = {
  key: string
  label: string
  value: string
}

export type EvidenceView = {
  key: string
  kindLabel: string
  text: string
}

export type IntelligenceViewModel = {
  sourcePreview: SourcePreviewView
  analysisFacts: FactView[]
  sourceFacts: FactView[]
  claimPresent: boolean
  claimTitle: string
  claimFacts: FactView[]
  claimSummary: string
  resources: string[]
  officialUrl: string
  requirements: string[]
  materials: string[]
  process: string[]
  evidence: EvidenceView[]
  warnings: string[]
  emptyResult: boolean
}

const CONTENT_NATURE_LABEL: Record<string, string> = {
  opportunity_announcement: '机会发布',
  opportunity_interpretation: '机会解读',
  news_report: '新闻报道',
  marketing_content: '营销内容',
  service_content: '服务内容',
  general_information: '一般资讯',
  mixed: '混合内容',
  unknown: '暂无法判断',
}

const OPPORTUNITY_RELEVANCE_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
  none: '未发现明确机会',
  unknown: '暂无法判断',
}

const APPARENT_SOURCE_LABEL: Record<string, string> = {
  official_like: '类官方来源',
  media_like: '类媒体来源',
  service_provider_like: '类服务机构来源',
  individual_like: '类个人来源',
  unknown: '暂无法判断',
}

const MARKETING_LEVEL_LABEL: Record<string, string> = {
  none: '无明显营销',
  low: '较低',
  medium: '中等',
  high: '较高',
  unknown: '暂无法判断',
}

const INTERMEDIARY_LEVEL_LABEL: Record<string, string> = {
  none: '未发现明显中介特征',
  possible: '可能存在',
  likely: '较明显',
  unknown: '暂无法判断',
}

const ORIGINALITY_CLAIM_LABEL: Record<string, string> = {
  claims_original: '内容声称为原始发布',
  appears_repost: '看起来像转载',
  appears_interpretation: '看起来像解读',
  unclear: '暂无法判断',
}

const OPPORTUNITY_TYPE_LABEL: Record<string, string> = {
  policy: '政策',
  competition: '创赛',
  financial_service: '金融服务',
  equity_funding: '股权融资',
  park_service: '园区服务',
  scenario: '场景机会',
  other: '其他',
}

const CLAIMED_STATUS_LABEL: Record<string, string> = {
  active: '进行中',
  upcoming: '即将开始',
  expired: '已过期',
  closed: '已结束',
  unknown: '暂无法判断',
}

const EVIDENCE_KIND_LABEL: Record<string, string> = {
  direct_quote: '正文依据',
  metadata: '页面元数据',
  derived_signal: '规则信号',
}

const WARNING_LABEL: Record<string, string> = {
  insufficient_context: '信息不足，部分内容暂无法判断',
  source_extraction_partial: '网页正文仅部分提取，分析结果可能不完整',
  input_truncated: '内容较长，智能分析时仅使用了部分正文',
  multiple_opportunities_detected: '当前内容可能同时包含多个机会，本次仅分析主要机会',
}

const ERROR_MESSAGE: Record<string, string> = {
  NETWORK_ERROR: '无法连接筑脉企服 Backend',
  VALIDATION_ERROR: '链接格式不正确',
  INVALID_URL: '链接格式不正确',
  UNSAFE_URL: '当前链接不能被系统访问',
  FETCH_TIMEOUT: '网页读取超时，请稍后重试或直接粘贴正文',
  FETCH_FAILED: '无法读取该网页',
  CONTENT_TOO_LARGE: '网页内容过大',
  UNSUPPORTED_CONTENT_TYPE: '当前内容格式暂不支持',
  EXTRACTION_FAILED: '已获取网页，但未能提取有效正文',
  CONTENT_NOT_ANALYZABLE: '当前内容不足以进行智能分析',
  LLM_NOT_CONFIGURED: '智能分析服务尚未配置',
  LLM_TIMEOUT: '智能分析超时，请重试',
  LLM_RATE_LIMITED: '智能分析服务繁忙，请稍后重试',
  LLM_PROVIDER_ERROR: '智能分析服务暂时不可用',
  LLM_STRUCTURED_OUTPUT_ERROR: '智能分析结果异常，请重试',
  LLM_SCHEMA_VALIDATION_ERROR: '智能分析结果未通过结构校验，请重试',
}

function lookup(table: Record<string, string>, value: string | null | undefined): string {
  if (!value) {
    return ''
  }
  return table[value] || ''
}

function textValue(value: string | null | undefined): string {
  return value && value.trim() ? value.trim() : ''
}

function formatConfidence(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ''
  }
  return `${Math.round(value * 100)}%`
}

function formatDate(value: string | null | undefined): string {
  const raw = textValue(value)
  if (!raw) {
    return ''
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10)
  }
  return raw
}

function formatExpectedValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join('、')
  }
  return ''
}

function pushFact(list: FactView[], key: string, label: string, value: string): void {
  if (!value) {
    return
  }
  list.push({ key, label, value })
}

function mapWarning(code: string): string {
  return WARNING_LABEL[code] || '分析过程中存在需要注意的信息'
}

function mapResources(resource: ClaimedResourceValue | null | undefined): string[] {
  if (!resource) {
    return []
  }
  const items: string[] = []
  const funding = resource.funding
  if (funding) {
    if (typeof funding.amount === 'number' && !Number.isNaN(funding.amount)) {
      items.push(`内容提到的支持金额：${funding.amount}`)
    } else if (textValue(funding.description)) {
      items.push(`内容提到的支持金额：${textValue(funding.description)}`)
    }
  }
  if (typeof resource.scenario === 'string' && resource.scenario.trim()) {
    items.push(`场景：${resource.scenario.trim()}`)
  } else if (resource.scenario === true) {
    items.push('内容中提到场景')
  }
  if (textValue(resource.financing)) {
    items.push(`融资：${textValue(resource.financing)}`)
  }
  if (textValue(resource.service)) {
    items.push(`服务：${textValue(resource.service)}`)
  }
  if (resource.other) {
    resource.other.forEach((item) => {
      if (textValue(item)) {
        items.push(item.trim())
      }
    })
  }
  return items
}

function mapRequirements(items: ClaimedRequirement[] | undefined): string[] {
  if (!items) {
    return []
  }
  return items
    .map((item) => {
      const expected = formatExpectedValue(item.expected_value)
      const extra = textValue(item.description)
      const parts = [item.label]
      if (expected) {
        parts.push(expected)
      }
      if (extra) {
        parts.push(extra)
      }
      return parts.join(' · ')
    })
    .filter((item) => item.trim())
}

function mapEvidence(items: IntelligenceEvidence[]): EvidenceView[] {
  return items
    .filter((item) => textValue(item.text))
    .map((item) => ({
      key: item.id,
      kindLabel: lookup(EVIDENCE_KIND_LABEL, item.kind) || '分析依据',
      text: item.text.trim(),
    }))
}

function mapClaimFacts(claim: OpportunityClaim): FactView[] {
  const facts: FactView[] = []
  pushFact(facts, 'type', '机会类型', lookup(OPPORTUNITY_TYPE_LABEL, claim.claimed_type))
  pushFact(facts, 'issuer', '声称发布主体', textValue(claim.claimed_issuer))
  pushFact(facts, 'region', '地区', textValue(claim.claimed_region))
  pushFact(facts, 'publish', '声称发布日期', formatDate(claim.claimed_publish_date))
  pushFact(facts, 'deadline', '声称截止时间', formatDate(claim.claimed_deadline))
  pushFact(facts, 'status', '内容中的状态', lookup(CLAIMED_STATUS_LABEL, claim.claimed_status))
  return facts
}

export function mapSourcePreview(ingest: IngestResponse): SourcePreviewView {
  const content = ingest.normalized_content
  if (content.input_type === 'text') {
    return {
      kind: 'text',
      title: '粘贴正文',
      publisher: '',
      url: '',
      excerpt: textValue(content.excerpt),
    }
  }
  return {
    kind: 'url',
    title: textValue(content.title) || textValue(ingest.source.title),
    publisher: textValue(content.publisher) || textValue(ingest.source.publisher),
    url: textValue(content.resolved_url) || textValue(content.source_url),
    excerpt: textValue(content.excerpt),
  }
}

export function mapIntelligenceResultToViewModel(
  ingest: IngestResponse,
  analyze: IntelligenceAnalyzeResponse
): IntelligenceViewModel {
  const sourcePreview = mapSourcePreview(ingest)
  const result = analyze.intelligence_result
  if (!result) {
    return {
      sourcePreview,
      analysisFacts: [],
      sourceFacts: [],
      claimPresent: false,
      claimTitle: '',
      claimFacts: [],
      claimSummary: '',
      resources: [],
      officialUrl: '',
      requirements: [],
      materials: [],
      process: [],
      evidence: [],
      warnings: [],
      emptyResult: true,
    }
  }

  const analysisFacts: FactView[] = []
  pushFact(
    analysisFacts,
    'nature',
    '内容性质',
    lookup(CONTENT_NATURE_LABEL, result.analysis.content_nature)
  )
  pushFact(
    analysisFacts,
    'relevance',
    '机会相关度',
    lookup(OPPORTUNITY_RELEVANCE_LABEL, result.analysis.opportunity_relevance)
  )
  pushFact(analysisFacts, 'confidence', '分析置信度', formatConfidence(result.analysis.confidence))

  const sourceFacts: FactView[] = []
  pushFact(
    sourceFacts,
    'apparent',
    '看起来像什么来源',
    lookup(APPARENT_SOURCE_LABEL, result.source_assessment.apparent_source_type)
  )
  pushFact(
    sourceFacts,
    'marketing',
    '营销程度',
    lookup(MARKETING_LEVEL_LABEL, result.source_assessment.marketing_level)
  )
  pushFact(
    sourceFacts,
    'intermediary',
    '中介特征',
    lookup(INTERMEDIARY_LEVEL_LABEL, result.source_assessment.intermediary_level)
  )
  pushFact(
    sourceFacts,
    'originality',
    '内容形态',
    lookup(ORIGINALITY_CLAIM_LABEL, result.source_assessment.originality_claim)
  )

  const claim = result.opportunity_claim
  const warnings = (result.analysis.warnings || []).map(mapWarning)

  if (!claim) {
    return {
      sourcePreview,
      analysisFacts,
      sourceFacts,
      claimPresent: false,
      claimTitle: '',
      claimFacts: [],
      claimSummary: '',
      resources: [],
      officialUrl: '',
      requirements: [],
      materials: [],
      process: [],
      evidence: mapEvidence(result.evidence || []),
      warnings,
      emptyResult: false,
    }
  }

  return {
    sourcePreview,
    analysisFacts,
    sourceFacts,
    claimPresent: true,
    claimTitle: textValue(claim.claimed_title),
    claimFacts: mapClaimFacts(claim),
    claimSummary: textValue(claim.claimed_summary),
    resources: mapResources(claim.claimed_resource_value),
    officialUrl: textValue(claim.claimed_official_url),
    requirements: mapRequirements(claim.claimed_requirements),
    materials: (claim.claimed_required_materials || []).filter((item) => textValue(item)),
    process: (claim.claimed_application_process || []).filter((item) => textValue(item)),
    evidence: mapEvidence(result.evidence || []),
    warnings,
    emptyResult: false,
  }
}

export function getCheckErrorMessage(
  error: ApiError,
  phase: 'ingest' | 'analyze',
  inputMode: ContentInputType
): string {
  if (error.code === 'REQUEST_TIMEOUT' && phase === 'analyze') {
    return '智能分析耗时较长，请稍后重试'
  }
  if (error.code === 'NETWORK_ERROR') {
    return '无法连接筑脉企服 Backend'
  }
  const mapped = ERROR_MESSAGE[error.code]
  if (mapped) {
    if (error.code === 'VALIDATION_ERROR' && inputMode === 'text') {
      return error.message || '输入内容不正确'
    }
    return mapped
  }
  if (phase === 'ingest' && inputMode === 'url') {
    return '无法读取该网页'
  }
  return error.message || '请求失败，请稍后重试'
}

export function emptyIntelligenceView(): IntelligenceViewModel {
  return {
    sourcePreview: {
      kind: 'text',
      title: '',
      publisher: '',
      url: '',
      excerpt: '',
    },
    analysisFacts: [],
    sourceFacts: [],
    claimPresent: false,
    claimTitle: '',
    claimFacts: [],
    claimSummary: '',
    resources: [],
    officialUrl: '',
    requirements: [],
    materials: [],
    process: [],
    evidence: [],
    warnings: [],
    emptyResult: false,
  }
}
