import {
  mockDeprioritizedDiscoveries,
  mockFeaturedDiscoveries,
  mockInboxItems,
} from '../mock/discovery'
import type { DiscoveryItem, InboxItem, InboxSource, InboxStatus } from '../types/index'
import { ANALYZE_STEPS, buildAnalyzeSteps } from './analyzeSteps'
import type { AnalyzeStepView } from './analyzeSteps'

export type InboxViewItem = InboxItem & {
  statusLabel: string
  actionLabel: string
  noteText: string
  doneLead?: boolean
  steps?: AnalyzeStepView[]
}

export type InboxSummary = {
  total: number
  analyzing: number
  waiting: number
  done: number
}

export type InboxGroup = {
  key: InboxStatus
  title: string
  items: InboxViewItem[]
}

let featured: DiscoveryItem[] = mockFeaturedDiscoveries.map((item) => ({ ...item }))
let deprioritized: DiscoveryItem[] = mockDeprioritizedDiscoveries.map((item) => ({ ...item }))
let inbox: InboxItem[] = mockInboxItems.map((item) => ({ ...item }))

function cloneFeatured(): DiscoveryItem[] {
  return featured.map((item) => ({ ...item }))
}

function cloneLow(): DiscoveryItem[] {
  return deprioritized.map((item) => ({ ...item }))
}

function cloneInbox(): InboxItem[] {
  return inbox.map((item) => ({ ...item }))
}

function noteFromSource(source: InboxSource, status: InboxStatus): string {
  if (status === 'done') {
    return '已完成来源判断与机会映射'
  }
  if (status === 'analyzing') {
    if (source === 'link') {
      return '已提取链接，正在判断申报条件'
    }
    return '系统正在判断这份内容是否值得继续'
  }
  if (source === 'clipboard') {
    return '来自剪贴板，等待开始分析'
  }
  if (source === 'link') {
    return '已提取链接，等待开始分析'
  }
  if (source === 'swipe') {
    return '已从推荐加入，等待开始分析'
  }
  if (source === 'file') {
    return '已收到文件，等待开始分析'
  }
  return '已收到内容，等待开始分析'
}

export function describeInboxItem(item: InboxItem): InboxViewItem {
  if (item.status === 'done') {
    return {
      ...item,
      statusLabel: '分析完成',
      actionLabel: '查看结果 →',
      noteText: item.note || noteFromSource(item.source, item.status),
    }
  }
  const analyzing = item.status === 'analyzing'
  const stepIndex = item.analyzeStep || 0
  return {
    ...item,
    statusLabel: analyzing ? '正在分析' : '等待处理',
    actionLabel: analyzing ? '处理中…' : '继续查看 →',
    noteText: analyzing
      ? ANALYZE_STEPS[Math.min(stepIndex, ANALYZE_STEPS.length - 1)]
      : item.note || noteFromSource(item.source, item.status),
    steps: analyzing ? buildAnalyzeSteps(stepIndex) : [],
  }
}

function sortInboxForList(items: InboxItem[]): InboxItem[] {
  const rank: Record<InboxStatus, number> = {
    done: 0,
    analyzing: 1,
    waiting: 2,
  }
  return items.slice().sort((a, b) => rank[a.status] - rank[b.status])
}

export function getFeaturedDiscoveries(): DiscoveryItem[] {
  return cloneFeatured()
}

export function getDeprioritizedDiscoveries(): DiscoveryItem[] {
  return cloneLow()
}

export function getInboxItems(): InboxItem[] {
  return cloneInbox()
}

export function getInboxViewItems(): InboxViewItem[] {
  return sortInboxForList(inbox).map((item) => describeInboxItem(item))
}

export function getInboxGroups(): InboxGroup[] {
  const items = getInboxViewItems()
  const groups: InboxGroup[] = [
    {
      key: 'done',
      title: '分析完成',
      items: items.filter((item) => item.status === 'done'),
    },
    {
      key: 'analyzing',
      title: '正在分析',
      items: items.filter((item) => item.status === 'analyzing'),
    },
    {
      key: 'waiting',
      title: '等待处理',
      items: items.filter((item) => item.status === 'waiting'),
    },
  ]
  return groups.filter((group) => group.items.length)
}

export function getInboxPreviewItems(): InboxViewItem[] {
  return inbox
    .filter((item) => item.status === 'done')
    .slice(0, 3)
    .map((item) => describeInboxItem(item))
}

export function getInboxAnalyzingItems(): InboxViewItem[] {
  return inbox
    .filter((item) => item.status === 'analyzing')
    .map((item) => describeInboxItem(item))
}

export function getInboxSummary(): InboxSummary {
  const analyzing = inbox.filter((item) => item.status === 'analyzing').length
  const waiting = inbox.filter((item) => item.status === 'waiting').length
  const done = inbox.filter((item) => item.status === 'done').length
  return { total: inbox.length, analyzing, waiting, done }
}

