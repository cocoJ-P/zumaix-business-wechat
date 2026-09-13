import { mockApplications } from '../../mock/applications'
import { DEMO_ENTERPRISE } from '../../mock/enterprise'
import { HOME_VIEW_STATE } from '../../mock/homeState'
import { getEnvironmentLabel } from '../../api/config'
import type { BackendStatus, IdentityStatus } from '../../api/types'
import type { ApplicationSummary, HomeViewState } from '../../types/index'
import type { EnterpriseLead } from '../../types/business'
import { openOpportunityDetail } from '../../utils/checkSession'
import {
  getLeadSummary,
  LEAD_STATUS_LABEL,
  listEnterpriseLeads,
  resetLeadState,
} from '../../utils/leadStore'

function backendStatusLabel(status: BackendStatus): string {
  if (status === 'connected') {
    return '已连接'
  }
  if (status === 'unavailable') {
    return '不可用'
  }
  return '检查中'
}

type UserPageData = {
  viewState: HomeViewState
  enterpriseName: string
  enterpriseStage: string
  summary: { pending: number; approved: number; onHold: number }
  leads: Array<EnterpriseLead & { statusLabel: string }>
  applications: ApplicationSummary[]
  backendStatus: BackendStatus
  backendStatusLabel: string
  identityStatus: IdentityStatus
  identityEnterpriseName: string
  identityUserName: string
  identityErrorMessage: string
  envLabel: string
}

Page({
  data: {
    viewState: HOME_VIEW_STATE,
    enterpriseName: DEMO_ENTERPRISE.name,
    enterpriseStage: DEMO_ENTERPRISE.businessStage,
    summary: { pending: 0, approved: 0, onHold: 0 },
    leads: [],
    applications: [],
    backendStatus: 'unknown',
    backendStatusLabel: '检查中',
    identityStatus: 'loading',
    identityEnterpriseName: '',
    identityUserName: '',
    identityErrorMessage: '',
    envLabel: getEnvironmentLabel(),
  } as UserPageData,

  onShow() {
    this.hydrate()
    this.syncConnectionFromApp()
    const app = getApp()
    void Promise.all([
      app.refreshBackendHealth(),
      app.refreshCurrentIdentity(),
    ]).then(() => {
      this.syncConnectionFromApp()
    })
  },

  syncConnectionFromApp() {
    const { globalData } = getApp()
    const identity = globalData.currentIdentity
    const mappedError = globalData.identityErrorMessage || ''
    this.setData({
      backendStatus: globalData.backendStatus,
      backendStatusLabel: backendStatusLabel(globalData.backendStatus),
      identityStatus: globalData.identityStatus,
      identityEnterpriseName: identity ? identity.enterprise.name : '',
      identityUserName: identity ? identity.user.display_name : '',
      identityErrorMessage:
        mappedError && mappedError !== '身份暂不可用' ? mappedError : '',
    })
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
