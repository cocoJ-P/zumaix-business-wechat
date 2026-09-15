import { HOME_VIEW_STATE } from '../../mock/homeState'
import { mockOpportunities } from '../../mock/opportunities'
import { PARK_SERVICES, VENDOR_SERVICES, type ServiceItem } from '../../mock/services'
import type { HomeViewState, Opportunity } from '../../types/index'
import { openOpportunityDetail } from '../../utils/checkSession'

type HubTab = 'park' | 'vendor' | 'policy'

type OpportunityHubData = {
  tabs: Array<{ id: HubTab; label: string }>
  activeTab: HubTab
  parkServices: ServiceItem[]
  vendorServices: ServiceItem[]
  viewState: HomeViewState
  opportunities: Opportunity[]
}

Page({
  data: {
    tabs: [
      { id: 'park', label: '园区服务' },
      { id: 'vendor', label: '服务商' },
      { id: 'policy', label: '政策' },
    ],
    activeTab: 'park',
    parkServices: PARK_SERVICES,
    vendorServices: VENDOR_SERVICES,
    viewState: HOME_VIEW_STATE,
    opportunities: HOME_VIEW_STATE === 'success' ? mockOpportunities : [],
  } as OpportunityHubData,

  onTabTap(event: { currentTarget: { dataset: { id?: HubTab } } }) {
    const id = event.currentTarget.dataset.id
    if (!id || id === this.data.activeTab) {
      return
    }
    this.setData({ activeTab: id })
  },

  onServiceTap(event: { currentTarget: { dataset: { id?: string } } }) {
    const id = event.currentTarget.dataset.id
    if (!id) {
      return
    }
    wx.navigateTo({
      url: `/pages/service/index?id=${encodeURIComponent(id)}`,
    })
  },

  onOpportunityTap(event: { detail: { id?: string } }) {
    const id = event.detail.id
    if (!id) {
      return
    }
    openOpportunityDetail(id)
  },

  onRetry() {
    this.setData({
      viewState: HOME_VIEW_STATE,
      opportunities: HOME_VIEW_STATE === 'success' ? mockOpportunities : [],
    })
  },
})
