/**
 * 「为您推送」卡片背景图映射表
 *
 * 图片目录：miniprogram/images/discovery-bg/
 * 在微信开发者工具中对应路径：/images/discovery-bg/
 *
 * 按种类放入同名 png（也可用 jpg，改下方路径后缀即可）。
 * 文件缺失时卡片会自动回退到原来的渐变背景。
 *
 * | 种类     | 文件名                 |
 * | -------- | ---------------------- |
 * | 政策     | policy.png             |
 * | 创赛     | competition.png        |
 * | 金融服务 | financial-service.png  |
 * | 股权融资 | equity-funding.png     |
 * | 园区服务 | park-service.png       |
 * | 场景机会 | scenario.png           |
 * | 其他     | other.png              |
 * | 内容     | content.png            |
 * | 推荐     | recommend.png          |
 * | 缺省     | default.png            |
 */

const BG_DIR = '/images/discovery-bg'

export const DISCOVERY_BACKGROUND_DEFAULT = `${BG_DIR}/default.png`

export const DISCOVERY_BACKGROUND_BY_TYPE: Record<string, string> = {
  policy: `${BG_DIR}/policy.png`,
  competition: `${BG_DIR}/competition.png`,
  financial_service: `${BG_DIR}/financial-service.png`,
  equity_funding: `${BG_DIR}/equity-funding.png`,
  park_service: `${BG_DIR}/park-service.png`,
  scenario: `${BG_DIR}/scenario.png`,
  other: `${BG_DIR}/other.png`,
}

export const DISCOVERY_BACKGROUND_BY_KIND: Record<string, string> = {
  政策: DISCOVERY_BACKGROUND_BY_TYPE.policy,
  创赛: DISCOVERY_BACKGROUND_BY_TYPE.competition,
  金融服务: DISCOVERY_BACKGROUND_BY_TYPE.financial_service,
  股权融资: DISCOVERY_BACKGROUND_BY_TYPE.equity_funding,
  融资: DISCOVERY_BACKGROUND_BY_TYPE.equity_funding,
  园区服务: DISCOVERY_BACKGROUND_BY_TYPE.park_service,
  场景机会: DISCOVERY_BACKGROUND_BY_TYPE.scenario,
  场景: DISCOVERY_BACKGROUND_BY_TYPE.scenario,
  其他: DISCOVERY_BACKGROUND_BY_TYPE.other,
  内容: `${BG_DIR}/content.png`,
  推荐: `${BG_DIR}/recommend.png`,
}

export function resolveDiscoveryBackground(input: {
  opportunityType?: string | null
  kind?: string | null
}): string {
  const typeKey = input.opportunityType ? DISCOVERY_BACKGROUND_BY_TYPE[input.opportunityType] : ''
  if (typeKey) {
    return typeKey
  }
  const kindKey = input.kind ? DISCOVERY_BACKGROUND_BY_KIND[input.kind] : ''
  if (kindKey) {
    return kindKey
  }
  return DISCOVERY_BACKGROUND_DEFAULT
}
