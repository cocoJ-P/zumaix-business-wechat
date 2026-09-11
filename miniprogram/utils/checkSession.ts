import type { CheckInput, CheckInputKind, InboxItem } from '../types/index'
import { markInboxAnalyzing } from './workbench'

let pendingCheck: CheckInput | null = null

export function setPendingCheck(input: CheckInput): void {
  pendingCheck = input
}

export function takePendingCheck(): CheckInput | null {
  const current = pendingCheck
  pendingCheck = null
  return current
}

export function startCheckFlow(raw: string, kind?: CheckInputKind): boolean {
  const trimmed = (raw || '').trim()
  if (!trimmed) {
    wx.showToast({ title: '先粘贴或输入内容', icon: 'none' })
    return false
  }
  markInboxAnalyzing(trimmed)
  setPendingCheck({
    raw: trimmed,
    kind: kind || (trimmed.indexOf('http') >= 0 ? 'url' : 'text'),
  })
  wx.navigateTo({ url: '/pages/check/index' })
  return true
}

export function openInboxEntry(item: InboxItem): void {
  if (item.status === 'done' && item.opportunityId) {
    openOpportunityDetail(item.opportunityId)
    return
  }
  if (item.status === 'analyzing') {
    return
  }
  startCheckFlow(item.title, item.source === 'link' ? 'url' : 'text')
}

export function openOpportunityDetail(id: string): void {
  if (!id) {
    wx.showToast({ title: '没有可查看的机会', icon: 'none' })
    return
  }
  wx.navigateTo({
    url: `/pages/opportunity-detail/index?id=${encodeURIComponent(id)}`,
  })
}
