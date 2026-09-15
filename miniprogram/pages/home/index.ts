import { acceptDiscovery, listDiscoveryFeed, markDiscoverySeen, updateDiscoveryDisposition } from '../../api/discoveries'
import { toApiError } from '../../api/errors'
import { getUserSubmission, listMyUserSubmissions, processUserSubmission } from '../../api/submissions'
import type { DiscoveryItem, RecommendedItem } from '../../types/index'
import { startCheckFlow, openSubmissionCheck } from '../../utils/checkSession'
import { getDiscoveryFeedErrorMessage, mapDiscoveryFeedToCardViewModels } from '../../utils/discoveryView'
import {
  createTempRecommendedFromDiscovery,
  filterSucceededRecommendedItems,
  getRecommendedListErrorMessage,
  mapAcceptedSubmissionToRecommended,
  mapMySubmissionsToRecommendedViewModels,
  mapSubmissionDetailToRecommended,
  patchRecommendedItem,
  prependRecommendedItem,
  replaceRecommendedItem,
} from '../../utils/submissionView'

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
  recommendedItems: RecommendedItem[]
  recommendedLoading: boolean
  recommendedError: boolean
  recommendedErrorMessage: string
  discoveryLoading: boolean
  discoveryError: boolean
  discoveryErrorMessage: string
  discoveryCount: number
  current: DiscoveryItem | null
  next: DiscoveryItem | null
  homeRefreshing: boolean
  gesture: GestureState
  deckEntering: boolean
  feedbackLocked: boolean
  composeText: string
}

function getHomePaddingTopPx(): number {
  const menu = wx.getMenuButtonBoundingClientRect()
  if (menu && menu.bottom > 0) {
    return menu.bottom + 8
  }
  return 56
}

function visibleHomeRecommended(items: RecommendedItem[]): RecommendedItem[] {
  return filterSucceededRecommendedItems(items).slice(0, 2)
}

function cloneCard(card: DiscoveryItem): DiscoveryItem {
  return {
    ...card,
  }
}

function applyRecommendedView() {
  return {
    recommendedItems: visibleHomeRecommended(recommendedAll),
  }
}

let discoveryDeck: DiscoveryItem[] = []
let discoveryLoaded = false
let recommendedAll: RecommendedItem[] = []
let recommendedLoaded = false
let recommendedTail: Promise<void> = Promise.resolve()
let feedLock = false
const pendingFeedbackIds = new Set<string>()
const seenAttempted = new Set<string>()

