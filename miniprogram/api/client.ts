import { API_BASE_URL, DEV_USER_HEADER, DEV_USER_ID, REQUEST_TIMEOUT_MS } from './config'
import type { ApiError } from './errors'
import { normalizeBackendError, normalizeWxFail } from './errors'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  path: string
  method?: HttpMethod
  data?: object | string | ArrayBuffer
  headers?: Record<string, string>
  timeout?: number
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {}),
  }

  if (DEV_USER_ID) {
    headers[DEV_USER_HEADER] = DEV_USER_ID
  } else if (headers[DEV_USER_HEADER] === '') {
    delete headers[DEV_USER_HEADER]
  }

  return headers
}

function logApiError(path: string, error: ApiError): void {
  console.warn(
    `[api] ${path} status=${error.status ?? '-'} code=${error.code}`
  )
}

/**
 * 统一 Backend HTTP Client。
 * 页面禁止直接调用 wx.request。
 */
export function request<T>(options: RequestOptions): Promise<T> {
  const method = options.method || 'GET'
  const path = options.path.startsWith('/') ? options.path : `/${options.path}`
  const url = `${API_BASE_URL}${path}`
  const timeout = options.timeout ?? REQUEST_TIMEOUT_MS
  const header = buildHeaders(options.headers)

  return new Promise<T>((resolve, reject) => {
    wx.request({
      url,
      method,
      data: options.data,
      header,
      timeout,
      dataType: 'json',
      success(res) {
        const status = res.statusCode
        if (status >= 200 && status < 300) {
          resolve(res.data as T)
          return
        }

        const error = normalizeBackendError(res.data, status)
        logApiError(path, error)
        reject(error)
      },
      fail(err) {
        const error = normalizeWxFail(err.errMsg || '')
        logApiError(path, error)
        reject(error)
      },
    })
  })
}
