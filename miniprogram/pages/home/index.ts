import type { DiscoveryItem, HomeViewState } from '../../types/index'
import { HOME_VIEW_STATE } from '../../mock/homeState'
import {
  addInboxEntry,
  addToInboxFromDiscovery,
  advanceAnalyzingItems,
  deprioritizeDiscovery,
  getDeprioritizedDiscoveries,
  getFeaturedDiscoveries,
  getInboxAnalyzingItems,
  getInboxPreviewItems,
  getInboxSummary,
  takeIncomingShare,
  getInboxItems,
} from '../../utils/workbench'
import type { InboxSummary, InboxViewItem } from '../../utils/workbench'
import { ANALYZE_STEP_DELAY_MS } from '../../utils/analyzeSteps'
import { startCheckFlow, openOpportunityDetail, openInboxEntry } from '../../utils/checkSession'

type GestureState = {
  active: boolean
  direction: 'left' | 'right' | ''
  rawDx: number
  progress: number
  armed: boolean
  committed: boolean
}

const IDLE_GESTURE: GestureState = {
  active: false,
  direction: '',
  rawDx: 0,
  progress: 0,
  armed: false,
  committed: false,
}

type HomeData = {
  paddingTopPx: number
  viewState: HomeViewState
  inbox: InboxSummary
  inboxPreview: InboxViewItem[]
  inboxAnalyzing: InboxViewItem[]
  featuredIndex: number
  featuredTotal: number
  featuredCursor: number
  current: DiscoveryItem | null
  next: DiscoveryItem | null
  low: DiscoveryItem[]
  modalVisible: boolean
  modalKicker: string
  modalPreview: string
  modalRaw: string
  sheetVisible: boolean
  composeVisible: boolean
  composeText: string
  gesture: GestureState
  deckEntering: boolean
}

function getHomePaddingTopPx(): number {
  const menu = wx.getMenuButtonBoundingClientRect()
  if (menu && menu.bottom > 0) {
    return menu.bottom + 8
  }
  return 56
}

function previewText(raw: string): string {
  const compact = raw.replace(/\s+/g, ' ').trim()
  if (compact.length <= 48) {
    return compact
  }
  return `${compact.slice(0, 48)}……`
}

function deckAt(cursor: number): Pick<
  HomeData,
  | 'inbox'
  | 'inboxPreview'
  | 'inboxAnalyzing'
  | 'featuredIndex'
  | 'featuredTotal'
  | 'featuredCursor'
  | 'current'
  | 'next'
  | 'low'
> {
  const featured = getFeaturedDiscoveries()
  const total = featured.length
  const index = total ? cursor % total : 0
  return {
    inbox: getInboxSummary(),
    inboxPreview: getInboxPreviewItems(),
    inboxAnalyzing: getInboxAnalyzingItems(),
    featuredCursor: index,
    featuredIndex: total ? index + 1 : 0,
    featuredTotal: total,
    current: total ? featured[index] : null,
    next: total > 1 ? featured[(index + 1) % total] : null,
    low: getDeprioritizedDiscoveries(),
  }
}

const dismissedContent = new Set<string>()
const acceptedContent = new Set<string>()

