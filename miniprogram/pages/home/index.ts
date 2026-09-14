import { listDiscoveries } from '../../api/discoveries'
import { toApiError } from '../../api/errors'
import type { DiscoveryItem, HomeViewState } from '../../types/index'
import { HOME_VIEW_STATE } from '../../mock/homeState'
import {
  addInboxEntry,
  advanceAnalyzingItems,
  getInboxAnalyzingItems,
  getInboxPreviewItems,
  getInboxSummary,
  takeIncomingShare,
  getInboxItems,
} from '../../utils/workbench'
import type { InboxSummary, InboxViewItem } from '../../utils/workbench'
import { ANALYZE_STEP_DELAY_MS } from '../../utils/analyzeSteps'
import { startCheckFlow, openInboxEntry } from '../../utils/checkSession'
import {
  getDiscoveryFeedErrorMessage,
  mapDiscoveryListToCardViewModels,
} from '../../utils/discoveryView'

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

type DiscoveryFeedState = 'idle' | 'loading' | 'ready' | 'empty' | 'error' | 'exhausted'

type HomeData = {
  paddingTopPx: number
  viewState: HomeViewState
  inbox: InboxSummary
  inboxPreview: InboxViewItem[]
  inboxAnalyzing: InboxViewItem[]
  discoveryFeedState: DiscoveryFeedState
  discoveryErrorMessage: string
  discoveryRefreshing: boolean
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

function inboxSnapshot(): Pick<HomeData, 'inbox' | 'inboxPreview' | 'inboxAnalyzing'> {
  return {
    inbox: getInboxSummary(),
    inboxPreview: getInboxPreviewItems(),
    inboxAnalyzing: getInboxAnalyzingItems(),
  }
}

function deckSnapshot(
  items: DiscoveryItem[],
  cursor: number
): Pick<HomeData, 'featuredIndex' | 'featuredTotal' | 'featuredCursor' | 'current' | 'next'> {
  const total = items.length
  if (!total) {
    return {
      featuredCursor: 0,
      featuredIndex: 0,
      featuredTotal: 0,
      current: null,
      next: null,
    }
  }
  const index = Math.min(Math.max(cursor, 0), total - 1)
  return {
    featuredCursor: index,
    featuredIndex: index + 1,
    featuredTotal: total,
    current: items[index],
    next: index + 1 < total ? items[index + 1] : null,
  }
}

const dismissedContent = new Set<string>()
const acceptedContent = new Set<string>()

let discoveryDeck: DiscoveryItem[] = []
let discoveryLoaded = false
let feedLock = false

Page({
  _gestureTimer: 0,
  _inboxTimer: 0,

  data: {
    paddingTopPx: 56,
    viewState: HOME_VIEW_STATE,
    inbox: { total: 0, analyzing: 0, waiting: 0, done: 0 },
    inboxPreview: [],
    inboxAnalyzing: [],
    discoveryFeedState: 'idle',
    discoveryErrorMessage: '',
    discoveryRefreshing: false,
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
      ...inboxSnapshot(),
    })
    void this.loadDiscoveryFeed()
  },

  onShow() {
    this.setData(inboxSnapshot())
    this.detectIncomingContent()
    this.startInboxTicker()
    if (!discoveryLoaded || this.data.discoveryFeedState === 'error') {
      void this.loadDiscoveryFeed()
    }
  },

  onHide() {
    this.stopInboxTicker()
  },

  onUnload() {
    this.stopInboxTicker()
  },

  onPullDownRefresh() {
    void this.loadDiscoveryFeed({ replace: true, fromRefresh: true })
  },

  onDiscoveryRefresh() {
    this.setData({ discoveryRefreshing: true })
    void this.loadDiscoveryFeed({ replace: true, fromRefresh: true })
  },

  stopRefreshers() {
    this.setData({ discoveryRefreshing: false })
    wx.stopPullDownRefresh()
  },

  async loadDiscoveryFeed(options?: { replace?: boolean; fromRefresh?: boolean }) {
    if (feedLock) {
      if (options && options.fromRefresh) {
        this.stopRefreshers()
      }
      return
    }
    feedLock = true
    const replace = !!(options && options.replace)
    const showAreaLoading =
      !discoveryLoaded || this.data.discoveryFeedState === 'error'
    if (showAreaLoading) {
      this.setData({
        discoveryFeedState: 'loading',
        discoveryErrorMessage: '',
        current: null,
        next: null,
        featuredIndex: 0,
        featuredTotal: 0,
      })
    }
    try {
      const response = await listDiscoveries()
      const deck = mapDiscoveryListToCardViewModels(response.items)
      discoveryDeck = deck
      discoveryLoaded = true
      this.setData({
        discoveryFeedState: deck.length ? 'ready' : 'empty',
        discoveryErrorMessage: '',
        ...deckSnapshot(deck, 0),
        ...inboxSnapshot(),
      })
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[home] discoveries ${apiError.code}`)
      if (!discoveryLoaded || this.data.discoveryFeedState === 'error' || !discoveryDeck.length) {
        this.setData({
          discoveryFeedState: 'error',
          discoveryErrorMessage: getDiscoveryFeedErrorMessage(apiError),
          current: null,
          next: null,
          featuredIndex: 0,
          featuredTotal: 0,
        })
      } else {
        wx.showToast({ title: '暂时无法刷新发现', icon: 'none' })
      }
    } finally {
      feedLock = false
      if (replace || (options && options.fromRefresh)) {
        this.stopRefreshers()
      }
    }
  },

  onRetryDiscovery() {
    void this.loadDiscoveryFeed({ replace: true })
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
      ...inboxSnapshot(),
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

  dismissCurrentCard() {
    const cursor = this.data.featuredCursor
    if (!discoveryDeck.length) {
      return
    }
    discoveryDeck.splice(cursor, 1)
    const nextState: DiscoveryFeedState = discoveryDeck.length ? 'ready' : 'exhausted'
    const nextCursor =
      nextState === 'exhausted'
        ? 0
        : cursor >= discoveryDeck.length
          ? discoveryDeck.length - 1
          : cursor
    this.setData({
      deckEntering: false,
      discoveryFeedState: nextState,
      ...deckSnapshot(discoveryDeck, nextCursor),
      ...inboxSnapshot(),
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
        this.setData(inboxSnapshot())
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

  onOpenDiscovery() {
    return
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
      ...inboxSnapshot(),
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

  onInbox() {
    this.dismissCurrentCard()
  },

  onDeprioritize() {
    this.dismissCurrentCard()
  },
})