Page({
  _gestureTimer: 0,

  data: {
    paddingTopPx: 56,
    recommendedItems: [],
    recommendedLoading: false,
    recommendedError: false,
    recommendedErrorMessage: '',
    discoveryLoading: false,
    discoveryError: false,
    discoveryErrorMessage: '',
    discoveryCount: 0,
    current: null,
    next: null,
    homeRefreshing: false,
    gesture: { ...IDLE_GESTURE },
    deckEntering: false,
    feedbackLocked: false,
    composeText: '',
  } as HomeData,

  onLoad() {
    this.setData({
      paddingTopPx: getHomePaddingTopPx(),
    })
    void this.loadRecommended()
    void this.loadDiscoveryFeed()
  },

  onShow() {
    void this.loadRecommended()
    if (!discoveryLoaded || this.data.discoveryError) {
      void this.loadDiscoveryFeed()
    }
  },

  onPullDownRefresh() {
    void this.refreshHome()
  },

  onHomeRefresh() {
    this.setData({ homeRefreshing: true })
    void this.refreshHome()
  },

  async refreshHome() {
    await Promise.all([this.loadRecommended(), this.loadDiscoveryFeed()])
    this.setData({ homeRefreshing: false })
    wx.stopPullDownRefresh()
  },

  onRetryRecommended() {
    void this.loadRecommended()
  },

  onRetryDiscovery() {
    void this.loadDiscoveryFeed()
  },

  loadRecommended() {
    const run = () => this.runRecommendedFetch()
    recommendedTail = recommendedTail.then(run, run)
    return recommendedTail
  },

  async runRecommendedFetch() {
    const showLoading = !recommendedLoaded || this.data.recommendedError
    if (showLoading) {
      this.setData({
        recommendedLoading: true,
        recommendedError: false,
        recommendedErrorMessage: '',
      })
    }
    try {
      const response = await listMyUserSubmissions()
      recommendedLoaded = true
      const mapped = mapMySubmissionsToRecommendedViewModels(response.items)
      const temps = recommendedAll.filter((item) => item.id.indexOf('temp-') === 0)
      const pendingTemps = temps.filter((temp) => {
        const discoveryId = temp.tempDiscoveryId
        if (!discoveryId) {
          return true
        }
        return !mapped.some((item) => item.originDiscoveryId === discoveryId)
      })
      recommendedAll = [...pendingTemps, ...mapped]
      this.setData({
        recommendedLoading: false,
        recommendedError: false,
        recommendedErrorMessage: '',
        ...applyRecommendedView(),
      })
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[home] submissions/mine ${apiError.code}`)
      if (!recommendedLoaded) {
        this.setData({
          recommendedLoading: false,
          recommendedError: true,
          recommendedErrorMessage: getRecommendedListErrorMessage(apiError),
          recommendedItems: [],
        })
        recommendedAll = []
      } else {
        this.setData({
          recommendedLoading: false,
        })
        wx.showToast({ title: '暂时无法更新内容', icon: 'none' })
      }
    }
  },

  async loadDiscoveryFeed() {
    if (feedLock) {
      return
    }
    feedLock = true
    const showLoading = !discoveryLoaded || this.data.discoveryError
    if (showLoading) {
      this.setData({
        discoveryLoading: true,
        discoveryError: false,
        discoveryErrorMessage: '',
        current: null,
        next: null,
        discoveryCount: 0,
      })
    }
    try {
      const response = await listDiscoveryFeed()
      discoveryDeck = mapDiscoveryFeedToCardViewModels(response.items)
      discoveryLoaded = true
      pendingFeedbackIds.clear()
      this.applyDeck({ entering: false })
      this.setData({
        discoveryLoading: false,
        discoveryError: false,
        discoveryErrorMessage: '',
        feedbackLocked: false,
      })
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[home] feed ${apiError.code}`)
      if (!discoveryLoaded || this.data.discoveryError || !discoveryDeck.length) {
        discoveryDeck = []
        this.setData({
          discoveryLoading: false,
          discoveryError: true,
          discoveryErrorMessage: getDiscoveryFeedErrorMessage(apiError),
          current: null,
          next: null,
          discoveryCount: 0,
          feedbackLocked: false,
        })
      } else {
        this.setData({
          discoveryLoading: false,
        })
        wx.showToast({ title: '暂时无法更新发现', icon: 'none' })
      }
    } finally {
      feedLock = false
    }
  },

  applyDeck(options?: { entering?: boolean }) {
    const current = discoveryDeck[0] || null
    const next = discoveryDeck[1] || null
    const entering = !!(options && options.entering)
    this.setData({
      current,
      next,
      discoveryCount: discoveryDeck.length,
      deckEntering: entering,
      feedbackLocked: !!(current && pendingFeedbackIds.has(current.id)),
    })
    if (entering) {
      wx.nextTick(() => {
        this.setData({ deckEntering: true })
        setTimeout(() => {
          this.setData({ deckEntering: false })
        }, 280)
      })
    }
    this.maybeMarkCurrentSeen(current)
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

  onOpenAllRecommended() {
    wx.navigateTo({ url: '/pages/submissions/index' })
  },

  onComposeInput(event: { detail: { value: string } }) {
    this.setData({ composeText: event.detail.value })
  },

  onPasteClipboard() {
    wx.getClipboardData({
      success: (res) => {
        const next = (res.data || '').trim()
        if (!next) {
          wx.showToast({ title: '剪贴板为空', icon: 'none' })
          return
        }
        this.setData({ composeText: next })
      },
      fail: () => {
        wx.showToast({ title: '无法读取剪贴板，请手动粘贴', icon: 'none' })
      },
    })
  },

  onComposeCheck() {
    const raw = (this.data.composeText || '').trim()
    if (!startCheckFlow(raw)) {
      return
    }
    this.setData({
      composeText: '',
    })
  },

  onOpenRecommended(event: { detail?: { id?: string }; currentTarget?: { dataset: { id?: string } } }) {
    const id =
      (event.detail && event.detail.id) ||
      (event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.id)
    if (!id || id.indexOf('temp-') === 0) {
      return
    }
    openSubmissionCheck(id)
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

  onDecision(event: { detail: { action?: 'save' | 'deprioritize' } }) {
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

  maybeMarkCurrentSeen(card: DiscoveryItem | null) {
    if (!card) {
      return
    }
    if (card.seenAt) {
      return
    }
    if (seenAttempted.has(card.id)) {
      return
    }
    seenAttempted.add(card.id)
    void markDiscoverySeen(card.id).then(
      () => {
        const current = discoveryDeck.find((item) => item.id === card.id)
        if (current) {
          current.seenAt = current.seenAt || new Date().toISOString()
        }
      },
      (error) => {
        seenAttempted.delete(card.id)
        const apiError = toApiError(error)
        console.warn(`[home] seen ${card.id} ${apiError.code}`)
      }
    )
  },

  setFeedbackLocked(id: string, locked: boolean) {
    if (locked) {
      pendingFeedbackIds.add(id)
    } else {
      pendingFeedbackIds.delete(id)
    }
    const current = discoveryDeck[0]
    this.setData({
      feedbackLocked: !!(current && pendingFeedbackIds.has(current.id)),
    })
  },

  onOpenDiscovery() {
    return
  },

  onSaveDiscovery(event: { detail: { id?: string } }) {
    const id = event.detail.id || (this.data.current && this.data.current.id)
    if (!id) {
      return
    }
    void this.acceptCurrentCard(id)
  },

  onDeprioritizeDiscovery(event: { detail: { id?: string } }) {
    const id = event.detail.id || (this.data.current && this.data.current.id)
    if (!id) {
      return
    }
    void this.deprioritizeCurrentCard(id)
  },

  async acceptCurrentCard(id: string) {
    if (pendingFeedbackIds.has(id)) {
      return
    }
    const current = discoveryDeck[0]
    if (!current || current.id !== id) {
      return
    }
    this.setFeedbackLocked(id, true)
    const acceptedCard = cloneCard(current)
    const previousAll = recommendedAll.slice()
    const tempCard = createTempRecommendedFromDiscovery(acceptedCard)
    discoveryDeck = discoveryDeck.slice(1)
    recommendedAll = prependRecommendedItem(previousAll, tempCard)
    this.setData({
      recommendedError: false,
      ...applyRecommendedView(),
    })
    this.applyDeck({ entering: true })
    try {
      const result = await acceptDiscovery(id)
      const realCard = mapAcceptedSubmissionToRecommended(result.submission, acceptedCard.title)
      recommendedAll = replaceRecommendedItem(recommendedAll, tempCard.id, realCard)
      this.setData(applyRecommendedView())
      this.setFeedbackLocked(id, false)
      if (result.submission.status === 'pending') {
        void this.processAcceptedSubmission(realCard)
      } else if (result.submission.status === 'succeeded') {
        this.setData(applyRecommendedView())
      }
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[home] accept ${id} ${apiError.code}`)
      discoveryDeck = [acceptedCard, ...discoveryDeck.filter((item) => item.id !== acceptedCard.id)]
      recommendedAll = previousAll
      this.setData(applyRecommendedView())
      this.applyDeck({ entering: false })
      this.setFeedbackLocked(id, false)
      wx.showToast({
        title: apiError.code === 'DISCOVERY_NOT_FOUND' ? '这条发现已不可用' : '操作没有保存，请重试',
        icon: 'none',
      })
    }
  },

  async processAcceptedSubmission(item: RecommendedItem) {
    const title = item.title
    recommendedAll = patchRecommendedItem(recommendedAll, item.id, {
      status: 'ingesting',
      statusText: '读取中',
    })
    this.setData(applyRecommendedView())
    try {
      const detail = await processUserSubmission(item.id)
      recommendedAll = replaceRecommendedItem(
        recommendedAll,
        item.id,
        mapSubmissionDetailToRecommended(detail, title)
      )
      this.setData(applyRecommendedView())
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[home] process ${item.id} ${apiError.code}`)
      if (apiError.code === 'REQUEST_TIMEOUT' || apiError.code === 'NETWORK_ERROR') {
        recommendedAll = patchRecommendedItem(recommendedAll, item.id, {
          status: 'checking',
          statusText: '处理中',
        })
        this.setData(applyRecommendedView())
        try {
          const detail = await getUserSubmission(item.id)
          recommendedAll = replaceRecommendedItem(
            recommendedAll,
            item.id,
            mapSubmissionDetailToRecommended(detail, title)
          )
          this.setData(applyRecommendedView())
        } catch (lookupError) {
          console.warn(`[home] process-check ${item.id} ${toApiError(lookupError).code}`)
        }
        return
      }
      if (apiError.code === 'SUBMISSION_ALREADY_PROCESSING') {
        recommendedAll = patchRecommendedItem(recommendedAll, item.id, {
          status: 'checking',
          statusText: '处理中',
        })
        this.setData(applyRecommendedView())
        return
      }
      recommendedAll = patchRecommendedItem(recommendedAll, item.id, {
        status: 'failed',
        statusText: '解析失败',
      })
      this.setData(applyRecommendedView())
    }
  },

  async deprioritizeCurrentCard(id: string) {
    if (pendingFeedbackIds.has(id)) {
      return
    }
    const current = discoveryDeck[0]
    if (!current || current.id !== id) {
      return
    }
    if (current.visualState === 'deprioritized') {
      discoveryDeck = [...discoveryDeck.slice(1), cloneCard(current)]
      this.applyDeck({ entering: true })
      return
    }
    this.setFeedbackLocked(id, true)
    const original = cloneCard(current)
    const rest = discoveryDeck.slice(1).map(cloneCard)
    const rotated = cloneCard(current)
    rotated.visualState = 'deprioritized'
    discoveryDeck = [...rest, rotated]
    this.applyDeck({ entering: true })
    try {
      await updateDiscoveryDisposition(id, 'deprioritized')
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[home] disposition deprioritized ${id} ${apiError.code}`)
      if (apiError.code !== 'DISCOVERY_NOT_FOUND') {
        discoveryDeck = [original, ...rest]
        this.applyDeck({ entering: false })
        wx.showToast({ title: '操作没有保存，请重试', icon: 'none' })
      } else {
        wx.showToast({ title: '这条发现已不可用', icon: 'none' })
      }
    } finally {
      this.setFeedbackLocked(id, false)
    }
  },
})
