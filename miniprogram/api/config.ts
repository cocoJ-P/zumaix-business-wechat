/**
 * 筑脉查查 → 筑脉企服 Backend 的唯一配置入口。
 *
 * 切换 development / staging / production 时只改 API_ENV，
 * 不要把 Base URL 或 DEV_USER_ID 散落到页面。
 */

export type ApiEnvironment = 'development' | 'staging' | 'production'

/**
 * 当前运行环境。真机或正式域名联调时改为 staging / production。
 * 手机上的 127.0.0.1 指向手机自身，不能作为真机 Backend 地址。
 */
export const API_ENV: ApiEnvironment = 'development'

type EnvConfig = {
  baseUrl: string
  /**
   * Development Identity only.
   * 不是 Access Token / Secret / Password / openid。
   * 正式微信登录 / OnePass 将替换该注入机制。
   */
  devUserId?: string
}

const API_CONFIG: Record<ApiEnvironment, EnvConfig> = {
  development: {
    baseUrl: 'http://127.0.0.1:8000',
    devUserId: '2d7c1f4a-8b3e-4a91-9c2d-6e5f4a3b2c10',
  },
  staging: {
    baseUrl: 'https://api-dev.xxx.com',
  },
  production: {
    baseUrl: 'https://api.xxx.com',
  },
}

/**
 * 真机调试用的电脑局域网 IPv4。
 * 换 Wi-Fi 或 DHCP 变了之后改这里。模拟器不会走这个地址。
 */
export const DEV_LAN_HOST = '192.168.112.90'

export const DEV_LAN_PORT = 8000

function isDevtools(): boolean {
  try {
    return wx.getSystemInfoSync().platform === 'devtools'
  } catch {
    return true
  }
}

function resolveApiBaseUrl(): string {
  const configured = API_CONFIG[API_ENV].baseUrl.replace(/\/+$/, '')
  if (API_ENV !== 'development' || isDevtools() || !DEV_LAN_HOST) {
    return configured
  }
  return `http://${DEV_LAN_HOST}:${DEV_LAN_PORT}`
}

const current = API_CONFIG[API_ENV]

export const API_BASE_URL = resolveApiBaseUrl()

if (API_ENV === 'development') {
  console.warn(`[api] base=${API_BASE_URL}`)
}

const configuredDevUserId = current.devUserId && current.devUserId.trim()

export const DEV_USER_ID: string | undefined = configuredDevUserId || undefined

/** 普通 Backend API 默认超时。单个请求可通过 request({ timeout }) 覆盖。 */
export const REQUEST_TIMEOUT_MS = 12_000

/** Content Ingest 单独超时，不改全局默认。 */
export const INGEST_TIMEOUT_MS = 30_000

/** Intelligence Analyze 单独超时。小程序 wx.request 上限约 60s，取 55s。 */
export const ANALYZE_TIMEOUT_MS = 55_000

export const DEV_USER_HEADER = 'X-Dev-User-Id'

export function getEnvironmentLabel(): string {
  if (API_ENV === 'production') {
    return '生产环境'
  }
  if (API_ENV === 'staging') {
    return '预发环境'
  }
  return '开发环境'
}
