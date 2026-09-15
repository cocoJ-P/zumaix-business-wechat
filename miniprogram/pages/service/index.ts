import { getServiceById, type ServiceItem } from '../../mock/services'

type ServicePageData = {
  ready: boolean
  service: ServiceItem | null
}

Page({
  data: {
    ready: false,
    service: null,
  } as ServicePageData,

  onLoad(query: { id?: string }) {
    const service = getServiceById(query && query.id)
    this.setData({
      ready: true,
      service,
    })
    if (service) {
      wx.setNavigationBarTitle({ title: service.title })
    } else {
      wx.setNavigationBarTitle({ title: '服务' })
    }
  },

  onConsult() {
    wx.showToast({
      title: '静态演示，暂未开通',
      icon: 'none',
    })
  },
})
