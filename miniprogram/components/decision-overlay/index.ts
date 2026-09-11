Component({
  properties: {
    active: {
      type: Boolean,
      value: false,
    },
    direction: {
      type: String,
      value: '',
    },
    progress: {
      type: Number,
      value: 0,
    },
    armed: {
      type: Boolean,
      value: false,
    },
    committed: {
      type: Boolean,
      value: false,
    },
    rawDx: {
      type: Number,
      value: 0,
    },
  },
  data: {
    leftOn: false,
    rightOn: false,
    leftText: '← 降低优先级',
    rightText: '加入待处理 →',
    leftStyle: '',
    rightStyle: '',
    leftArmed: false,
    rightArmed: false,
    live: false,
  },
  observers: {
    'active, direction, progress, armed, committed, rawDx'() {
      this.sync()
    },
  },
  lifetimes: {
    attached() {
      this.sync()
    },
  },
  methods: {
    sync() {
      const active = this.properties.active
      const committed = this.properties.committed
      const armed = this.properties.armed
      const direction = this.properties.direction as string
      const rawDx = Number(this.properties.rawDx) || 0
      const absDx = Math.abs(rawDx)
      const overlayStart = 32
      const commitAt = 200
      let appear = 0
      if (committed || armed) {
        appear = 1
      } else if (active && absDx > overlayStart) {
        appear = Math.min(1, (absDx - overlayStart) / (commitAt - overlayStart))
      }
      const show = (active || committed) && appear > 0
      const leftOn = show && direction === 'left'
      const rightOn = show && direction === 'right'
      const leftArmed = leftOn && (armed || committed)
      const rightArmed = rightOn && (armed || committed)
      let leftText = '← 降低优先级'
      let rightText = '加入待处理 →'
      if (committed && direction === 'left') {
        leftText = '✓ 已降低优先级'
      } else if (leftArmed) {
        leftText = '✓ 降低优先级'
      }
      if (committed && direction === 'right') {
        rightText = '✓ 已加入待处理'
      } else if (rightArmed) {
        rightText = '✓ 加入待处理'
      }
      this.setData({
        leftOn,
        rightOn,
        leftText,
        rightText,
        leftArmed,
        rightArmed,
        leftStyle: `opacity: ${leftOn ? appear : 0};`,
        rightStyle: `opacity: ${rightOn ? appear : 0};`,
        live: !!(active && !committed),
      })
    },
  },
})
