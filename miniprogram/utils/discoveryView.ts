import type { ApiError } from '../api/errors'
import type {
  DiscoveryCurrentUserState,
  DiscoveryFeedItem,
  DiscoveryOpportunityType,
  DiscoveryReferenceType,
  DiscoveryStatus,
} from '../api/types'
import type { DiscoveryItem } from '../types/index'
import { resolveDiscoveryBackground } from './discoveryBackground'

const OPPORTUNITY_TYPE_LABEL: Record<DiscoveryOpportunityType, DiscoveryItem['kind']> = {
  policy: '政策',
  competition: '创赛',
  financial_service: '金融服务',
  equity_funding: '股权融资',
  park_service: '园区服务',
  scenario: '场景机会',
  other: '其他',
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const FRONT_REASON_MAX = 72
const BACK_SUMMARY_MAX = 96

type DiscoveryCardSource = {
  id: string
  status: DiscoveryStatus
  reference_type: DiscoveryReferenceType
  title: string
  summary: string | null
  reason: string | null
  opportunity_type: DiscoveryOpportunityType | null
  issuer: string | null
  region: string | null
  deadline: string | null
  reference_url: string | null
  opportunity_id?: string | null
  current_user_state?: DiscoveryCurrentUserState | null
}

function textValue(value: string | null | undefined): string {
  return value && value.trim() ? value.trim() : ''
}

function truncateText(value: string, max: number): string {
  const compact = value.replace(/\s+/g, ' ').trim()
  if (!compact) {
    return ''
  }
  if (compact.length <= max) {
    return compact
  }
  return `${compact.slice(0, max).trim()}…`
}

function parseLocalDateParts(value: string): { year: number; month: number; day: number } | null {
  const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!matched) {
    return null
  }
  const year = Number(matched[1])
  const month = Number(matched[2])
  const day = Number(matched[3])
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }
  return { year, month, day }
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatDiscoveryDeadline(
  deadline: string | null | undefined,
  now: Date = new Date()
): string {
  const raw = textValue(deadline)
  if (!raw) {
    return ''
  }
  const parts = parseLocalDateParts(raw)
  if (!parts) {
    return ''
  }
  const target = new Date(parts.year, parts.month - 1, parts.day)
  const today = startOfLocalDay(now)
  const diff = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)
  if (diff === 0) {
    return '今天截止'
  }
  if (diff === 1) {
    return '明天截止'
  }
  if (diff > 1) {
    return `${diff} 天后截止`
  }
  return '已截止'
}

function mapKindLabel(
  opportunityType: DiscoveryOpportunityType | null,
  referenceType: DiscoveryReferenceType
): DiscoveryItem['kind'] {
  if (opportunityType && OPPORTUNITY_TYPE_LABEL[opportunityType]) {
    return OPPORTUNITY_TYPE_LABEL[opportunityType]
  }
  if (referenceType === 'source') {
    return '内容'
  }
  if (referenceType === 'manual') {
    return '推荐'
  }
  return ''
}

function issuerLabel(referenceType: DiscoveryReferenceType): string {
  if (referenceType === 'source') {
    return '来源 / 发布方'
  }
  if (referenceType === 'opportunity') {
    return '发布主体'
  }
  return '发布方'
}

function shouldSkipFeedItem(item: DiscoveryFeedItem): boolean {
  const disposition = item.current_user_state ? item.current_user_state.disposition : null
  return disposition === 'saved'
}

function visualStateFromUserState(
  state: DiscoveryCurrentUserState | null | undefined
): 'fresh' | 'deprioritized' {
  if (state && state.disposition === 'deprioritized') {
    return 'deprioritized'
  }
  return 'fresh'
}

export function mapDiscoveryToCardViewModel(
  item: DiscoveryCardSource
): DiscoveryItem | null {
  if (item.status !== 'active') {
    return null
  }
  const reason = textValue(item.reason)
  const summary = textValue(item.summary)
  const frontReason = reason || (summary ? truncateText(summary, FRONT_REASON_MAX) : '')
  const state = item.current_user_state
  const kind = mapKindLabel(item.opportunity_type, item.reference_type)
  return {
    id: item.id,
    kind,
    eventStatus: formatDiscoveryDeadline(item.deadline),
    title: item.title,
    reason: frontReason,
    opportunityId: item.opportunity_id || undefined,
    summary: summary ? truncateText(summary, BACK_SUMMARY_MAX) : '',
    issuerLabel: issuerLabel(item.reference_type),
    issuer: textValue(item.issuer),
    region: textValue(item.region),
    deadlineText: formatDiscoveryDeadline(item.deadline),
    hasReferenceSource: !!textValue(item.reference_url),
    seenAt: state && state.seen_at ? state.seen_at : null,
    visualState: visualStateFromUserState(state),
    backgroundImage: resolveDiscoveryBackground({
      opportunityType: item.opportunity_type,
      kind,
    }),
  }
}

export function mapDiscoveryFeedToCardViewModels(
  items: DiscoveryFeedItem[]
): DiscoveryItem[] {
  const seen = new Set<string>()
  const mapped: DiscoveryItem[] = []
  items.forEach((item) => {
    if (seen.has(item.id) || shouldSkipFeedItem(item)) {
      return
    }
    seen.add(item.id)
    const view = mapDiscoveryToCardViewModel(item)
    if (view) {
      mapped.push(view)
    }
  })
  return mapped
}

export function getDiscoveryFeedErrorMessage(error: ApiError): string {
  if (
    error.code === 'DEV_IDENTITY_REQUIRED' ||
    error.code === 'AUTHENTICATION_REQUIRED' ||
    error.code === 'USER_NOT_FOUND' ||
    error.code === 'USER_DISABLED'
  ) {
    return '当前身份不可用，暂时无法加载发现内容。'
  }
  if (
    error.code === 'ENTERPRISE_CONTEXT_REQUIRED' ||
    error.code === 'ENTERPRISE_MEMBERSHIP_NOT_FOUND'
  ) {
    return '当前企业上下文尚未确定。'
  }
  if (error.code === 'NETWORK_ERROR' || error.code === 'REQUEST_TIMEOUT') {
    return '暂时无法加载「为您推送」'
  }
  return '暂时无法加载「为您推送」'
}

export function getDiscoveryFeedbackErrorMessage(error: ApiError): string {
  if (error.code === 'DISCOVERY_NOT_FOUND') {
    return '这条发现已不可用'
  }
  if (
    error.code === 'DEV_IDENTITY_REQUIRED' ||
    error.code === 'AUTHENTICATION_REQUIRED' ||
    error.code === 'ENTERPRISE_CONTEXT_REQUIRED' ||
    error.code === 'ENTERPRISE_MEMBERSHIP_NOT_FOUND' ||
    error.code === 'USER_NOT_FOUND' ||
    error.code === 'USER_DISABLED'
  ) {
    return '当前身份不可用，操作未保存'
  }
  if (error.code === 'NETWORK_ERROR' || error.code === 'REQUEST_TIMEOUT') {
    return '网络异常，操作没有保存'
  }
  return '操作没有保存，请重试'
}
