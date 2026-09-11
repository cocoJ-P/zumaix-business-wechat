import type { EnterpriseLead } from '../types/business'
import { DEMO_ENTERPRISE } from './enterprise'

export const SEED_LEADS: EnterpriseLead[] = [
  {
    leadId: 'lead-policy-02',
    enterpriseId: DEMO_ENTERPRISE.enterpriseId,
    opportunityId: 'opp-policy-02',
    title: '北京市人工智能应用场景开放计划',
    status: 'pending',
    submissionCount: 3,
    submittedByCurrentUser: false,
    submitters: [{ name: '陈默' }, { name: '刘青' }, { name: '王予' }],
    createdAt: '2026-09-08',
    updatedAt: '2026-09-10',
  },
  {
    leadId: 'lead-finance-01',
    enterpriseId: DEMO_ENTERPRISE.enterpriseId,
    opportunityId: 'opp-finance-01',
    title: '科技型中小企业贷款贴息备案',
    status: 'approved',
    submissionCount: 4,
    submittedByCurrentUser: false,
    submitters: [{ name: '陈默' }, { name: '刘青' }, { name: '王予' }, { name: '周南' }],
    createdAt: '2026-08-22',
    updatedAt: '2026-09-02',
  },
  {
    leadId: 'lead-park-01',
    enterpriseId: DEMO_ENTERPRISE.enterpriseId,
    opportunityId: 'opp-park-01',
    title: '园区中试平台与工位开放申请',
    status: 'on_hold',
    submissionCount: 1,
    submittedByCurrentUser: false,
    submitters: [{ name: '刘青' }],
    createdAt: '2026-09-05',
    updatedAt: '2026-09-06',
  },
]
