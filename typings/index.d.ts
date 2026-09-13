declare namespace WechatMiniprogram {
  interface Wx {
    showToast(opt: {
      title: string
      icon?: 'success' | 'error' | 'loading' | 'none'
      duration?: number
      mask?: boolean
    }): void
    setClipboardData(opt: {
      data: string
      success?: () => void
      fail?: () => void
    }): void
    getClipboardData(opt: {
      success?: (res: { data: string }) => void
      fail?: () => void
      complete?: () => void
    }): void
    getSystemInfoSync(): {
      platform: 'devtools' | 'ios' | 'android' | 'windows' | 'mac' | string
    }
    getMenuButtonBoundingClientRect(): {
      top: number
      bottom: number
      left: number
      right: number
      width: number
      height: number
    }
    navigateTo(opt: {
      url: string
      fail?: (err: { errMsg: string }) => void
    }): void
    reLaunch(opt: { url: string }): void
    switchTab(opt: { url: string; fail?: () => void }): void
    navigateBack(opt?: { delta?: number; fail?: () => void }): void
    getStorageSync(key: string): unknown
    setStorageSync(key: string, data: unknown): void
    request(opt: {
      url: string
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
      data?: object | string | ArrayBuffer
      header?: Record<string, string>
      timeout?: number
      dataType?: 'json' | string
      success?: (res: {
        data: unknown
        statusCode: number
        header: Record<string, string>
      }) => void
      fail?: (err: { errMsg: string; errno?: number }) => void
      complete?: () => void
    }): void
    chooseMessageFile(opt: {
      count?: number
      type?: 'all' | 'video' | 'image' | 'file'
      success?: (res: { tempFiles: Array<{ name: string; path: string }> }) => void
      fail?: () => void
    }): void
  }

  interface PageInstance<D> {
    data: D
    setData(data: Partial<D> | Record<string, unknown>, callback?: () => void): void
  }

  type PageOptions<D, M> = {
    data?: D
    onLoad?: (query: Record<string, string | undefined>) => void
    onShow?: (options?: Record<string, unknown>) => void
    onReady?: () => void
    onHide?: () => void
    onUnload?: () => void
    onShareAppMessage?: () => { title: string; path?: string }
  } & M

  interface ComponentInstance<D, P> {
    data: D
    properties: P
    setData(data: Record<string, unknown>, callback?: () => void): void
    triggerEvent(
      name: string,
      detail?: Record<string, unknown>,
      options?: Record<string, unknown>
    ): void
  }
}

declare const wx: WechatMiniprogram.Wx

declare const console: {
  log(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

declare function setTimeout(handler: () => void, timeout?: number): number
declare function clearTimeout(id: number): void

interface IAppOption {
  globalData: {
    backendStatus: 'unknown' | 'checking' | 'connected' | 'unavailable'
    currentIdentity: {
      user: { id: string; display_name: string; status: string }
      enterprise: { id: string; name: string }
      membership: { id: string; role: string; status: string }
    } | null
    identityStatus: 'loading' | 'available' | 'unavailable'
    identityErrorCode: string | null
    identityErrorMessage: string | null
  }
  preloadBackendConnection(): void
  refreshBackendHealth(): Promise<void>
  refreshCurrentIdentity(): Promise<void>
}

declare function getApp(): IAppOption

declare function App<T extends Record<string, unknown>>(
  options: T & ThisType<T>
): void

declare function Page<D extends Record<string, unknown>, M extends Record<string, unknown>>(
  options: WechatMiniprogram.PageOptions<D, M> &
    M &
    ThisType<WechatMiniprogram.PageInstance<D> & M>
): void

declare function Component<
  P extends Record<string, unknown>,
  D extends Record<string, unknown>,
  M extends Record<string, unknown>
>(
  options: {
    properties?: {
      [K in keyof P]?: {
        type: unknown
        value?: P[K]
      }
    }
    data?: D
    methods?: M
    observers?: Record<string, (...args: unknown[]) => void>
    lifetimes?: {
      attached?: () => void
      detached?: () => void
    }
  } & ThisType<WechatMiniprogram.ComponentInstance<D, P> & M>
): void
