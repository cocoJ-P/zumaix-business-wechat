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

App({
  onLaunch(options: {
    query?: Record<string, string | undefined>
    referrerInfo?: { extraData?: Record<string, unknown> }
  }) {
    captureIncoming(options || {})
  },
  onShow(options: {
    query?: Record<string, string | undefined>
    referrerInfo?: { extraData?: Record<string, unknown> }
  }) {
    captureIncoming(options || {})
  },
})
