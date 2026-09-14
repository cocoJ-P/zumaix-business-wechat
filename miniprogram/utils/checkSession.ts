import type { CheckInput, CheckInputKind, InboxItem } from '../types/index'
import { isHttpUrl, parseCheckInput } from './checkInput'

let pendingCheck: CheckInput | null = null
let checkFlowLocked = false

export function setPendingCheck(input: CheckInput): void {
  pendingCheck = input
}

export function takePendingCheck(): CheckInput | null {
  const current = pendingCheck
  pendingCheck = null
  return current
}

export function releaseCheckFlowLock(): void {
  checkFlowLocked = false
}

export function startCheckFlow(raw: string, kind?: CheckInputKind): boolean {
  if (checkFlowLocked) {
    return false
  }
  const parsed = parseCheckInput(raw || '')
  if ('error' in parsed) {
    wx.showToast({ title: parsed.error, icon: 'none' })
    return false
  }
  setPendingCheck({
    raw: parsed.raw,
    kind: kind === 'url' && isHttpUrl(parsed.raw) ? 'url' : parsed.kind,
  })
  checkFlowLocked = true
  wx.navigateTo({
    url: '/pages/check/index',
    fail: () => {
      pendingCheck = null
      checkFlowLocked = false
    },
  })
  return true
}

export function openSubmissionCheck(submissionId: string): boolean {
  if (!submissionId || checkFlowLocked) {
    return false
  }
  checkFlowLocked = true
  wx.navigateTo({
    url: `/pages/check/index?submissionId=${encodeURIComponent(submissionId)}`,
    fail: () => {
      checkFlowLocked = false
    },
  })
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
