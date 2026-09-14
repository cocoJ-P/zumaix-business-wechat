import { ApiError, toApiError } from '../../api/errors'
import {
  createUserSubmission,
  getUserSubmission,
  processUserSubmission,
} from '../../api/submissions'
import type { UserSubmissionDetail } from '../../api/types'
import type { CheckInput } from '../../types/index'
import { releaseCheckFlowLock, takePendingCheck } from '../../utils/checkSession'
import {
  emptyIntelligenceView,
  getCheckErrorMessage,
  mapSubmissionDetailToIntelligenceViewModel,
} from '../../utils/intelligenceView'
import type {
  CheckPhase,
  ErrorAction,
  ErrorStage,
  IntelligenceViewModel,
} from '../../utils/intelligenceView'

type CheckData = {
  phase: CheckPhase
  busy: boolean
  busyTitle: string
  busyMessage: string
  errorMessage: string
  errorStage: ErrorStage
  errorAction: ErrorAction
  retryButtonText: string
  view: IntelligenceViewModel
  showMaterials: boolean
  showProcess: boolean
}

function isAmbiguousNetworkError(error: ApiError): boolean {
  return error.code === 'REQUEST_TIMEOUT' || error.code === 'NETWORK_ERROR'
}

Page({
  _alive: false,
  _flowLock: false,
  _input: undefined as CheckInput | undefined,
  _submissionId: undefined as string | undefined,

  data: {
    phase: 'idle',
    busy: false,
    busyTitle: '',
    busyMessage: '',
    errorMessage: '',
    errorStage: null,
    errorAction: 'retry',
    retryButtonText: '重新分析',
    view: emptyIntelligenceView(),
    showMaterials: false,
    showProcess: false,
  } as CheckData,

  onLoad() {
    this._alive = true
    const input = takePendingCheck()
    if (!input) {
      this.setData({ phase: 'idle' })
      return
    }
    this._input = input
    this._submissionId = undefined
    void this.startCreate()
  },

  onUnload() {
    this._alive = false
    releaseCheckFlowLock()
  },

  safeSetData(patch: Partial<CheckData> | Record<string, unknown>) {
    if (!this._alive) {
      return
    }
    this.setData(patch)
  },

  unlockFlow() {
    this._flowLock = false
  },

  startCreate() {
    const input = this._input
    if (!input || this._flowLock) {
      return
    }
    this._flowLock = true
    this._submissionId = undefined
    this.safeSetData({
      phase: 'creating',
      busy: true,
      busyTitle: '正在提交查查任务…',
      busyMessage: '',
      errorMessage: '',
      errorStage: null,
      errorAction: 'retry',
      retryButtonText: '重新分析',
      view: emptyIntelligenceView(),
      showMaterials: false,
      showProcess: false,
    })
    void this.runCreate(input)
  },

  async runCreate(input: CheckInput) {
    try {
      const created = await createUserSubmission({
        input_type: input.kind,
        content: input.raw,
      })
      if (!this._alive) {
        return
      }
      this._submissionId = created.id
      await this.runProcess()
    } catch (error) {
      this.failCreate(error)
    }
  },

  startProcessOnly() {
    if (this._flowLock || !this._submissionId) {
      return
    }
    this._flowLock = true
    this.safeSetData({
      phase: 'processing',
      busy: true,
      busyTitle: '正在读取并分析这条内容…',
      busyMessage: '网页读取和智能分析可能需要一些时间',
      errorMessage: '',
    })
    void this.runProcess()
  },

  async runProcess() {
    const submissionId = this._submissionId
    if (!submissionId) {
      this.failCreate(new ApiError({
        code: 'UNKNOWN_ERROR',
        message: '查查记录尚未创建，请重新发起',
      }))
      return
    }
    this.safeSetData({
      phase: 'processing',
      busy: true,
      busyTitle: '正在读取并分析这条内容…',
      busyMessage: '网页读取和智能分析可能需要一些时间',
    })
    try {
      const detail = await processUserSubmission(submissionId)
      if (!this._alive) {
        return
      }
      this.applyProcessDetail(detail)
    } catch (error) {
      this.failProcess(error)
    }
  },

  applyProcessDetail(detail: UserSubmissionDetail) {
    const localId = this._submissionId
    if (localId && detail.submission.id !== localId) {
      console.error(`[check] submission id mismatch local=${localId} remote=${detail.submission.id}`)
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'process',
        errorAction: 'retry',
        retryButtonText: '重新分析',
        errorMessage: '当前查查记录状态异常，请稍后重试。',
      })
      return
    }
    this.applySubmissionDetail(detail, 'process')
  },

  applySubmissionDetail(detail: UserSubmissionDetail, from: 'process' | 'get') {
    const status = detail.submission.status
    if (status === 'succeeded') {
      this.unlockFlow()
      this.safeSetData({
        phase: 'success',
        busy: false,
        errorStage: null,
        errorMessage: '',
        view: mapSubmissionDetailToIntelligenceViewModel(detail),
        showMaterials: false,
        showProcess: false,
      })
      return
    }
    if (status === 'failed') {
      const code = detail.submission.error_code || 'SUBMISSION_PROCESSING_FAILED'
      const kind = this._input ? this._input.kind : 'text'
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'process',
        errorAction: 'retry',
        retryButtonText: '重新分析',
        errorMessage: getCheckErrorMessage(
          new ApiError({
            code,
            message: detail.submission.error_message || '查查处理暂时失败，请稍后重试。',
          }),
          'process',
          kind
        ),
      })
      return
    }
    if (status === 'ingesting' || status === 'analyzing') {
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'process',
        errorAction: 'check',
        retryButtonText: '检查结果',
        errorMessage: from === 'get'
          ? '这次查查仍在处理中，请稍后再检查。'
          : '任务仍在处理中，请稍后重试',
      })
      return
    }
    this.unlockFlow()
    this.safeSetData({
      phase: 'error',
      busy: false,
      errorStage: 'process',
      errorAction: from === 'get' ? 'retry' : 'check',
      retryButtonText: from === 'get' ? '重新分析' : '检查结果',
      errorMessage: '任务仍在处理中，请稍后重试',
    })
  },

  failCreate(error: unknown) {
    const apiError = toApiError(error)
    const kind = this._input ? this._input.kind : 'text'
    console.warn(`[check] create ${apiError.code}`)
    this._submissionId = undefined
    this.unlockFlow()
    this.safeSetData({
      phase: 'error',
      busy: false,
      errorStage: 'create',
      errorAction: 'retry',
      retryButtonText: '重新分析',
      errorMessage: getCheckErrorMessage(apiError, 'create', kind),
    })
  },

  failProcess(error: unknown) {
    const apiError = toApiError(error)
    const kind = this._input ? this._input.kind : 'text'
    if (apiError.code === 'SUBMISSION_STATE_INVALID') {
      console.error(`[check] ${apiError.code}`)
    } else {
      console.warn(`[check] process ${apiError.code}`)
    }
    if (apiError.code === 'SUBMISSION_NOT_FOUND') {
      this._submissionId = undefined
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'create',
        errorAction: 'retry',
        retryButtonText: '重新分析',
        errorMessage: getCheckErrorMessage(apiError, 'process', kind),
      })
      return
    }
    if (apiError.code === 'SUBMISSION_ALREADY_PROCESSING') {
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'process',
        errorAction: 'check',
        retryButtonText: '检查结果',
        errorMessage: getCheckErrorMessage(apiError, 'process', kind),
      })
      return
    }
    if (this._submissionId && isAmbiguousNetworkError(apiError)) {
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'process',
        errorAction: 'check',
        retryButtonText: '检查结果',
        errorMessage: '本次处理状态暂时无法确认，可以重新检查。',
      })
      return
    }
    this.unlockFlow()
    this.safeSetData({
      phase: 'error',
      busy: false,
      errorStage: 'process',
      errorAction: 'retry',
      retryButtonText: '重新分析',
      errorMessage: getCheckErrorMessage(apiError, 'process', kind),
    })
  },

  onRetry() {
    if (this._flowLock) {
      return
    }
    if (this.data.errorAction === 'check') {
      void this.checkResult()
      return
    }
    if (this.data.errorStage === 'process' && this._submissionId) {
      this.startProcessOnly()
      return
    }
    this.startCreate()
  },

  async checkResult() {
    const submissionId = this._submissionId
    if (!submissionId || this._flowLock) {
      return
    }
    this._flowLock = true
    this.safeSetData({
      busy: true,
      busyTitle: '正在检查结果…',
      busyMessage: '',
    })
    try {
      const detail = await getUserSubmission(submissionId)
      if (!this._alive) {
        return
      }
      this.applySubmissionDetail(detail, 'get')
    } catch (error) {
      const apiError = toApiError(error)
      const kind = this._input ? this._input.kind : 'text'
      if (apiError.code === 'SUBMISSION_STATE_INVALID') {
        console.error(`[check] ${apiError.code}`)
      } else {
        console.warn(`[check] get ${apiError.code}`)
      }
      if (apiError.code === 'SUBMISSION_NOT_FOUND') {
        this._submissionId = undefined
        this.unlockFlow()
        this.safeSetData({
          phase: 'error',
          busy: false,
          errorStage: 'create',
          errorAction: 'retry',
          retryButtonText: '重新分析',
          errorMessage: getCheckErrorMessage(apiError, 'process', kind),
        })
        return
      }
      this.unlockFlow()
      this.safeSetData({
        phase: 'error',
        busy: false,
        errorStage: 'process',
        errorAction: 'check',
        retryButtonText: '检查结果',
        errorMessage: getCheckErrorMessage(apiError, 'process', kind),
      })
    }
  },

  onNewAnalysis() {
    if (this._flowLock) {
      return
    }
    this._input = undefined
    this._submissionId = undefined
    this.unlockFlow()
    this.safeSetData({
      phase: 'idle',
      busy: false,
      errorMessage: '',
      errorStage: null,
      errorAction: 'retry',
      retryButtonText: '重新分析',
      view: emptyIntelligenceView(),
      showMaterials: false,
      showProcess: false,
    })
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/home/index',
          fail: () => {
            wx.reLaunch({ url: '/pages/home/index' })
          },
        })
      },
    })
  },

  onToggleMaterials() {
    this.safeSetData({ showMaterials: !this.data.showMaterials })
  },

  onToggleProcess() {
    this.safeSetData({ showProcess: !this.data.showProcess })
  },

  onCopyOfficialUrl() {
    const url = this.data.view.officialUrl
    if (!url) {
      return
    }
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '已复制内容中提到的官方链接', icon: 'none' })
      },
    })
  },
})
