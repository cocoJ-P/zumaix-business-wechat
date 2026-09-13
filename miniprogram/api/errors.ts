export class ApiError extends Error {
  readonly status: number | null
  readonly code: string
  readonly details: unknown

  constructor({
    status,
    code,
    message,
    details,
  }: {
    status?: number | null
    code: string
    message: string
    details?: unknown
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? null
    this.code = code
    this.details = details ?? null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readBackendError(value: unknown): {
  code: string
  message: string
  details: unknown
} | null {
  if (!isRecord(value)) {
    return null
  }

  const envelope = isRecord(value.error) ? value.error : value
  const { code, message, details } = envelope

  if (typeof code === 'string' && typeof message === 'string') {
    return {
      code,
      message,
      details: details ?? null,
    }
  }

  return null
}

export function isTimeoutFail(errMsg: string): boolean {
  return /timeout|timed\s*out|超时/i.test(errMsg)
}

export function normalizeBackendError(
  payload: unknown,
  status: number
): ApiError {
  const backendError = readBackendError(payload)
  if (backendError) {
    return new ApiError({
      status,
      code: backendError.code,
      message: backendError.message,
      details: backendError.details,
    })
  }

  return new ApiError({
    status,
    code: 'UNKNOWN_ERROR',
    message: '请求失败，请稍后重试',
    details: payload,
  })
}

export function normalizeWxFail(errMsg: string): ApiError {
  if (isTimeoutFail(errMsg)) {
    return new ApiError({
      code: 'REQUEST_TIMEOUT',
      message: '请求超时，请稍后重试',
      details: errMsg,
    })
  }

  return new ApiError({
    code: 'NETWORK_ERROR',
    message: '无法连接筑脉企服 Backend',
    details: errMsg,
  })
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: '请求失败，请稍后重试',
    details: error,
  })
}
