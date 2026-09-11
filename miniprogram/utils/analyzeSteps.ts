export const ANALYZE_STEPS = [
  '正在读取内容',
  '正在判断内容性质',
  '正在查找原始来源',
  '正在核对有效信息',
  '正在匹配真实机会',
  '正在结合企业状态判断',
]

export const ANALYZE_STEP_DELAY_MS = 720

export type AnalyzeStepView = {
  key: string
  text: string
  done: boolean
  active: boolean
}

export function buildAnalyzeSteps(currentIndex: number): AnalyzeStepView[] {
  const capped = Math.max(0, Math.min(currentIndex, ANALYZE_STEPS.length))
  return ANALYZE_STEPS.map((text, index) => ({
    key: `analyze-${index}`,
    text,
    done: index < capped,
    active: index === capped && capped < ANALYZE_STEPS.length,
  }))
}
