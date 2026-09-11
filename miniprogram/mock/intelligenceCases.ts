import type { IntelligenceResult } from '../types/business'

export const INTELLIGENCE_CASES: Record<IntelligenceResult['caseId'], IntelligenceResult> = {
  A: {
    caseId: 'A',
    nature: 'official',
    natureLabel: '官方原始发布',
    submittedKindLabel: '官方政策原文',
    hasRealPolicy: true,
    foundOpportunity: true,
    foundMessage: '已找到对应的真实机会',
    opportunityId: 'opp-policy-01',
    provenance: [
      { role: '当前内容', name: '北京市科学技术委员会网站' },
      { role: '原始发布', name: '北京市科学技术委员会' },
    ],
    officialPublisher: '北京市科学技术委员会',
    officialDocument: '《2026年科技创新专项申报通知》',
    publishedAt: '2026-09-01',
    verified: true,
  },
  B: {
    caseId: 'B',
    nature: 'marketing',
    natureLabel: '营销解读',
    submittedKindLabel: '第三方政策服务商文章',
    marketingLevel: '较高',
    hasRealPolicy: true,
    mustUseAgency: '未发现此要求',
    foundOpportunity: true,
    foundMessage: '已找到对应的真实机会',
    opportunityId: 'opp-policy-02',
    notOriginal: true,
    provenance: [
      { role: '当前内容', name: '某企业服务公众号' },
      { role: '引用来源', name: '某行业媒体' },
      { role: '原始发布', name: '北京市科学技术委员会' },
    ],
    officialPublisher: '北京市科学技术委员会',
    officialDocument: '《北京市人工智能应用场景开放计划》',
    publishedAt: '2026-09-01',
    verified: true,
  },
  C: {
    caseId: 'C',
    nature: 'intermediary',
    natureLabel: '中介内容',
    submittedKindLabel: '代办申报服务介绍',
    marketingLevel: '较高',
    hasRealPolicy: true,
    mustUseAgency: '未发现此要求',
    foundOpportunity: true,
    foundMessage: '已找到对应的真实机会',
    opportunityId: 'opp-policy-01',
    notOriginal: true,
    provenance: [
      { role: '当前内容', name: '某申报代办机构' },
      { role: '原始发布', name: '北京市科学技术委员会' },
    ],
    officialPublisher: '北京市科学技术委员会',
    officialDocument: '《2026年科技创新专项申报通知》',
    publishedAt: '2026-09-01',
    verified: true,
  },
  D: {
    caseId: 'D',
    nature: 'media_repost',
    natureLabel: '媒体 / 公众号转载',
    submittedKindLabel: '行业媒体转载稿',
    hasRealPolicy: true,
    foundOpportunity: true,
    foundMessage: '已找到对应的真实机会',
    opportunityId: 'opp-contest-01',
    provenance: [
      { role: '当前内容', name: '某行业媒体' },
      { role: '原始发布', name: '北京市经济和信息化局' },
    ],
    officialPublisher: '北京市经济和信息化局',
    officialDocument: '《产业创新应用大赛报名通知》',
    publishedAt: '2026-08-20',
    verified: true,
  },
  E: {
    caseId: 'E',
    nature: 'official',
    natureLabel: '官方原始发布',
    submittedKindLabel: '历史政策原文',
    hasRealPolicy: true,
    foundOpportunity: true,
    foundMessage: '已找到对应的真实机会',
    opportunityId: 'opp-expired-01',
    caution: '该政策真实，但申报已经截止。',
    provenance: [
      { role: '当前内容', name: '北京市科学技术委员会网站' },
      { role: '原始发布', name: '北京市科学技术委员会' },
    ],
    officialPublisher: '北京市科学技术委员会',
    officialDocument: '《2024年科技型中小企业研发费用补助通知》',
    publishedAt: '2024-03-12',
    verified: true,
  },
  F: {
    caseId: 'F',
    nature: 'unverified',
    natureLabel: '可信来源待确认',
    submittedKindLabel: '来源不明的申报信息',
    hasRealPolicy: false,
    foundOpportunity: false,
    foundMessage: '暂未找到可信原始来源',
    opportunityId: 'opp-unverified-01',
    caution: '当前内容可能存在信息缺失，建议暂不依据该内容做正式决策。',
    provenance: [{ role: '当前内容', name: '未知来源文本' }],
    verified: false,
  },
}

export function resolveIntelligenceCase(raw: string): IntelligenceResult {
  const text = (raw || '').trim()
  if (!text) {
    return INTELLIGENCE_CASES.F
  }
  if (/营销|500万|赶紧申报|最高补贴/.test(text)) {
    return INTELLIGENCE_CASES.B
  }
  if (/中介|代办/.test(text)) {
    return INTELLIGENCE_CASES.C
  }
  if (/过期|历史|2024/.test(text)) {
    return INTELLIGENCE_CASES.E
  }
  if (/转载|媒体/.test(text)) {
    return INTELLIGENCE_CASES.D
  }
  if (/无法验证|不明|未知来源/.test(text)) {
    return INTELLIGENCE_CASES.F
  }
  return INTELLIGENCE_CASES.A
}
