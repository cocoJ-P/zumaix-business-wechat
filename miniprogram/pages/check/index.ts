import { ingestContent } from '../../api/content'
import { ApiError, toApiError } from '../../api/errors'
import { analyzeOpportunitySource } from '../../api/intelligence'
import type { CheckInput } from '../../types/index'
import { takePendingCheck } from '../../utils/checkSession'
import {
  emptyIntelligenceView,
  getCheckErrorMessage,
  mapIntelligenceResultToViewModel,
  mapSourcePreview,
} from '../../utils/intelligenceView'
import type {
  CheckPhase,
  ErrorStage,
  IntelligenceViewModel,
  SourcePreviewView,
} from '../../utils/intelligenceView'

type CheckData = {
  phase: CheckPhase
  busy: boolean
  busyTitle: string
  busyMessage: string
  errorMessage: string
  errorStage: ErrorStage
  sourcePreview: SourcePreviewView
  view: IntelligenceViewModel
  showMaterials: boolean
  showProcess: boolean
}

function busyCopy(phase: 'ingesting' | 'analyzing', kind: CheckInput['kind']): {
  busyTitle: string
  busyMessage: string
} {
  if (phase === 'ingesting') {
    if (kind === 'url') {
      return {
        busyTitle: '正在解析',
        busyMessage: '正在读取网页并提取正文…',
      }
    }
    return {
      busyTitle: '正在解析',
      busyMessage: '正在整理正文内容…',
    }
  }
  return {
    busyTitle: '内容已解析',
    busyMessage: '正在理解其中的机会信息…',
  }
}

Page({
  data: {
    phase: 'idle',
    busy: false,
    busyTitle: '',
    busyMessage: '',
    errorMessage: '',
    errorStage: null,
    sourcePreview: emptyIntelligenceView().sourcePreview,
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
    this._ingest = null
    void this.startIngest()
  },

  onUnload() {
    this._alive = false
  },

  safeSetData(patch: Partial<CheckData> | Record<string, unknown>) {
    if (!this._alive) {
      return
    }
    this.setData(patch)
  },

  startIngest() {
    const input = this._input
    if (!input || this.data.busy) {
      return
    }
    const copy = busyCopy('ingesting', input.kind)
    this.safeSetData({
      phase: 'ingesting',
      busy: true,
      busyTitle: copy.busyTitle,
      busyMessage: copy.busyMessage,
      errorMessage: '',
      errorStage: null,
      view: emptyIntelligenceView(),
      showMaterials: false,
      showProcess: false,
    })
    void this.runIngest(input)
  },

  async runIngest(input: CheckInput) {
    try {
      const ingest = await ingestContent({
        content_type: input.kind,
        content: input.raw,
      })
      if (!this._alive) {
        return
      }
      this._ingest = ingest
      this._sourceId = ingest.source.id
      this._ingestionId = ingest.ingestion.id
      this.safeSetData({
        sourcePreview: mapSourcePreview(ingest),
      })
      await this.runAnalyze()
    } catch (error) {
      this.fail('ingest', error)
    }
  },

  startAnalyzeOnly() {
    if (this.data.busy || !this._sourceId || !this._ingestionId) {
      return
    }
    const input = this._input
    const copy = busyCopy('analyzing', input ? input.kind : 'text')
    this.safeSetData({
      phase: 'analyzing',
      busy: true,
      busyTitle: copy.busyTitle,
      busyMessage: copy.busyMessage,
      errorMessage: '',
    })
    void this.runAnalyze()
  },

  async runAnalyze() {
    const sourceId = this._sourceId
    const ingestionId = this._ingestionId
    const ingest = this._ingest
    if (!sourceId || !ingestionId || !ingest) {
      this.fail('analyze', new ApiError({
        code: 'UNKNOWN_ERROR',
        message: '分析上下文丢失，请重新提交内容',
      }))
      return
    }
    const copy = busyCopy('analyzing', this._input ? this._input.kind : 'text')
    this.safeSetData({
      phase: 'analyzing',
      busy: true,
      busyTitle: copy.busyTitle,
      busyMessage: copy.busyMessage,
    })
    try {
      const analyze = await analyzeOpportunitySource(sourceId, {
        ingestion_id: ingestionId,
        force: false,
      })
      if (!this._alive) {
        return
      }
      if (analyze.run.status !== 'succeeded') {
        throw new ApiError({
          code: analyze.run.error_code || 'LLM_PROVIDER_ERROR',
          message: analyze.run.error_message || '智能分析服务暂时不可用',
        })
      }
      this.safeSetData({
        phase: 'success',
        busy: false,
        errorStage: null,
        errorMessage: '',
        view: mapIntelligenceResultToViewModel(ingest, analyze),
        showMaterials: false,
        showProcess: false,
      })
    } catch (error) {
      this.fail('analyze', error)
    }
  },

  fail(stage: 'ingest' | 'analyze', error: unknown) {
    const apiError = toApiError(error)
    const kind = this._input ? this._input.kind : 'text'
    console.warn(`[check] ${stage} ${apiError.code}`)
    this.safeSetData({
      phase: 'error',
      busy: false,
      errorStage: stage,
      errorMessage: getCheckErrorMessage(apiError, stage, kind),
    })
  },

  onRetry() {
    if (this.data.busy) {
      return
    }
    if (this.data.errorStage === 'analyze' && this._sourceId && this._ingestionId) {
      this.startAnalyzeOnly()
      return
    }
    this.startIngest()
  },

  onNewAnalysis() {
    this._input = undefined
    this._ingest = null
    this._sourceId = undefined
    this._ingestionId = undefined
    this.safeSetData({
      phase: 'idle',
      busy: false,
      errorMessage: '',
      errorStage: null,
      view: emptyIntelligenceView(),
      sourcePreview: emptyIntelligenceView().sourcePreview,
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
