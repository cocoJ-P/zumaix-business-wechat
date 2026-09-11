declare namespace WechatMiniprogram {
  interface Wx {
    showToast(opt: {
      title: string
      icon?: 'success' | 'error' | 'loading' | 'none'
      duration?: number
      mask?: boolean
    }): void
    getClipboardData(opt: {
      success?: (res: { data: string }) => void
      fail?: () => void
      complete?: () => void
    }): void
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

declare function setTimeout(handler: () => void, timeout?: number): number
declare function clearTimeout(id: number): void

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
