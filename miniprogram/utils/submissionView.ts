import type { ApiError } from '../api/errors'
import type {
  CreateUserSubmissionResponse,
  LinkedServiceCase,
  ServiceCase,
  ServiceCaseStatus,
  SubmissionOriginType,
  SubmissionStatus,
  UserSubmissionDetail,
  UserSubmissionSummary,
} from '../api/types'
import type {
  DiscoveryItem,
  RecommendedDisplayStatus,
  RecommendedItem,
  RecommendedServiceCaseStatus,
  RecommendedSubmissionStatus,
} from '../types/index'

const PREVIEW_MAX = 48

export type StatusTone = 'brand' | 'muted' | 'complete' | 'neutral' | 'warning'

const DISPLAY_STATUS_TEXT: Record<RecommendedDisplayStatus, string> = {
  pending: '待处理',
  ingesting: '读取中',
  analyzing: '分析中',
  failed: '解析失败',
  succeeded: '已解析',
  awaiting_service: '待服务',
  in_progress: '处理中',
  completed: '已完成',
  closed: '已关闭',
  checking: '处理中',
  handling: '办理中',
}

const SECONDARY_LABEL: Record<RecommendedDisplayStatus, string> = {
  pending: '',
  ingesting: '',
  analyzing: '',
  failed: '',
  succeeded: '可继续办理',
  awaiting_service: '服务事项已提交，等待处理',
  in_progress: '服务事项正在办理',
  completed: '本次服务事项已完成',
  closed: '本次服务事项已关闭',
  checking: '',
  handling: '',
}