Page({
  data: {
    paddingTopPx: 56,
    viewState: HOME_VIEW_STATE,
    inbox: { total: 0, analyzing: 0, waiting: 0, done: 0 },
    inboxPreview: [],
    inboxAnalyzing: [],
    featuredIndex: 0,
    featuredTotal: 0,
    featuredCursor: 0,
    current: null,
    next: null,
    low: [],
    modalVisible: false,
    modalKicker: '',
    modalPreview: '',
    modalRaw: '',
    sheetVisible: false,
    composeVisible: false,
    composeText: '',
    gesture: { ...IDLE_GESTURE },
    deckEntering: false,
  } as HomeData,

  onLoad() {
    this.setData({
      paddingTopPx: getHomePaddingTopPx(),
      viewState: HOME_VIEW_STATE,
      ...deckAt(0),
    })
  },

  onShow() {
    this.setData(deckAt(this.data.featuredCursor))
    this.detectIncomingContent()
    this.startInboxTicker()
  },

  onHide() {
    this.stopInboxTicker()
  },

  onUnload() {
    this.stopInboxTicker()
  },

  onShareAppMessage() {
    const current = this.data.current
    if (current) {
      const title = current.title.replace(/\n/g, '')
      return {
        title,
        path: `/pages/home/index?text=${encodeURIComponent(title)}`,
      }
    }
    return {
      title: '筑脉查查 · 看到机会，先查查。',
      path: '/pages/home/index',
    }
  },

  detectIncomingContent() {
    const shared = takeIncomingShare()
    if (shared) {
      this.openContentModal('收到转发内容', shared)
      return
    }
    wx.getClipboardData({
      success: (res) => {
        const raw = (res.data || '').trim()
        if (!raw) {
          return
        }
        this.openContentModal('检测到剪贴板内容', raw)
      },
    })
  },

  openContentModal(kicker: string, raw: string, force = false) {
    if (!raw) {
      return
    }
    if (!force && (dismissedContent.has(raw) || acceptedContent.has(raw))) {
      return
    }
    this.setData({
      modalVisible: true,
      sheetVisible: false,
      composeVisible: false,
      modalKicker: kicker,
      modalRaw: raw,
      modalPreview: previewText(raw),
    })
  },

  onDialogTap() {},

  onModalIgnore() {
    const raw = this.data.modalRaw
    if (raw) {
      dismissedContent.add(raw)
    }
    this.setData({
      modalVisible: false,
      modalRaw: '',
      modalPreview: '',
    })
  },

  onModalAccept() {
    const raw = this.data.modalRaw.trim()
    if (!raw) {
      this.setData({ modalVisible: false })
      return
    }
    acceptedContent.add(raw)
    addInboxEntry(raw, this.data.modalKicker.indexOf('转发') >= 0 ? 'link' : 'clipboard')
    this.setData({
      modalVisible: false,
      modalRaw: '',
      modalPreview: '',
      ...deckAt(this.data.featuredCursor),
    })
    wx.showToast({ title: '已加入待处理', icon: 'none' })
  },

  onModalCheck() {
    const raw = this.data.modalRaw.trim()
    this.setData({
      modalVisible: false,
      modalRaw: '',
      modalPreview: '',
    })
    startCheckFlow(raw)
  },

  refreshDeck() {
    const featured = getFeaturedDiscoveries()
    let cursor = this.data.featuredCursor
    if (featured.length && cursor >= featured.length) {
      cursor = 0
    }
    this.setData(deckAt(cursor))
  },

  clearGestureTimer() {
    if (this._gestureTimer) {
      clearTimeout(this._gestureTimer)
      this._gestureTimer = 0
    }
  },

  hideGesture() {
    this.clearGestureTimer()
    this.setData({ gesture: { ...IDLE_GESTURE } })
  },

  onGestureChange(event: { detail: Partial<GestureState> & { active?: boolean } }) {
    const detail = event.detail || {}
    if (!detail.active && !this.data.gesture.committed) {
      this.hideGesture()
      return
    }
    if (!detail.active) {
      return
    }
    this.setData({
      gesture: {
        active: true,
        direction: detail.direction || this.data.gesture.direction,
        rawDx: typeof detail.rawDx === 'number' ? detail.rawDx : this.data.gesture.rawDx,
        progress: typeof detail.progress === 'number' ? detail.progress : this.data.gesture.progress,
        armed: !!detail.armed,
        committed: !!detail.committed || this.data.gesture.committed,
      },
    })
  },

  onDecision(event: { detail: { action?: 'inbox' | 'deprioritize' } }) {
    const action = event.detail.action
    const direction = action === 'deprioritize' ? 'left' : 'right'
    this.clearGestureTimer()
    this.setData({
      gesture: {
        active: true,
        direction,
        rawDx: direction === 'right' ? 200 : -200,
        progress: 1,
        armed: true,
        committed: true,
      },
    })
    this._gestureTimer = setTimeout(() => {
      this.setData({ gesture: { ...IDLE_GESTURE } })
    }, 320)
  },

  applyDeckDecision() {
    const featured = getFeaturedDiscoveries()
    let cursor = this.data.featuredCursor
    if (featured.length && cursor >= featured.length) {
      cursor = 0
    }
    this.setData({
      deckEntering: false,
      ...deckAt(cursor),
    })
    wx.nextTick(() => {
      this.setData({ deckEntering: true })
      setTimeout(() => {
        this.setData({ deckEntering: false })
      }, 280)
    })
  },

  onOpenInbox() {
    wx.navigateTo({ url: '/pages/inbox/index' })
  },

  startInboxTicker() {
    this.stopInboxTicker()
    this._inboxTimer = setInterval(() => {
      const changed = advanceAnalyzingItems()
      if (changed) {
        this.setData(deckAt(this.data.featuredCursor))
      }
      if (!getInboxAnalyzingItems().length) {
        this.stopInboxTicker()
      }
    }, ANALYZE_STEP_DELAY_MS)
  },

  stopInboxTicker() {
    if (this._inboxTimer) {
      clearInterval(this._inboxTimer)
      this._inboxTimer = 0
    }
  },

  onOpenInboxItem(event: { detail: { id?: string } }) {
    const id = event.detail.id
    const items = getInboxItems()
    const hit = items.find((item) => item.id === id)
    if (hit) {
      openInboxEntry(hit)
      return
    }
    wx.navigateTo({ url: '/pages/inbox/index' })
  },

  onOpenDiscovery(event: { detail: { opportunityId?: string } }) {
    const opportunityId = event.detail.opportunityId
    if (!opportunityId) {
      wx.showToast({ title: '没有对应的机会', icon: 'none' })
      return
    }
    openOpportunityDetail(opportunityId)
  },

  onAddContent() {
    this.setData({
      composeVisible: true,
      composeText: '',
    })
  },

  onCloseSheet() {
    this.setData({ sheetVisible: false })
  },

  onAddFromClipboard() {
    this.setData({ sheetVisible: false })
    wx.getClipboardData({
      success: (res) => {
        const raw = (res.data || '').trim()
        if (!raw) {
          wx.showToast({ title: '剪贴板是空的', icon: 'none' })
          return
        }
        this.openContentModal('检测到剪贴板内容', raw, true)
      },
    })
  },

  onCheckFromClipboard() {
    this.setData({ sheetVisible: false })
    wx.getClipboardData({
      success: (res) => {
        const raw = (res.data || '').trim()
        startCheckFlow(raw)
      },
    })
  },

  onAddByPaste() {
    this.setData({
      sheetVisible: false,
      composeVisible: true,
      composeText: '',
    })
  },

  onCloseCompose() {
    this.setData({
      composeVisible: false,
      composeText: '',
    })
  },

  onComposeInput(event: { detail: { value: string } }) {
    this.setData({ composeText: event.detail.value })
  },

  onComposeAccept() {
    const raw = (this.data.composeText || '').trim()
    if (!raw) {
      wx.showToast({ title: '先粘贴或输入内容', icon: 'none' })
      return
    }
    addInboxEntry(raw, raw.indexOf('http') >= 0 ? 'link' : 'text')
    this.setData({
      composeVisible: false,
      composeText: '',
      ...deckAt(this.data.featuredCursor),
    })
    wx.showToast({ title: '已加入待处理', icon: 'none' })
  },

  onComposeCheck() {
    const raw = (this.data.composeText || '').trim()
    if (!startCheckFlow(raw)) {
      return
    }
    this.setData({
      composeVisible: false,
      composeText: '',
    })
  },

  onInbox(event: { detail: { id?: string; fromGesture?: boolean } }) {
    const id = event.detail.id
    if (!id) {
      return
    }
    addToInboxFromDiscovery(id)
    if (event.detail.fromGesture) {
      this.applyDeckDecision()
      return
    }
    this.refreshDeck()
    wx.showToast({ title: '已加入待处理', icon: 'none' })
  },

  onDeprioritize(event: { detail: { id?: string; fromGesture?: boolean } }) {
    const id = event.detail.id
    if (!id) {
      return
    }
    deprioritizeDiscovery(id)
    if (event.detail.fromGesture) {
      this.applyDeckDecision()
      return
    }
    this.refreshDeck()
  },
})
