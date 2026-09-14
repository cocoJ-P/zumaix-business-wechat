import type { DiscoveryItem } from '../../types/index'

const TINT_MAP: Record<string, string> = {
  政策: 'policy',
  场景: 'scene',
  场景机会: 'scene',
  创赛: 'contest',
  金融服务: 'finance',
  融资: 'funding',
  股权融资: 'funding',
  园区服务: 'park',
  内容: 'policy',
  推荐: 'policy',
  其他: 'policy',
}

const AXIS_LOCK = 9
const COMMIT_THRESHOLD = 200
const MAX_VISUAL_X = 20
const DAMPING = 70
const COMPACT_MAX = 132
const COMPACT_THRESHOLD = 72
const SETTLE_MS = 200
const COMMIT_MS = 220

Component({
  properties: {
    item: {
      type: Object,
      value: {} as DiscoveryItem,
    },
    size: {
      type: String,
      value: 'large',
    },
  },
  data: {
    tint: 'policy',
    tx: 0,
    visualDx: 0,
    visualY: 0,
    scale: 1,
    opacity: 1,
    displayTitle: '',
    flipped: false,
    flipping: false,
    deciding: false,
    settling: false,
    committing: false,
    moverStyle: '',
  },
  lifetimes: {
    attached() {
      this.syncTint(this.properties.item)
      this.resetMotion(true)
    },
    detached() {
      this.clearFlipTimer()
      this.clearMotionTimer()
    },
  },
  observers: {
    item(value: unknown) {
      this.syncTint(value)
      this.clearFlipTimer()
      this.clearMotionTimer()
      this._committing = false
      this.setData({
        flipped: false,
        flipping: false,
      })
      this.resetMotion(true)
    },
  },
  methods: {
    syncTint(value: unknown) {
      const item = value as DiscoveryItem
      const kind = item && item.kind ? item.kind : '政策'
      this.setData({
        tint: TINT_MAP[kind] || 'policy',
        displayTitle: (item && item.title ? item.title : '').replace(/\n/g, ''),
      })
    },
    isLarge() {
      return this.properties.size === 'large'
    },
    clearFlipTimer() {
      if (this._flipTimer) {
        clearTimeout(this._flipTimer)
        this._flipTimer = 0
      }
    },
    clearMotionTimer() {
      if (this._motionTimer) {
        clearTimeout(this._motionTimer)
        this._motionTimer = 0
      }
    },
    mapVisualX(rawDx: number) {
      return MAX_VISUAL_X * Math.tanh(rawDx / DAMPING)
    },
    motionStyle(visualDx: number, visualY: number, scale: number, opacity: number) {
      if (!this.isLarge()) {
        return `transform: translateX(${visualDx}px);`
      }
      return `transform: translateX(${visualDx}px) translateY(${visualY}px) scale(${scale}); opacity: ${opacity};`
    },
    resetMotion(silent?: boolean) {
      const moverStyle = this.motionStyle(0, 0, 1, 1)
      this.setData({
        tx: 0,
        visualDx: 0,
        visualY: 0,
        scale: 1,
        opacity: 1,
        deciding: false,
        settling: false,
        committing: false,
        moverStyle,
      })
      if (!silent && this.isLarge()) {
        this.triggerEvent('gesturechange', { active: false })
      }
    },
    emitGesture(rawDx: number, armed: boolean) {
      if (!this.isLarge()) {
        return
      }
      const progress = Math.min(1, Math.abs(rawDx) / COMMIT_THRESHOLD)
      this.triggerEvent('gesturechange', {
        active: true,
        direction: rawDx > 0 ? 'right' : 'left',
        rawDx,
        progress,
        armed,
      })
    },
    onStart(event: { touches: Array<{ clientX: number; clientY: number }> }) {
      if (this.data.flipping || this._committing) {
        return
      }
      const touch = event.touches[0]
      this._startX = touch.clientX
      this._startY = touch.clientY
      this._swiped = false
      this._axis = ''
      this._rawDx = 0
      this._didHaptic = false
    },
    onMove(event: { touches: Array<{ clientX: number; clientY: number }> }) {
      if (this.data.flipping || this._committing) {
        return
      }
      const touch = event.touches[0]
      const dx = touch.clientX - this._startX
      const dy = touch.clientY - this._startY
      if (!this._axis) {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) {
          return
        }
        this._axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
      if (this._axis !== 'x') {
        return
      }
      this._swiped = true
      this._rawDx = dx
      if (!this.isLarge()) {
        const tx = Math.max(-COMPACT_MAX, Math.min(COMPACT_MAX, dx))
        this.setData({
          tx,
          moverStyle: this.motionStyle(tx, 0, 1, 1),
        })
        return
      }
      const visualDx = this.mapVisualX(dx)
      const armed = Math.abs(dx) >= COMMIT_THRESHOLD
      if (armed && !this._didHaptic) {
        this._didHaptic = true
        wx.vibrateShort({ type: 'light' })
      }
      this.setData({
        visualDx,
        visualY: -3,
        scale: 1.012,
        opacity: 1,
        deciding: true,
        settling: false,
        moverStyle: this.motionStyle(visualDx, -3, 1.012, 1),
      })
      this.emitGesture(dx, armed)
    },
    onEnd() {
      if (this._committing || this.data.flipping) {
        return
      }
      if (this._axis !== 'x') {
        return
      }
      const rawDx = this._rawDx || 0
      if (this.isLarge()) {
        if (rawDx >= COMMIT_THRESHOLD) {
          this.commit('inbox')
          return
        }
        if (rawDx <= -COMMIT_THRESHOLD) {
          this.commit('deprioritize')
          return
        }
        this.rebound()
        return
      }
      const tx = this.data.tx as number
      if (tx >= COMPACT_THRESHOLD) {
        this.commitCompact('inbox')
        return
      }
      if (tx <= -COMPACT_THRESHOLD) {
        this.commitCompact('deprioritize')
        return
      }
      this.setData({
        tx: 0,
        moverStyle: this.motionStyle(0, 0, 1, 1),
      })
    },
    rebound() {
      this.clearMotionTimer()
      this.setData({
        visualDx: 0,
        visualY: 0,
        scale: 1,
        opacity: 1,
        deciding: false,
        settling: true,
        committing: false,
        moverStyle: this.motionStyle(0, 0, 1, 1),
      })
      this.triggerEvent('gesturechange', { active: false })
      this._motionTimer = setTimeout(() => {
        this.setData({ settling: false })
      }, SETTLE_MS)
    },
    commit(action: 'inbox' | 'deprioritize') {
      this._committing = true
      this.clearMotionTimer()
      const visualDx = this.data.visualDx as number
      this.setData({
        deciding: false,
        settling: false,
        committing: true,
        visualY: -6,
        scale: 0.985,
        opacity: 0,
        moverStyle: this.motionStyle(visualDx, -6, 0.985, 0),
      })
      this.triggerEvent('decision', { action })
      this.triggerEvent('gesturechange', {
        active: true,
        direction: action === 'inbox' ? 'right' : 'left',
        rawDx: this._rawDx || 0,
        progress: 1,
        armed: true,
        committed: true,
      })
      const item = this.properties.item as DiscoveryItem
      const id = item.id
      this._motionTimer = setTimeout(() => {
        this.triggerEvent(action, { id, fromGesture: true })
      }, COMMIT_MS)
    },
    commitCompact(action: 'inbox' | 'deprioritize') {
      const item = this.properties.item as DiscoveryItem
      const tx = action === 'inbox' ? COMPACT_MAX : -COMPACT_MAX
      this.setData({
        tx,
        moverStyle: this.motionStyle(tx, 0, 1, 1),
      })
      this.triggerEvent(action, { id: item.id })
      setTimeout(() => {
        this.setData({
          tx: 0,
          moverStyle: this.motionStyle(0, 0, 1, 1),
        })
      }, 280)
    },
    flipTo(flipped: boolean) {
      this.clearFlipTimer()
      this.resetMotion(true)
      this.setData({
        flipped,
        flipping: true,
      })
      this._flipTimer = setTimeout(() => {
        this.setData({ flipping: false })
      }, 450)
    },
    onTap() {
      if (this._swiped || this.data.flipping || this._committing) {
        return
      }
      if (!this.isLarge()) {
        this.emitOpen()
        return
      }
      this.flipTo(true)
    },
    onFlipBack() {
      if (this._swiped || this.data.flipping || this._committing) {
        return
      }
      this.flipTo(false)
    },
    onAddFromBack() {
      if (this._swiped || this._committing) {
        return
      }
      const item = this.properties.item as DiscoveryItem
      this.triggerEvent('inbox', { id: item.id })
    },
    onOpenDetail() {
      if (this._swiped || this._committing) {
        return
      }
      this.emitOpen()
    },
    emitOpen() {
      const item = this.properties.item as DiscoveryItem
      this.triggerEvent('open', {
        id: item.id,
        opportunityId: item.opportunityId,
      })
    },
  },
})
