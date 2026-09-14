import type { ApiError } from '../api/errors'
import type {
  CreateUserSubmissionResponse,
  SubmissionOriginType,
  SubmissionStatus,
  UserSubmissionDetail,
  UserSubmissionSummary,
} from '../api/types'
import type { DiscoveryItem, RecommendedItem } from '../types/index'

const PREVIEW_MAX = 48

const STATUS_TEXT: Record<RecommendedItem['status'], string> = {
  pending: '待处理',
  ingesting: '读取中',
  analyzing: '分析中',
  succeeded: '已解析',
  failed: '解析失败',
  checking: '处理中',
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

function originText(originType: SubmissionOriginType | undefined): string {
  return originType === 'discovery' ? '来自发现' : '用户提交'
}

function formatSubmissionTime(value: string | null | undefined): string {
  const raw = textValue(value)
  if (!raw) {
    return ''
  }
  const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (!matched) {
    return ''
  }
  return `${Number(matched[2])}月${Number(matched[3])}日`
}

function statusOf(status: SubmissionStatus | RecommendedItem['status']): RecommendedItem['status'] {
  if (
    status === 'pending' ||
    status === 'ingesting' ||
    status === 'analyzing' ||
    status === 'succeeded' ||
    status === 'failed' ||
    status === 'checking'
  ) {
    return status
  }
  return 'pending'
}

function buildRecommendedItem(input: {
  id: string
  title: string
  status: RecommendedItem['status']
  preview: string
  originType: SubmissionOriginType
  timeText: string
  originDiscoveryId?: string | null
  tempDiscoveryId?: string
}): RecommendedItem {
  const status = statusOf(input.status)
  return {
    id: input.id,
    title: input.title.replace(/\n/g, ''),
    status,
    statusText: STATUS_TEXT[status],
    preview: truncateText(input.preview, PREVIEW_MAX),
    originText: originText(input.originType),
    timeText: input.timeText,
    originType: input.originType,
    originDiscoveryId: input.originDiscoveryId || null,
    tempDiscoveryId: input.tempDiscoveryId,
  }
}

export function mapUserSubmissionToRecommendedViewModel(
  item: UserSubmissionSummary
): RecommendedItem {
  return buildRecommendedItem({
    id: item.id,
    title: textValue(item.display_title) || textValue(item.input_preview) || '未命名内容',
    status: statusOf(item.status),
    preview: item.input_preview,
    originType: item.origin_type,
    timeText: formatSubmissionTime(item.created_at),
    originDiscoveryId: item.origin_discovery_id,
  })
}

export function mapMySubmissionsToRecommendedViewModels(
  items: UserSubmissionSummary[]
): RecommendedItem[] {
  const seen = new Set<string>()
  const mapped: RecommendedItem[] = []
  items.forEach((item) => {
    if (seen.has(item.id)) {
      return
    }
    seen.add(item.id)
    mapped.push(mapUserSubmissionToRecommendedViewModel(item))
  })
  return mapped
}

export function filterSucceededRecommendedItems(
  items: RecommendedItem[]
): RecommendedItem[] {
  return items.filter((item) => item.status === 'succeeded' && item.id.indexOf('temp-') !== 0)
}

export function createTempRecommendedFromDiscovery(item: DiscoveryItem): RecommendedItem {
  return buildRecommendedItem({
    id: `temp-${item.id}`,
    title: item.title.replace(/\n/g, '') || '未命名内容',
    status: 'pending',
    preview: item.reason || item.summary || '',
    originType: 'discovery',
    timeText: '刚刚',
    originDiscoveryId: item.id,
    tempDiscoveryId: item.id,
  })
}

export function mapAcceptedSubmissionToRecommended(
  submission: CreateUserSubmissionResponse,
  fallbackTitle: string
): RecommendedItem {
  return buildRecommendedItem({
    id: submission.id,
    title: textValue(fallbackTitle) || textValue(submission.input_preview) || '未命名内容',
    status: statusOf(submission.status),
    preview: submission.input_preview,
    originType: submission.origin_type || 'discovery',
    timeText: formatSubmissionTime(submission.created_at) || '刚刚',
    originDiscoveryId: submission.origin_discovery_id,
  })
}

export function mapSubmissionDetailToRecommended(
  detail: UserSubmissionDetail,
  fallbackTitle: string
): RecommendedItem {
  const submission = detail.submission
  const contentTitle = detail.content && detail.content.title ? detail.content.title : ''
  return buildRecommendedItem({
    id: submission.id,
    title:
      textValue(contentTitle) ||
      textValue(fallbackTitle) ||
      textValue(submission.input_preview) ||
      '未命名内容',
    status: statusOf(submission.status),
    preview: submission.input_preview || '',
    originType: submission.origin_type || 'user_input',
    timeText: formatSubmissionTime(submission.created_at),
    originDiscoveryId: submission.origin_discovery_id,
  })
}

export function replaceRecommendedItem(
  items: RecommendedItem[],
  matchId: string,
  next: RecommendedItem
): RecommendedItem[] {
  let replaced = false
  const mapped = items.map((item) => {
    if (item.id === matchId || item.id === next.id) {
      replaced = true
      return next
    }
    return item
  })
  const deduped = mapped.filter((item, index) => {
    if (item.id !== next.id) {
      return true
    }
    return mapped.findIndex((row) => row.id === next.id) === index
  })
  if (!replaced) {
    return [next, ...deduped.filter((item) => item.id !== next.id)]
  }
  return deduped
}

export function prependRecommendedItem(
  items: RecommendedItem[],
  next: RecommendedItem
): RecommendedItem[] {
  return [next, ...items.filter((item) => item.id !== next.id)]
}

export function patchRecommendedItem(
  items: RecommendedItem[],
  id: string,
  patch: Partial<RecommendedItem>
): RecommendedItem[] {
  return items.map((item) => {
    if (item.id !== id) {
      return item
    }
    const status = patch.status ? statusOf(patch.status) : item.status
    return {
      ...item,
      ...patch,
      status,
      statusText: patch.statusText || STATUS_TEXT[status],
    }
  })
}

export function getRecommendedListErrorMessage(error: ApiError): string {
  if (
    error.code === 'DEV_IDENTITY_REQUIRED' ||
    error.code === 'AUTHENTICATION_REQUIRED' ||
    error.code === 'USER_NOT_FOUND' ||
    error.code === 'USER_DISABLED'
  ) {
    return '当前身份不可用，暂时无法加载内容。'
  }
  if (
    error.code === 'ENTERPRISE_CONTEXT_REQUIRED' ||
    error.code === 'ENTERPRISE_MEMBERSHIP_NOT_FOUND'
  ) {
    return '当前企业上下文尚未确定。'
  }
  return '暂时无法加载内容'
}
