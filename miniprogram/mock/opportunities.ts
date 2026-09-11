import type { Opportunity, OpportunityType } from '../types/index'
import { OPPORTUNITY_GROUPS } from '../types/index'

export const OPPORTUNITY_FILTERS = ['全部', ...OPPORTUNITY_GROUPS] as const

export type OpportunityFilter = (typeof OPPORTUNITY_FILTERS)[number]

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-contest-01',
    type: '创赛',
    title: '产业创新应用大赛',
    matchScore: 82,
    deadline: '10/08',
  },
  {
    id: 'opp-policy-01',
    type: '政策',
    title: '科技型企业研发创新支持专项',
    matchScore: 87,
    deadline: '10/15',
  },
  {
    id: 'opp-policy-02',
    type: '政策',
    title: '北京市人工智能应用场景开放计划',
    summary: '与你当前的场景验证目标高度相关',
    matchScore: 94,
    deadline: '09/30',
    status: '高匹配',
  },
  {
    id: 'opp-finance-01',
    type: '金融服务',
    title: '科技型中小企业贷款贴息备案',
    matchScore: 79,
    deadline: '11/20',
  },
  {
    id: 'opp-funding-01',
    type: '融资',
    title: '产业基金早期项目路演对接',
    matchScore: 76,
    deadline: '10/22',
  },
  {
    id: 'opp-park-01',
    type: '园区服务',
    title: '园区中试平台与工位开放申请',
    matchScore: 81,
    deadline: '10/31',
  },
  {
    id: 'opp-expired-01',
    type: '政策',
    title: '2024年科技型中小企业研发费用补助',
    matchScore: 64,
    deadline: '已截止',
  },
]

export function filterOpportunities(
  list: Opportunity[],
  filter: OpportunityFilter
): Opportunity[] {
  if (filter === '全部') {
    return list
  }
  return list.filter((item) => item.type === filter)
}

export function groupOpportunities(
  list: Opportunity[]
): { type: OpportunityType; items: Opportunity[] }[] {
  return OPPORTUNITY_GROUPS.map((type) => ({
    type,
    items: list.filter((item) => item.type === type),
  }))
}
