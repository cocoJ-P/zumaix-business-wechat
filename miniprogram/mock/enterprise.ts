import type { EnterpriseState } from '../types/business'

export const DEMO_ENTERPRISE: EnterpriseState = {
  enterpriseId: 'ent-zhumai',
  name: '筑脉科技',
  registrationRegion: '北京市朝阳区',
  establishedAt: '2021-04',
  enterpriseType: '科技型企业',
  industry: '人工智能 / 产业服务',
  productStage: '产品验证期',
  businessStage: '产品验证期',
  teamSize: '12 人',
  revenueStage: '早期收入',
  fundingStage: '天使轮后',
  ipCount: 3,
  qualifications: ['科技型中小企业'],
  currentGoal: '获得真实场景',
  currentConstraint: '缺乏规模化应用案例',
  recentEvents: ['产品 Demo 已完成'],
  availableMaterials: [
    '营业执照',
    '企业简介',
    '产品说明',
    '团队介绍',
    '知识产权清单',
  ],
}
