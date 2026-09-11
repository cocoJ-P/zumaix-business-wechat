import { getOpportunityRecord } from '../../mock/opportunityRecords'
import type { EnterpriseLead, OpportunityRecord } from '../../types/business'
import {
  getLeadByOpportunity,
  LEAD_STATUS_LABEL,
  submitLead,
} from '../../utils/leadStore'

type DetailData = {
  missing: boolean
  record: OpportunityRecord | null
  lead: EnterpriseLead | null
  leadStatusLabel: string
  deadlineHint: string
  confirmVisible: boolean
  resultVisible: boolean
  resultTitle: string
  resultBody: string
}

function viewFor(
  id: string
): Omit<DetailData, 'confirmVisible' | 'resultVisible' | 'resultTitle' | 'resultBody'> {
  const record = getOpportunityRecord(id)
  if (!record) {
    return {
      missing: true,
      record: null,
      lead: null,
      leadStatusLabel: '',
      deadlineHint: '',
    }
  }
  const lead = getLeadByOpportunity(id)
  const matching = record.matching
  const deadlineHint = matching.expired
    ? '已截止'
    : matching.daysLeft
      ? `${matching.daysLeft}天后`
      : matching.deadlineLabel
  return {
    missing: false,
    record,
    lead,
    leadStatusLabel: lead ? LEAD_STATUS_LABEL[lead.status] : '',
    deadlineHint,
  }
}

Page({
  data: {
    missing: false,
    record: null,
    lead: null,
    leadStatusLabel: '',
    deadlineHint: '',
    confirmVisible: false,
    resultVisible: false,
    resultTitle: '',
    resultBody: '',
  } as DetailData,

  onLoad(query: { id?: string }) {
    const id = query && query.id ? decodeURIComponent(query.id) : ''
    this._opportunityId = id
    this.hydrate()
  },

  onShow() {
    if (this._opportunityId) {
      this.hydrate()
    }
  },

  hydrate() {
    const id = this._opportunityId || ''
    this.setData(viewFor(id))
  },

  onOpenOfficial() {
    wx.showToast({ title: '官方来源将在接入真实数据后打开', icon: 'none' })
  },

  onAskLead() {
    const record = this.data.record
    if (!record || record.expired) {
      return
    }
    if (this.data.lead && this.data.lead.submittedByCurrentUser) {
      return
    }
    this.setData({ confirmVisible: true })
  },

  onCancelLead() {
    this.setData({ confirmVisible: false })
  },

  onConfirmLead() {
    const id = this._opportunityId
    if (!id) {
      this.setData({ confirmVisible: false, missing: true })
      return
    }
    const result = submitLead(id)
    this.setData({ confirmVisible: false })
    if (!result) {
      wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
      return
    }
    const previous = Math.max(result.lead.submissionCount - 1, 0)
    const body = result.firstSubmitter
      ? '已提交企业内部汇总审批。\n你是第 1 位提交该机会的企业成员。'
      : `已有 ${previous} 位企业成员提交过这个机会。\n你的提交已合并到同一条企业线索。`
    this.setData({
      ...viewFor(id),
      resultVisible: true,
      resultTitle: '已加入企业线索',
      resultBody: body,
    })
  },

  onCloseResult() {
    this.setData({ resultVisible: false })
  },

  noop() {},
})
