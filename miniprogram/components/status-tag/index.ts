import type { StatusTagTone } from '../../types/index'

const TONE_MAP: Record<string, StatusTagTone> = {
  政策: 'info',
  场景: 'brand',
  创赛: 'success',
  金融服务: 'info',
  融资: 'warning',
  园区服务: 'brand',
  高匹配: 'success',
  进行中: 'info',
  等待结果: 'warning',
  系统: 'neutral',
}

function resolveTone(text: string): StatusTagTone {
  return TONE_MAP[text] || 'neutral'
}

Component({
  properties: {
    text: {
      type: String,
      value: '',
    },
  },
  data: {
    tone: 'neutral' as StatusTagTone,
  },
  lifetimes: {
    attached() {
      this.syncTone(this.properties.text)
    },
  },
  observers: {
    text(value: unknown) {
      this.syncTone(value)
    },
  },
  methods: {
    syncTone(value: unknown) {
      const text = typeof value === 'string' ? value : ''
      this.setData({ tone: resolveTone(text) })
    },
  },
})