export function markInboxAnalyzing(raw: string): void {
  const compact = (raw || '').replace(/\s+/g, ' ').trim()
  if (!compact) {
    return
  }
  const index = inbox.findIndex((item) => {
    const title = item.title.replace(/\s+/g, ' ').trim()
    return compact.indexOf(title) >= 0 || title.indexOf(compact.slice(0, 12)) >= 0
  })
  if (index >= 0) {
    if (inbox[index].status === 'done') {
      return
    }
    const stepIndex = inbox[index].analyzeStep || 0
    inbox[index] = {
      ...inbox[index],
      status: 'analyzing',
      analyzeStep: stepIndex,
      note: ANALYZE_STEPS[stepIndex],
    }
    return
  }
  inbox = [
    {
      id: `inbox-run-${Date.now()}`,
      title: compact.slice(0, 36),
      status: 'analyzing',
      source: compact.indexOf('http') >= 0 ? 'link' : 'text',
      note: ANALYZE_STEPS[0],
      analyzeStep: 0,
    },
    ...inbox,
  ]
}

export function advanceAnalyzingItems(): boolean {
  let changed = false
  inbox = inbox.map((item) => {
    if (item.status !== 'analyzing') {
      return item
    }
    const current = item.analyzeStep || 0
    const next = current + 1
    if (next >= ANALYZE_STEPS.length) {
      changed = true
      return {
        ...item,
        status: 'done',
        analyzeStep: ANALYZE_STEPS.length,
        note: '已完成来源判断与机会映射',
      }
    }
    changed = true
    return {
      ...item,
      analyzeStep: next,
      note: ANALYZE_STEPS[next],
    }
  })
  return changed
}

export function markInboxDone(raw: string, opportunityId?: string): void {
  const compact = (raw || '').replace(/\s+/g, ' ').trim()
  if (!compact) {
    return
  }
  const index = inbox.findIndex((item) => {
    const title = item.title.replace(/\s+/g, ' ').trim()
    return compact.indexOf(title) >= 0 || title.indexOf(compact.slice(0, 12)) >= 0
  })
  const note = '已完成来源判断与机会映射'
  if (index >= 0) {
    inbox[index] = {
      ...inbox[index],
      status: 'done',
      note,
      opportunityId: opportunityId || inbox[index].opportunityId,
      analyzeStep: ANALYZE_STEPS.length,
    }
    return
  }
  inbox = [
    {
      id: `inbox-done-${Date.now()}`,
      title: compact.slice(0, 36),
      status: 'done',
      source: compact.indexOf('http') >= 0 ? 'link' : 'text',
      note,
      opportunityId,
      analyzeStep: ANALYZE_STEPS.length,
    },
    ...inbox,
  ]
}

export function addToInboxFromDiscovery(id: string): boolean {
  const index = featured.findIndex((item) => item.id === id)
  const fromFeatured = index >= 0
  const item = fromFeatured
    ? featured[index]
    : deprioritized.find((row) => row.id === id)
  if (!item) {
    return false
  }
  if (inbox.some((row) => row.id === `inbox-${item.id}`)) {
    if (fromFeatured) {
      featured = featured.filter((row) => row.id !== id)
    } else {
      deprioritized = deprioritized.filter((row) => row.id !== id)
    }
    return true
  }
  inbox = [
    {
      id: `inbox-${item.id}`,
      title: item.title.replace(/\n/g, ''),
      status: 'waiting',
      source: 'swipe',
      note: noteFromSource('swipe', 'waiting'),
    },
    ...inbox,
  ]
  if (fromFeatured) {
    featured = featured.filter((row) => row.id !== id)
  } else {
    deprioritized = deprioritized.filter((row) => row.id !== id)
  }
  return true
}

export function deprioritizeDiscovery(id: string): boolean {
  const index = featured.findIndex((item) => item.id === id)
  if (index < 0) {
    return false
  }
  const [item] = featured.splice(index, 1)
  deprioritized = [item, ...deprioritized]
  return true
}

export function addInboxEntry(title: string, source: InboxSource): InboxItem {
  const item: InboxItem = {
    id: `inbox-${Date.now()}`,
    title,
    status: 'waiting',
    source,
    note: noteFromSource(source, 'waiting'),
  }
  inbox = [item, ...inbox]
  return item
}

let pendingDiscovery: DiscoveryItem | null = null

export function setPendingDiscovery(item: DiscoveryItem): void {
  pendingDiscovery = item
}

export function takePendingDiscovery(): DiscoveryItem | null {
  const current = pendingDiscovery
  pendingDiscovery = null
  return current
}

let incomingShare = ''

export function setIncomingShare(text: string): void {
  incomingShare = (text || '').trim()
}

export function takeIncomingShare(): string {
  const current = incomingShare
  incomingShare = ''
  return current
}
