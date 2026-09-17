/**
 * 「为您推送」卡片主题：四套固定视觉
 *
 * 图片目录：miniprogram/images/discovery-bg/
 * 微信开发者工具路径：/images/discovery-bg/
 *
 * 后端传 opportunity_type 为下面四个 key 时，直接落到对应卡片：
 * beichen / finance / policy / scenario
 *
 * 旧类型（financial_service、创赛等）会兼容映射到这四套。
 */

const BG_DIR = '/images/discovery-bg'

export type DiscoveryCardThemeKey = 'beichen' | 'finance' | 'policy' | 'scenario'

export type DiscoveryCardInk = 'light' | 'dark'

export type DiscoveryCardTheme = {
  key: DiscoveryCardThemeKey
  backgroundImage: string
  backColor: string
  ink: DiscoveryCardInk
}

export const DISCOVERY_CARD_THEMES: Record<DiscoveryCardThemeKey, DiscoveryCardTheme> = {
  beichen: {
    key: 'beichen',
    backgroundImage: `${BG_DIR}/beichen.png`,
    backColor: '#0061ED',
    ink: 'light',
  },
  finance: {
    key: 'finance',
    backgroundImage: `${BG_DIR}/finance.png`,
    backColor: '#BB426B',
    ink: 'light',
  },
  policy: {
    key: 'policy',
    backgroundImage: `${BG_DIR}/policy.png`,
    backColor: '#DAE4F1',
    ink: 'dark',
  },
  scenario: {
    key: 'scenario',
    backgroundImage: `${BG_DIR}/scenario.png`,
    backColor: '#DEFAE5',
    ink: 'dark',
  },
}

export const DISCOVERY_CARD_THEME_DEFAULT: DiscoveryCardThemeKey = 'beichen'

/** 后端 opportunity_type → 四套卡片。与文件名相同的 key 会直接命中。 */
const THEME_BY_TYPE: Record<string, DiscoveryCardThemeKey> = {
  beichen: 'beichen',
  finance: 'finance',
  policy: 'policy',
  scenario: 'scenario',
  financial_service: 'finance',
  equity_funding: 'finance',
  competition: 'beichen',
  park_service: 'beichen',
  other: 'beichen',
}

const THEME_BY_KIND: Record<string, DiscoveryCardThemeKey> = {
  北辰: 'beichen',
  政策: 'policy',
  金融服务: 'finance',
  股权融资: 'finance',
  融资: 'finance',
  场景机会: 'scenario',
  场景: 'scenario',
  创赛: 'beichen',
  园区服务: 'beichen',
  其他: 'beichen',
  内容: 'beichen',
  推荐: 'beichen',
}

export function resolveDiscoveryCardTheme(input: {
  opportunityType?: string | null
  kind?: string | null
}): DiscoveryCardTheme {
  const typeKey = input.opportunityType ? THEME_BY_TYPE[input.opportunityType] : ''
  if (typeKey) {
    return DISCOVERY_CARD_THEMES[typeKey]
  }
  const kindKey = input.kind ? THEME_BY_KIND[input.kind] : ''
  if (kindKey) {
    return DISCOVERY_CARD_THEMES[kindKey]
  }
  return DISCOVERY_CARD_THEMES[DISCOVERY_CARD_THEME_DEFAULT]
}

export function resolveDiscoveryBackground(input: {
  opportunityType?: string | null
  kind?: string | null
}): string {
  return resolveDiscoveryCardTheme(input).backgroundImage
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const raw = (hex || '').replace('#', '').trim()
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return {
      r: parseInt(raw[0] + raw[0], 16),
      g: parseInt(raw[1] + raw[1], 16),
      b: parseInt(raw[2] + raw[2], 16),
    }
  }
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
    return null
  }
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  }
}

/** 用卡片主色盖住文字区，避免正文叠到右侧装饰或左下浅色块上。 */
export function buildDiscoveryCardScrimStyle(backColor: string): string {
  const rgb = parseHexColor(backColor)
  if (!rgb) {
    return ''
  }
  const solid = `rgb(${rgb.r},${rgb.g},${rgb.b})`
  const soft = `rgba(${rgb.r},${rgb.g},${rgb.b},0.86)`
  const fade = `rgba(${rgb.r},${rgb.g},${rgb.b},0)`
  return `background-image:linear-gradient(90deg,${solid} 0%,${solid} 30%,${soft} 50%,${fade} 72%),linear-gradient(0deg,${solid} 0%,${solid} 18%,${fade} 48%);`
}
