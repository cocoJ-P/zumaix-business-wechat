import { ANALYZE_STEP_DELAY_MS } from '../../utils/analyzeSteps'
import { advanceAnalyzingItems, getInboxGroups, getInboxItems } from '../../utils/workbench'
import type { InboxGroup } from '../../utils/workbench'
import { openInboxEntry } from '../../utils/checkSession'

Page({
  data: {
    groups: [] as InboxGroup[],
  },
  onShow() {
    this.refresh()
    this.startTicker()
  },
  onHide() {
    this.stopTicker()
  },
  onUnload() {
    this.stopTicker()
  },
  refresh() {
    this.setData({ groups: getInboxGroups() })
  },
  startTicker() {
    this.stopTicker()
    this._timer = setInterval(() => {
      const changed = advanceAnalyzingItems()
      if (changed) {
        this.refresh()
      }
      const stillRunning = getInboxItems().some((item) => item.status === 'analyzing')
      if (!stillRunning) {
        this.stopTicker()
      }
    }, ANALYZE_STEP_DELAY_MS)
  },
  stopTicker() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = 0
    }
  },
  onOpenItem(event: { currentTarget: { dataset: { id?: string } } }) {
    const id = event.currentTarget.dataset.id
    const hit = getInboxItems().find((item) => item.id === id)
    if (!hit) {
      return
    }
    openInboxEntry(hit)
  },
})
