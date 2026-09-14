import { toApiError } from '../../api/errors'
import { listMyUserSubmissions } from '../../api/submissions'
import type { RecommendedItem } from '../../types/index'
import { openSubmissionCheck } from '../../utils/checkSession'
import {
  getRecommendedListErrorMessage,
  mapMySubmissionsToRecommendedViewModels,
} from '../../utils/submissionView'

type SubmissionsData = {
  loading: boolean
  error: boolean
  errorMessage: string
  items: RecommendedItem[]
}

Page({
  data: {
    loading: false,
    error: false,
    errorMessage: '',
    items: [],
  } as SubmissionsData,

  onShow() {
    void this.loadList()
  },

  onPullDownRefresh() {
    void this.loadList(true)
  },

  onRetry() {
    void this.loadList()
  },

  async loadList(fromRefresh?: boolean) {
    const showLoading = !this.data.items.length || this.data.error
    if (showLoading) {
      this.setData({
        loading: true,
        error: false,
        errorMessage: '',
      })
    }
    try {
      const response = await listMyUserSubmissions()
      this.setData({
        loading: false,
        error: false,
        errorMessage: '',
        items: mapMySubmissionsToRecommendedViewModels(response.items),
      })
    } catch (error) {
      const apiError = toApiError(error)
      console.warn(`[submissions] mine ${apiError.code}`)
      this.setData({
        loading: false,
        error: true,
        errorMessage: getRecommendedListErrorMessage(apiError),
        items: this.data.items,
      })
    } finally {
      if (fromRefresh) {
        wx.stopPullDownRefresh()
      }
    }
  },

  onOpenItem(event: { detail?: { id?: string } }) {
    const id = event.detail && event.detail.id
    if (!id || id.indexOf('temp-') === 0) {
      return
    }
    openSubmissionCheck(id)
  },
})
