import type {
  MatchingResult,
  OpportunityRecord,
  QualificationItem,
} from '../types/business'

function q(
  id: string,
  label: string,
  status: QualificationItem['status'],
  mark: string
): QualificationItem {
  return { id, label, status, mark }
}

const MATCH_SCENE: MatchingResult = {
  score: 91,
  advice: 'strong_recommend',
  adviceLabel: '建议重点跟进',
  adviceDetail: '与当前寻找真实应用场景的目标高度一致，建议作为重点机会提交企业内部汇总。',
  strategicLevel: '高',
  strategicReason:
    '当前企业处于产品验证阶段，并正在寻找真实应用场景，本机会与当前成长目标高度一致。',
  qualifications: [
    q('region', '注册地区符合', 'confirmed', '✓'),
    q('type', '企业类型符合', 'confirmed', '✓'),
    q('industry', '所属行业符合', 'confirmed', '✓'),
    q('rd', '上年度研发投入待确认', 'unknown', '△'),
  ],
  deadlineLabel: '09/30',
  daysLeft: 19,
  requiredMaterials: 8,
  ownedMaterials: 5,
  pendingMaterials: 3,
  prepCost: '中',
}

const MATCH_POLICY: MatchingResult = {
  score: 87,
  advice: 'recommend',
  adviceLabel: '建议关注',
  adviceDetail: '政策方向匹配，部分硬条件仍需人工确认后再做企业内部决策。',
  strategicLevel: '高',
  strategicReason:
    '研发创新支持与当前科技型企业 / AI 研发状态相关，有助于验证期的产品投入。',
  qualifications: [
    q('region', '注册地区符合', 'confirmed', '✓'),
    q('type', '企业类型符合', 'confirmed', '✓'),
    q('industry', '所属行业符合', 'confirmed', '✓'),
    q('age', '企业成立年限暂不符合', 'failed', '×'),
    q('rd', '上年度研发投入待确认', 'unknown', '△'),
  ],
  deadlineLabel: '10/15',
  daysLeft: 34,
  requiredMaterials: 6,
  ownedMaterials: 5,
  pendingMaterials: 1,
  prepCost: '中',
}

const MATCH_CONTEST: MatchingResult = {
  score: 82,
  advice: 'recommend',
  adviceLabel: '建议关注',
  adviceDetail: '适合当前场景验证与产品落地节奏，可作为对外展示窗口。',
  strategicLevel: '中',
  strategicReason: '创赛能补足真实场景验证材料，但准备周期与路演成本需要评估。',
  qualifications: [
    q('type', '企业类型符合', 'confirmed', '✓'),
    q('stage', '产品阶段符合', 'confirmed', '✓'),
    q('award', '是否限制往届获奖待确认', 'unknown', '△'),
  ],
  deadlineLabel: '10/08',
  daysLeft: 27,
  requiredMaterials: 5,
  ownedMaterials: 4,
  pendingMaterials: 1,
  prepCost: '低',
}

const MATCH_FINANCE: MatchingResult = {
  score: 79,
  advice: 'need_review',
  adviceLabel: '建议进一步确认',
  adviceDetail: '融资与贴息条件中有两项待核对，不建议仅凭公开摘要做决定。',
  strategicLevel: '中',
  strategicReason: '可缓解验证期现金压力，但需确认是否满足科技型中小企业口径。',
  qualifications: [
    q('sme', '科技型中小企业口径符合', 'confirmed', '✓'),
    q('revenue', '营收口径待确认', 'unknown', '△'),
    q('credit', '征信与贷款用途待确认', 'unknown', '△'),
  ],
  deadlineLabel: '11/20',
  daysLeft: 70,
  requiredMaterials: 7,
  ownedMaterials: 3,
  pendingMaterials: 4,
  prepCost: '高',
}

const MATCH_FUNDING: MatchingResult = {
  score: 76,
  advice: 'recommend',
  adviceLabel: '建议关注',
  adviceDetail: '产业基金对接适合当前阶段，但路演准备需占用核心团队时间。',
  strategicLevel: '中',
  strategicReason: '早期项目路演能同时验证产业协同与融资需求。',
  qualifications: [
    q('stage', '融资阶段匹配', 'confirmed', '✓'),
    q('industry', '产业方向符合', 'confirmed', '✓'),
    q('lead', '是否接受早期项目待确认', 'unknown', '△'),
  ],
  deadlineLabel: '10/22',
  daysLeft: 41,
  requiredMaterials: 4,
  ownedMaterials: 3,
  pendingMaterials: 1,
  prepCost: '中',
}

const MATCH_PARK: MatchingResult = {
  score: 81,
  advice: 'recommend',
  adviceLabel: '建议关注',
  adviceDetail: '中试平台与工位可支撑正在推进的验证与小试。',
  strategicLevel: '高',
  strategicReason: '当前约束是缺乏规模化应用案例，园区中试资源能直接补上这一环。',
  qualifications: [
    q('region', '园区服务范围符合', 'confirmed', '✓'),
    q('stage', '小试 / 中试阶段符合', 'confirmed', '✓'),
    q('site', '工位需求待确认', 'unknown', '△'),
  ],
  deadlineLabel: '10/31',
  daysLeft: 50,
  requiredMaterials: 5,
  ownedMaterials: 4,
  pendingMaterials: 1,
  prepCost: '低',
}

