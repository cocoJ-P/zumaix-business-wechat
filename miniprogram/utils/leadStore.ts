import { SEED_LEADS } from '../mock/leads'
import { DEMO_ENTERPRISE } from '../mock/enterprise'
import { getOpportunityRecord } from '../mock/opportunityRecords'
import type { EnterpriseLead, LeadStatus } from '../types/business'

const STORAGE_KEY = 'zhumai.leadState.v1'

type PersistedLeadState = {
  submittedIds: string[]
  overrides: Record<string, Partial<EnterpriseLead>>
  extras: EnterpriseLead[]
}

function cloneLeads(list: EnterpriseLead[]): EnterpriseLead[] {
  return list.map((item) => ({
    ...item,
    submitters: item.submitters.map((row) => ({ ...row })),
  }))
}

function todayLabel(): string {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function readPersisted(): PersistedLeadState {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (raw && typeof raw === 'object') {
      return {
        submittedIds: Array.isArray(raw.submittedIds) ? raw.submittedIds : [],
        overrides: raw.overrides && typeof raw.overrides === 'object' ? raw.overrides : {},
        extras: Array.isArray(raw.extras) ? raw.extras : [],
      }
    }
  } catch {
    // storage 读取失败时回退到种子数据
  }
  return { submittedIds: [], overrides: {}, extras: [] }
}

function writePersisted(state: PersistedLeadState): void {
  try {
    wx.setStorageSync(STORAGE_KEY, state)
  } catch {
    wx.showToast({ title: '本地状态保存失败', icon: 'none' })
  }
}

function buildLeads(): EnterpriseLead[] {
  const persisted = readPersisted()
  const base = cloneLeads(SEED_LEADS).map((lead) => {
    const patch = persisted.overrides[lead.opportunityId]
    return patch ? { ...lead, ...patch, submitters: patch.submitters || lead.submitters } : lead
  })
  persisted.extras.forEach((item) => {
    if (!base.some((row) => row.opportunityId === item.opportunityId)) {
      base.unshift(item)
    }
  })
  return base
}

export function listEnterpriseLeads(): EnterpriseLead[] {
  return buildLeads()
}

export function getLeadSummary(): { pending: number; approved: number; onHold: number; ignored: number } {
  const leads = buildLeads()
  return {
    pending: leads.filter((item) => item.status === 'pending').length,
    approved: leads.filter((item) => item.status === 'approved').length,
    onHold: leads.filter((item) => item.status === 'on_hold').length,
    ignored: leads.filter((item) => item.status === 'ignored').length,
  }
}

export function getLeadByOpportunity(opportunityId: string): EnterpriseLead | null {
  return buildLeads().find((item) => item.opportunityId === opportunityId) || null
}

export type SubmitLeadResult = {
  lead: EnterpriseLead
  firstSubmitter: boolean
  merged: boolean
}

export function submitLead(opportunityId: string): SubmitLeadResult | null {
  const record = getOpportunityRecord(opportunityId)
  if (!record) {
    return null
  }
  const persisted = readPersisted()
  const existing = getLeadByOpportunity(opportunityId)
  const now = todayLabel()

  if (existing && existing.submittedByCurrentUser) {
    return { lead: existing, firstSubmitter: false, merged: true }
  }

  if (existing) {
    const next: EnterpriseLead = {
      ...existing,
      submissionCount: existing.submissionCount + 1,
      submittedByCurrentUser: true,
      submitters: [{ name: '我', isCurrentUser: true }, ...existing.submitters],
      updatedAt: now,
      status: existing.status === 'ignored' ? 'pending' : existing.status,
    }
    persisted.submittedIds = Array.from(new Set([...persisted.submittedIds, opportunityId]))
    persisted.overrides[opportunityId] = next
    writePersisted(persisted)
    return {
      lead: next,
      firstSubmitter: false,
      merged: true,
    }
  }

  const created: EnterpriseLead = {
    leadId: `lead-${opportunityId}-${Date.now()}`,
    enterpriseId: DEMO_ENTERPRISE.enterpriseId,
    opportunityId,
    title: record.title,
    status: 'pending' as LeadStatus,
    submissionCount: 1,
    submittedByCurrentUser: true,
    submitters: [{ name: '我', isCurrentUser: true }],
    createdAt: now,
    updatedAt: now,
  }
  persisted.submittedIds = Array.from(new Set([...persisted.submittedIds, opportunityId]))
  persisted.extras = [created, ...persisted.extras]
  writePersisted(persisted)
  return {
    lead: created,
    firstSubmitter: true,
    merged: false,
  }
}

export function resetLeadState(): void {
  try {
    wx.removeStorageSync(STORAGE_KEY)
  } catch {
    wx.showToast({ title: '重置失败', icon: 'none' })
  }
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  pending: '待审批',
  approved: '已批准',
  on_hold: '暂存',
  ignored: '已忽略',
}
