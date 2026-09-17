import type { DiscoveryItem, InboxItem } from '../types/index'
import { resolveDiscoveryCardTheme } from '../utils/discoveryBackground'

function withCardTheme(item: DiscoveryItem): DiscoveryItem {
  const theme = resolveDiscoveryCardTheme({ kind: item.kind })
  return {
    ...item,
    cardTheme: theme.key,
    backgroundImage: theme.backgroundImage,
    backColor: theme.backColor,
    ink: theme.ink,
  }
}

/** 仅供 workbench fixture / 演示页。首页「为你发现」Runtime 不得使用。 */
export const mockFeaturedDiscoveries: DiscoveryItem[] = [
  withCardTheme({
    id: 'disc-01',
    kind: '政策',
    eventStatus: '3 天后截止',
    title: '科技型企业研发创新\n支持专项延长申报',
    reason: '与你当前「科技型企业 / AI 研发」状态高度相关',
    opportunityId: 'opp-policy-01',
  }),
  withCardTheme({
    id: 'disc-02',
    kind: '场景',
    eventStatus: '今天发布',
    title: '朝阳区开放一批\nAI 企业真实应用场景',
    reason: '与你当前「寻找真实场景」目标高度相关',
    opportunityId: 'opp-policy-02',
  }),
  withCardTheme({
    id: 'disc-03',
    kind: '创赛',
    eventStatus: '本周截止',
    title: '产业创新应用大赛进入报名尾声',
    reason: '与你当前的场景验证与产品落地节奏匹配',
    opportunityId: 'opp-contest-01',
  }),
  withCardTheme({
    id: 'disc-04',
    kind: '融资',
    eventStatus: '刚刚更新',
    title: '产业基金开放早期项目路演对接',
    reason: '适合当前阶段的融资与产业协同需求',
    opportunityId: 'opp-funding-01',
  }),
  withCardTheme({
    id: 'disc-05',
    kind: '园区服务',
    eventStatus: '剩余 5 天',
    title: '园区中试平台与工位开放申请',
    reason: '可支撑你正在推进的验证与小试',
    opportunityId: 'opp-park-01',
  }),
]

export const mockDeprioritizedDiscoveries: DiscoveryItem[] = [
  {
    id: 'low-01',
    kind: '政策',
    eventStatus: '9月30日',
    title: '中小企业专项资金申报',
    reason: '',
  },
  {
    id: 'low-02',
    kind: '创赛',
    eventStatus: '报名中',
    title: '青年创新创业邀请赛',
    reason: '',
  },
  {
    id: 'low-03',
    kind: '金融服务',
    eventStatus: '本月开放',
    title: '知识产权质押融资便利化',
    reason: '',
  },
]

export const mockInboxItems: InboxItem[] = [
  {
    id: 'inbox-01',
    title: '科技型企业研发创新支持专项',
    status: 'analyzing',
    source: 'link',
    note: '正在判断内容性质',
    opportunityId: 'opp-policy-01',
    analyzeStep: 1,
  },
  {
    id: 'inbox-02',
    title: '朝阳区 AI 场景开放通知',
    status: 'waiting',
    source: 'clipboard',
    note: '来自剪贴板，等待开始分析',
  },
  {
    id: 'inbox-03',
    title: '海淀区科技计划',
    status: 'done',
    source: 'link',
    note: '已完成来源判断与机会映射',
    opportunityId: 'opp-haidian-01',
  },
]