const MATCH_EXPIRED: MatchingResult = {
  score: 64,
  advice: 'not_eligible',
  adviceLabel: '当前不符合',
  adviceDetail: '政策真实，但申报已经截止，不建议作为当前行动依据。',
  strategicLevel: '低',
  strategicReason: '方向曾经匹配，但时间窗口已关闭，对当前目标没有可执行价值。',
  qualifications: [
    q('real', '属于真实官方政策', 'confirmed', '✓'),
    q('open', '申报窗口仍开放', 'failed', '×'),
  ],
  deadlineLabel: '已截止',
  expired: true,
  requiredMaterials: 6,
  ownedMaterials: 5,
  pendingMaterials: 1,
  prepCost: '中',
}

const MATCH_UNVERIFIED: MatchingResult = {
  score: 58,
  advice: 'need_review',
  adviceLabel: '建议进一步确认',
  adviceDetail: '仅作参考判断。在找到可信来源前，不建议据此做正式决策。',
  strategicLevel: '中',
  strategicReason: '文本提到场景与补贴，与当前目标有弱相关，但来源尚未核验。',
  qualifications: [
    q('topic', '主题与当前目标相关', 'confirmed', '✓'),
    q('source', '官方来源待确认', 'unknown', '△'),
  ],
  deadlineLabel: '未知',
  requiredMaterials: 0,
  ownedMaterials: 0,
  pendingMaterials: 0,
  prepCost: '中',
  referenceOnly: true,
}

export const mockOpportunityRecords: OpportunityRecord[] = [
  {
    id: 'opp-policy-02',
    kind: 'policy',
    typeLabel: '政策',
    title: '北京市人工智能应用场景开放计划',
    publisher: '北京市科学技术委员会',
    deadline: '09/30',
    statusLabel: '官方来源 · 已核验',
    verified: true,
    matching: MATCH_SCENE,
    seedSubmissionCount: 3,
  },
  {
    id: 'opp-policy-01',
    kind: 'policy',
    typeLabel: '政策',
    title: '2026年科技创新专项申报通知',
    publisher: '北京市科学技术委员会',
    deadline: '10/15',
    statusLabel: '官方来源 · 已核验',
    verified: true,
    matching: MATCH_POLICY,
    seedSubmissionCount: 0,
  },
  {
    id: 'opp-contest-01',
    kind: 'competition',
    typeLabel: '创赛',
    title: '产业创新应用大赛',
    publisher: '北京市经济和信息化局',
    deadline: '10/08',
    statusLabel: '官方来源 · 已核验',
    verified: true,
    matching: MATCH_CONTEST,
    seedSubmissionCount: 2,
  },
  {
    id: 'opp-finance-01',
    kind: 'financial_service',
    typeLabel: '金融服务',
    title: '科技型中小企业贷款贴息备案',
    publisher: '北京市地方金融管理局',
    deadline: '11/20',
    statusLabel: '官方来源 · 已核验',
    verified: true,
    matching: MATCH_FINANCE,
    seedSubmissionCount: 4,
  },
  {
    id: 'opp-funding-01',
    kind: 'equity_funding',
    typeLabel: '融资',
    title: '产业基金早期项目路演对接',
    publisher: '北京产业基金',
    deadline: '10/22',
    statusLabel: '官方来源 · 已核验',
    verified: true,
    matching: MATCH_FUNDING,
    seedSubmissionCount: 0,
  },
  {
    id: 'opp-park-01',
    kind: 'park_service',
    typeLabel: '园区服务',
    title: '园区中试平台与工位开放申请',
    publisher: '朝阳区科技园区',
    deadline: '10/31',
    statusLabel: '官方来源 · 已核验',
    verified: true,
    matching: MATCH_PARK,
    seedSubmissionCount: 1,
  },
  {
    id: 'opp-haidian-01',
    kind: 'policy',
    typeLabel: '政策',
    title: '海淀区科技计划',
    publisher: '海淀区科学技术委员会',
    deadline: '10/12',
    statusLabel: '企业评估中',
    verified: true,
    matching: MATCH_POLICY,
    seedSubmissionCount: 2,
    following: true,
    followStage: '材料准备',
  },
  {
    id: 'opp-expired-01',
    kind: 'policy',
    typeLabel: '政策',
    title: '2024年科技型中小企业研发费用补助',
    publisher: '北京市科学技术委员会',
    deadline: '已截止',
    statusLabel: '官方真实 · 已截止',
    verified: true,
    expired: true,
    matching: MATCH_EXPIRED,
    seedSubmissionCount: 0,
  },
  {
    id: 'opp-unverified-01',
    kind: 'policy',
    typeLabel: '政策',
    title: '未核验的补贴申报信息',
    publisher: '来源待确认',
    deadline: '未知',
    statusLabel: '可信来源待确认',
    verified: false,
    matching: MATCH_UNVERIFIED,
    seedSubmissionCount: 0,
  },
]

const BY_ID: Record<string, OpportunityRecord> = {}
mockOpportunityRecords.forEach((item) => {
  BY_ID[item.id] = item
})

export function getOpportunityRecord(id: string): OpportunityRecord | null {
  return BY_ID[id] || null
}
