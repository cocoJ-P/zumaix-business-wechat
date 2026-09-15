export type ServiceSource = 'park' | 'vendor'

export type ServiceId =
  | 'space'
  | 'lab'
  | 'meeting'
  | 'housing'
  | 'event'
  | 'settle'
  | 'legal'
  | 'tax'
  | 'ip'
  | 'qualification'
  | 'finance'
  | 'scene'

export type ServiceItem = {
  id: ServiceId
  source: ServiceSource
  title: string
  brief: string
  provider: string
  summary: string
  offers: string[]
  note: string
}

export const PARK_SERVICES: ServiceItem[] = [
  {
    id: 'space',
    source: 'park',
    title: '工位与场地',
    brief: '办公工位、独立房间与短期场地',
    provider: '北辰产业园运营中心',
    summary: '由园区直接提供工位、独立办公室和短期使用场地，适合入驻企业按阶段调整空间，而不必先对外找房东。',
    offers: ['灵活工位与独立房间申请', '短期场地预约', '入驻面积调整与退房说明'],
    note: '当前为静态展示，申请后才会进入园区工单。',
  },
  {
    id: 'lab',
    source: 'park',
    title: '中试平台',
    brief: '设备、工位与试验支持',
    provider: '北辰产业园运营中心',
    summary: '面向产品验证和企业中试需求，开放园区中试平台与共享设备，减少企业自建产线的前期投入。',
    offers: ['中试工位开放申请', '共享设备预约', '试验安全与值守说明'],
    note: '当前为静态展示，具体档期以园区排期为准。',
  },
  {
    id: 'meeting',
    source: 'park',
    title: '公共会议室',
    brief: '路演厅、洽谈室与培训教室',
    provider: '北辰产业园运营中心',
    summary: '园区公共会议与路演空间，供企业对接客户、投资人和主管部门时使用。',
    offers: ['洽谈室预约', '路演厅档期申请', '基础投影与签到支持'],
    note: '当前为静态展示，高峰时段可能需要排队。',
  },
  {
    id: 'housing',
    source: 'park',
    title: '人才公寓',
    brief: '短期周转与人才住宿支持',
    provider: '北辰产业园运营中心',
    summary: '为关键岗位和短期驻场人员提供园区人才公寓信息与申请入口，不替代企业自行解决长期住房。',
    offers: ['在园人才公寓名额说明', '申请材料清单', '入住周期与退出规则'],
    note: '当前为静态展示，名额由园区统一配置。',
  },
  {
    id: 'event',
    source: 'park',
    title: '活动与路演',
    brief: '园区举办的对接和展示活动',
    provider: '北辰产业园运营中心',
    summary: '园区组织的产业对接、路演和开放日，企业可以报名展示产品或参与交流。',
    offers: ['近期活动报名', '展位与路演时段申请', '活动后的对接纪要'],
    note: '当前为静态展示，报名后才会进入活动名单。',
  },
  {
    id: 'settle',
    source: 'park',
    title: '入驻办理',
    brief: '合同、证件与园区手续',
    provider: '北辰产业园运营中心',
    summary: '集中办理入驻合同、门禁、物业和园区公示所需材料，让企业把手续一次走完。',
    offers: ['入驻材料清单', '合同与缴费说明', '门禁、工位和物业开通'],
    note: '当前为静态展示，正式入驻以园区审核为准。',
  },
]

export const VENDOR_SERVICES: ServiceItem[] = [
  {
    id: 'legal',
    source: 'vendor',
    title: '法律服务',
    brief: '合同、合规与争议协助',
    provider: '北辰合作律师事务所',
    summary: '面向企业在机会落地、合同签署和合规审查中的实际需求，由合作律师提供书面意见，不替代企业最终决策。',
    offers: ['机会申报材料合规核对', '合作协议与保密条款审查', '争议风险评估与处理路径建议'],
    note: '当前为静态能力展示，提交后才会生成正式服务单。',
  },
  {
    id: 'tax',
    source: 'vendor',
    title: '财税服务',
    brief: '税务筹划与账务支持',
    provider: '北辰合作会计师事务所',
    summary: '帮助企业把政策机会、奖补资金和日常账务放到同一套口径里，避免申报口径和税务处理互相打架。',
    offers: ['奖补资金入账与税务口径说明', '研发费用归集辅导', '申报期财务材料清单整理'],
    note: '当前为静态能力展示，具体方案需结合企业账套后出具。',
  },
  {
    id: 'ip',
    source: 'vendor',
    title: '知识产权',
    brief: '专利、商标与软著',
    provider: '北辰合作知识产权代理',
    summary: '围绕产品验证和场景合作，梳理已有成果和可申请资产，避免对外合作时权属不清。',
    offers: ['专利与软著布局建议', '商标检索与注册准备', '对外合作中的知识产权条款要点'],
    note: '当前为静态能力展示，检索和申请需另行启动。',
  },
  {
    id: 'qualification',
    source: 'vendor',
    title: '资质申报',
    brief: '高企、专精特新等',
    provider: '北辰合作申报服务机构',
    summary: '把当前机会和已有材料映射到常见资质通道，先判断适不适合报，再决定要不要启动完整申报。',
    offers: ['高企 / 专精特新适配判断', '材料缺口清单', '申报节奏与窗口提醒'],
    note: '当前为静态能力展示，不代表已经进入正式申报流程。',
  },
  {
    id: 'finance',
    source: 'vendor',
    title: '投融资',
    brief: '材料梳理与对接准备',
    provider: '北辰合作融资顾问',
    summary: '用于企业准备对外讲述自己的阶段、场景和资金用途，而不是直接撮合投资结果。',
    offers: ['一页纸融资材料结构', '数据与场景证据整理', '路演口径与风险披露要点'],
    note: '当前为静态能力展示，不构成投资建议或融资承诺。',
  },
  {
    id: 'scene',
    source: 'vendor',
    title: '场景对接',
    brief: '真实应用场景合作',
    provider: '北辰产业场景网络',
    summary: '把“寻找真实场景”落到可沟通的合作对象：园区、行业用户或联合验证项目。',
    offers: ['场景需求匹配说明', '对接前的产品边界清单', '试点合作的常见约束'],
    note: '当前为静态能力展示，具体对接需双方确认后再开启。',
  },
]

export const SERVICES: ServiceItem[] = [...PARK_SERVICES, ...VENDOR_SERVICES]

export function getServiceById(id?: string): ServiceItem | null {
  if (!id) {
    return null
  }
  return SERVICES.find((item) => item.id === id) || null
}
