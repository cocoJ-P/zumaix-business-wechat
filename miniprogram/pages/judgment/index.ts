import type { DiscoveryItem } from '../../types/index'
import { addToInboxFromDiscovery, takePendingDiscovery } from '../../utils/workbench'

Page({
  data: {
    item: null as DiscoveryItem | null,
  },
  onLoad() {
    const item = takePendingDiscovery()
    this.setData({ item })
  },
  onAdd() {
    const item = this.data.item
    if (!item) {
      return
    }
    addToInboxFromDiscovery(item.id)
    wx.showToast({ title: '已加入待处理', icon: 'none' })
    setTimeout(() => {
      wx.navigateBack({
        fail: () => {
          wx.switchTab({ url: '/pages/home/index' })
        },
      })
    }, 400)
  },
})
