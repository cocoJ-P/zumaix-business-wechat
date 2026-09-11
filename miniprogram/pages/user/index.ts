import { mockApplications } from '../../mock/applications'
import { DEMO_ENTERPRISE } from '../../mock/enterprise'
import { HOME_VIEW_STATE } from '../../mock/homeState'
import type { ApplicationSummary, HomeViewState } from '../../types/index'
import type { EnterpriseLead } from '../../types/business'
import { openOpportunityDetail } from '../../utils/checkSession'
import {
  getLeadSummary,
  LEAD_STATUS_LABEL,
  listEnterpriseLeads,
  resetLeadState,
} from '../../utils/leadStore'

type UserPageData = {
  viewState: HomeViewState
  enterpriseName: string
  enterpriseStage: string
  summary: { pending: number; approved: number; onHold: number }
  leads: Array<EnterpriseLead & { statusLabel: string }>
  applications: ApplicationSummary[]
}

Page({
  data: {
    viewState: HOME_VIEW_STATE,
    enterpriseName: DEMO_ENTERPRISE.name,
    enterpriseStage: DEMO_ENTERPRISE.businessStage,
    summary: { pending: 0, approved: 0, onHold: 0 },
    leads: [],
    applications: [],
  } as UserPageData,

  onShow() {
    this.hydrate()
  },

  hydrate() {
    const viewState = HOME_VIEW_STATE
    if (viewState !== 'success') {
      this.setData({
        viewState,
        leads: [],
        applications: [],
      })
      return
    }
    const summary = getLeadSummary()
    const leads = listEnterpriseLeads().map((item) => ({
      ...item,
      statusLabel: LEAD_STATUS_LABEL[item.status],
    }))
    this.setData({
      viewState,
      summary: {
        pending: summary.pending,
        approved: summary.approved,
        onHold: summary.onHold,
      },
      leads,
      applications: mockApplications,
    })
  },

  onOpenLead(event: { currentTarget: { dataset: { id?: string } } }) {
    const id = event.currentTarget.dataset.id
    if (id) {
      openOpportunityDetail(id)
    }
  },

  onOpenApplication(event: { currentTarget: { dataset: { id?: string } } }) {
    const id = event.currentTarget.dataset.id
    if (id) {
      openOpportunityDetail(id)
    }
  },

  onResetDemo() {
    resetLeadState()
    this.hydrate()
    wx.showToast({ title: '演示数据已重置', icon: 'none' })
  },
})
