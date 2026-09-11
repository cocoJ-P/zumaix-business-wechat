import { resolveIntelligenceCase } from '../../mock/intelligenceCases'
import type { CheckInput } from '../../types/index'
import type { IntelligenceResult } from '../../types/business'
import { openOpportunityDetail, takePendingCheck } from '../../utils/checkSession'
import { markInboxDone } from '../../utils/workbench'
import {
  ANALYZE_STEPS,
  ANALYZE_STEP_DELAY_MS,
  buildAnalyzeSteps,
} from '../../utils/analyzeSteps'
import type { AnalyzeStepView } from '../../utils/analyzeSteps'

let runningTimers: number[] = []

type CheckPhase = 'loading' | 'result' | 'invalid' | 'error'

type CheckData = {
  phase: CheckPhase
  steps: AnalyzeStepView[]
  result: IntelligenceResult | null
}

function clearRunningTimers(): void {
  runningTimers.forEach((id) => clearTimeout(id))
  runningTimers = []
}

Page({
  data: {
    phase: 'loading',
    steps: buildAnalyzeSteps(0),
    result: null,
  } as CheckData,

  onLoad() {
    const input = takePendingCheck()
    if (!input) {
      this.setData({ phase: 'invalid' })
      return
    }
    this._input = input
    this.startMockFlow(input)
  },

  onUnload() {
    clearRunningTimers()
  },

  startMockFlow(input: CheckInput) {
    clearRunningTimers()
    this.setData({
      phase: 'loading',
      steps: buildAnalyzeSteps(0),
      result: null,
    })

    ANALYZE_STEPS.forEach((_, index) => {
      if (index === 0) {
        return
      }
      runningTimers.push(
        setTimeout(() => {
          this.setData({ steps: buildAnalyzeSteps(index) })
        }, index * ANALYZE_STEP_DELAY_MS)
      )
    })

    runningTimers.push(
      setTimeout(() => {
        try {
          const result = resolveIntelligenceCase(input.raw)
          markInboxDone(input.raw, result.opportunityId)
          this.setData({
            phase: 'result',
            steps: buildAnalyzeSteps(ANALYZE_STEPS.length),
            result,
          })
        } catch {
          this.setData({ phase: 'error' })
        }
      }, ANALYZE_STEPS.length * ANALYZE_STEP_DELAY_MS)
    )
  },

  onOpenOpportunity() {
    const result = this.data.result
    if (!result || !result.opportunityId) {
      wx.showToast({ title: '没有可查看的机会', icon: 'none' })
      return
    }
    openOpportunityDetail(result.opportunityId)
  },

  onOpenOfficial() {
    wx.showToast({ title: '官方来源将在接入真实数据后打开', icon: 'none' })
  },

  onBackHome() {
    wx.switchTab({
      url: '/pages/home/index',
      fail: () => {
        wx.reLaunch({ url: '/pages/home/index' })
      },
    })
  },
})