const STATUS_TONE: Record<RecommendedDisplayStatus, StatusTone> = {
  pending: 'brand',
  ingesting: 'brand',
  analyzing: 'brand',
  failed: 'warning',
  succeeded: 'muted',
  awaiting_service: 'brand',
  in_progress: 'brand',
  completed: 'complete',
  closed: 'neutral',
  checking: 'brand',
  handling: 'brand',
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

function submissionStatusOf(
  status: SubmissionStatus | RecommendedSubmissionStatus
): RecommendedSubmissionStatus {
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

function serviceCaseStatusOf(
  status: ServiceCaseStatus | RecommendedServiceCaseStatus | null | undefined
): RecommendedServiceCaseStatus | null {
  if (
    status === 'open' ||
    status === 'in_progress' ||
    status === 'completed' ||
    status === 'closed'
  ) {
    return status
  }
  return null
}

export function canContinueToService(
  submissionStatus: SubmissionStatus | RecommendedSubmissionStatus,
  linked: LinkedServiceCase | null | undefined
): boolean {
  return submissionStatusOf(submissionStatus) === 'succeeded' && !linked
}

function displayStatusFromKnownCase(
  caseStatus: RecommendedServiceCaseStatus
): RecommendedDisplayStatus {
  if (caseStatus === 'open') {
    return 'awaiting_service'
  }
  if (caseStatus === 'in_progress') {
    return 'in_progress'
  }
  if (caseStatus === 'completed') {
    return 'completed'
  }
  return 'closed'
}

export function deriveRecommendedDisplayStatus(
  submissionStatus: SubmissionStatus | RecommendedSubmissionStatus,
  linked: LinkedServiceCase | null | undefined
): RecommendedDisplayStatus {
  if (linked) {
    const known = serviceCaseStatusOf(linked.status)
    if (known) {
      return displayStatusFromKnownCase(known)
    }
    console.warn(`[submissionView] unknown service case status: ${String(linked.status)}`)
    return 'handling'
  }
  return deriveDisplayStatusFromCase(submissionStatus, null)
}

function deriveDisplayStatusFromCase(
  submissionStatus: SubmissionStatus | RecommendedSubmissionStatus,
  caseStatus: RecommendedServiceCaseStatus | null
): RecommendedDisplayStatus {
  if (caseStatus) {
    return displayStatusFromKnownCase(caseStatus)
  }
  const status = submissionStatusOf(submissionStatus)
  if (status !== 'succeeded') {
    return status
  }
  return 'succeeded'
}

export function getRecommendedStatusText(displayStatus: RecommendedDisplayStatus): string {
  return DISPLAY_STATUS_TEXT[displayStatus]
}

export function getRecommendedStatusHint(displayStatus: RecommendedDisplayStatus): string {
  return SECONDARY_LABEL[displayStatus]
}

export function getCheckServiceStatusHint(displayStatus: RecommendedDisplayStatus): string {
  if (
    displayStatus === 'awaiting_service' ||
    displayStatus === 'in_progress' ||
    displayStatus === 'completed' ||
    displayStatus === 'closed' ||
    displayStatus === 'handling'
  ) {
    return SECONDARY_LABEL[displayStatus]
  }
  return ''
}

export function getStatusTone(displayStatus: RecommendedDisplayStatus): StatusTone {
  return STATUS_TONE[displayStatus]
}

export function isTerminalDisplayStatus(displayStatus: RecommendedDisplayStatus): boolean {
  return displayStatus === 'completed' || displayStatus === 'closed'
}

function serviceTimeForStatus(
  displayStatus: RecommendedDisplayStatus,
  linked: LinkedServiceCase | null | undefined
): { label: string; text: string } {
  if (!linked) {
    return { label: '', text: '' }
  }
  if (displayStatus === 'awaiting_service') {
    return { label: '提交时间', text: formatSubmissionTime(linked.created_at) }
  }
  if (displayStatus === 'in_progress') {
    return { label: '最近更新', text: formatSubmissionTime(linked.updated_at) }
  }
  if (displayStatus === 'completed') {
    return { label: '完成时间', text: formatSubmissionTime(linked.completed_at) }
  }
  if (displayStatus === 'closed') {
    return { label: '关闭时间', text: formatSubmissionTime(linked.closed_at) }
  }
  return { label: '', text: '' }
}

export function linkedServiceCaseFromServiceCase(serviceCase: ServiceCase): LinkedServiceCase {
  return {
    id: serviceCase.id,
    status: serviceCase.status,
    created_at: serviceCase.created_at,
    updated_at: serviceCase.updated_at,
    completed_at: serviceCase.completed_at,
    closed_at: serviceCase.closed_at,
  }
}

export type CheckServicePanel = {
  canContinueToService: boolean
  canContinueService: boolean
  showContinueCta: boolean
  showServiceStatus: boolean
  primaryLabel: string
  secondaryLabel: string
  statusTone: StatusTone
  isTerminal: boolean
  serviceStatusText: string
  serviceStatusHint: string
  serviceStatusTone: StatusTone
  serviceTimeLabel: string
  serviceTimeText: string
  continueButtonText: string
}

export function projectCheckServicePanel(
  submissionStatus: SubmissionStatus | RecommendedSubmissionStatus,
  linked: LinkedServiceCase | null | undefined,
  pending?: boolean
): CheckServicePanel {
  const canContinue = canContinueToService(submissionStatus, linked)
  const displayStatus = deriveRecommendedDisplayStatus(submissionStatus, linked)
  const showServiceStatus = !canContinue && !!linked
  const primaryLabel = showServiceStatus ? getRecommendedStatusText(displayStatus) : ''
  const secondaryLabel = showServiceStatus ? getCheckServiceStatusHint(displayStatus) : ''
  const statusTone = getStatusTone(displayStatus)
  const isTerminal = showServiceStatus && isTerminalDisplayStatus(displayStatus)
  const time = showServiceStatus ? serviceTimeForStatus(displayStatus, linked) : { label: '', text: '' }
  return {
    canContinueToService: canContinue,
    canContinueService: canContinue,
    showContinueCta: canContinue,
    showServiceStatus,
    primaryLabel,
    secondaryLabel,
    statusTone,
    isTerminal,
    serviceStatusText: primaryLabel,
    serviceStatusHint: secondaryLabel,
    serviceStatusTone: statusTone,
    serviceTimeLabel: time.label,
    serviceTimeText: time.text,
    continueButtonText: pending ? '正在办理…' : '继续办理',
  }
}

function buildRecommendedItem(input: {
  id: string
  title: string
  status: RecommendedSubmissionStatus
  preview: string
  originType: SubmissionOriginType
  timeText: string
  linkedServiceCase?: LinkedServiceCase | null
  originDiscoveryId?: string | null
  tempDiscoveryId?: string
}): RecommendedItem {
  const status = submissionStatusOf(input.status)
  const linked = input.linkedServiceCase || null
  const displayStatus = deriveRecommendedDisplayStatus(status, linked)
  return {
    id: input.id,
    title: input.title.replace(/\n/g, ''),
    status,
    displayStatus,
    statusText: getRecommendedStatusText(displayStatus),
    statusHint: getRecommendedStatusHint(displayStatus),
    statusTone: getStatusTone(displayStatus),
    isTerminal: isTerminalDisplayStatus(displayStatus),
    serviceCaseStatus: linked ? serviceCaseStatusOf(linked.status) : null,
    canContinueToService: canContinueToService(status, linked),
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
    status: submissionStatusOf(item.status),
    preview: item.input_preview,
    originType: item.origin_type,
    timeText: formatSubmissionTime(item.created_at),
    linkedServiceCase: item.linked_service_case,
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
    status: submissionStatusOf(submission.status),
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
    status: submissionStatusOf(submission.status),
    preview: submission.input_preview || '',
    originType: submission.origin_type || 'user_input',
    timeText: formatSubmissionTime(submission.created_at),
    linkedServiceCase: detail.linked_service_case,
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
    const status = patch.status ? submissionStatusOf(patch.status) : item.status
    const serviceCaseStatus =
      patch.serviceCaseStatus !== undefined ? patch.serviceCaseStatus : item.serviceCaseStatus
    const displayStatus = deriveDisplayStatusFromCase(status, serviceCaseStatus)
    return {
      ...item,
      ...patch,
      status,
      displayStatus,
      serviceCaseStatus,
      canContinueToService: status === 'succeeded' && !serviceCaseStatus,
      statusText: patch.statusText || getRecommendedStatusText(displayStatus),
      statusHint:
        patch.statusHint !== undefined ? patch.statusHint : getRecommendedStatusHint(displayStatus),
      statusTone: patch.statusTone || getStatusTone(displayStatus),
      isTerminal:
        patch.isTerminal !== undefined ? patch.isTerminal : isTerminalDisplayStatus(displayStatus),
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

export function isContinueIdentityError(error: ApiError): boolean {
  return (
    error.code === 'AUTHENTICATION_REQUIRED' ||
    error.code === 'DEV_IDENTITY_REQUIRED' ||
    error.code === 'ENTERPRISE_CONTEXT_REQUIRED' ||
    error.code === 'ENTERPRISE_MEMBERSHIP_NOT_FOUND' ||
    error.code === 'USER_NOT_FOUND' ||
    error.code === 'USER_DISABLED'
  )
}

export function getContinueToServiceErrorMessage(error: ApiError): string {
  if (error.code === 'SUBMISSION_NOT_READY_FOR_SERVICE') {
    return '当前内容尚未完成解析'
  }
  if (error.code === 'SUBMISSION_NOT_FOUND') {
    return '这条内容已不可用'
  }
  if (isContinueIdentityError(error)) {
    return '当前身份不可用，暂时无法继续办理'
  }
  if (error.code === 'REQUEST_TIMEOUT' || error.code === 'NETWORK_ERROR') {
    return '网络异常，请稍后重试'
  }
  return '暂时无法进入办理流程，请重试'
}

export function emptyCheckServicePanel(): CheckServicePanel {
  return {
    canContinueToService: false,
    canContinueService: false,
    showContinueCta: false,
    showServiceStatus: false,
    primaryLabel: '',
    secondaryLabel: '',
    statusTone: 'muted',
    isTerminal: false,
    serviceStatusText: '',
    serviceStatusHint: '',
    serviceStatusTone: 'muted',
    serviceTimeLabel: '',
    serviceTimeText: '',
    continueButtonText: '继续办理',
  }
}
