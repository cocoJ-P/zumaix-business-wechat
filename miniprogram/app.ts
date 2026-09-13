import { getBackendHealth } from './api/health'
import { getCurrentIdentity, getIdentityErrorMessage } from './api/identity'
import { toApiError } from './api/errors'
import { INITIAL_APP_GLOBAL_DATA } from './api/types'
import { setIncomingShare } from './utils/workbench'

function firstQueryValue(
  query: Record<string, string | undefined> | undefined,
  keys: string[]
): string {
  if (!query) {
    return ''
  }
  for (const key of keys) {
    const raw = query[key]
    if (raw && raw.trim()) {
      try {
        return decodeURIComponent(raw).trim()
      } catch {
        return raw.trim()
      }
    }
  }
  return ''
}

function extraDataContent(extra: Record<string, unknown> | undefined): string {
  if (!extra) {
    return ''
  }
  const keys = ['content', 'text', 'url', 'link']
  for (const key of keys) {
    const value = extra[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function captureIncoming(options: {
  query?: Record<string, string | undefined>
  referrerInfo?: { extraData?: Record<string, unknown> }
}): void {
  const fromQuery = firstQueryValue(options.query, ['url', 'link', 'text', 'content'])
  const fromExtra = extraDataContent(
    options.referrerInfo && options.referrerInfo.extraData
  )
  const incoming = fromQuery || fromExtra
  if (incoming) {
    setIncomingShare(incoming)
  }
}

let healthInFlight: Promise<void> | null = null
let identityInFlight: Promise<void> | null = null

App({
  globalData: {
    backendStatus: INITIAL_APP_GLOBAL_DATA.backendStatus,
    currentIdentity: INITIAL_APP_GLOBAL_DATA.currentIdentity,
    identityStatus: INITIAL_APP_GLOBAL_DATA.identityStatus,
    identityErrorCode: INITIAL_APP_GLOBAL_DATA.identityErrorCode,
    identityErrorMessage: INITIAL_APP_GLOBAL_DATA.identityErrorMessage,
  },

  onLaunch(options: {
    query?: Record<string, string | undefined>
    referrerInfo?: { extraData?: Record<string, unknown> }
  }) {
    captureIncoming(options || {})
    this.preloadBackendConnection()
  },

  onShow(options: {
    query?: Record<string, string | undefined>
    referrerInfo?: { extraData?: Record<string, unknown> }
  }) {
    captureIncoming(options || {})
  },

  preloadBackendConnection() {
    void this.refreshBackendHealth()
    void this.refreshCurrentIdentity()
  },

  refreshBackendHealth() {
    if (healthInFlight) {
      return healthInFlight
    }
    healthInFlight = this.runBackendHealth().finally(() => {
      healthInFlight = null
    })
    return healthInFlight
  },

  async runBackendHealth() {
    if (this.globalData.backendStatus === 'unknown') {
      this.globalData.backendStatus = 'checking'
    }
    try {
      await getBackendHealth()
      this.globalData.backendStatus = 'connected'
    } catch (error) {
      const apiError = toApiError(error)
      this.globalData.backendStatus = 'unavailable'
      console.warn(`[health] ${apiError.code}`)
    }
  },

  refreshCurrentIdentity() {
    if (identityInFlight) {
      return identityInFlight
    }
    identityInFlight = this.runCurrentIdentity().finally(() => {
      identityInFlight = null
    })
    return identityInFlight
  },

  async runCurrentIdentity() {
    if (this.globalData.identityStatus !== 'available') {
      this.globalData.identityStatus = 'loading'
    }
    try {
      const identity = await getCurrentIdentity()
      this.globalData.currentIdentity = identity
      this.globalData.identityStatus = 'available'
      this.globalData.identityErrorCode = null
      this.globalData.identityErrorMessage = null
    } catch (error) {
      const apiError = toApiError(error)
      this.globalData.currentIdentity = null
      this.globalData.identityStatus = 'unavailable'
      this.globalData.identityErrorCode = apiError.code
      this.globalData.identityErrorMessage = getIdentityErrorMessage(apiError)
      console.warn(`[identity] ${apiError.code}`)
    }
  },
})
