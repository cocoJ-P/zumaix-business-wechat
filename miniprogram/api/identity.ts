import { request } from './client'
import { ApiError } from './errors'
import type { CurrentIdentityResponse } from './types'

const IDENTITY_ERROR_MESSAGE: Record<string, string> = {
  DEV_IDENTITY_REQUIRED: '未配置开发身份',
  INVALID_DEV_USER_ID: '开发身份配置无效',
  AUTHENTICATION_REQUIRED: '当前环境需要身份认证',
  USER_NOT_FOUND: '当前开发用户不存在',
  USER_DISABLED: '当前用户已停用',
  ENTERPRISE_MEMBERSHIP_NOT_FOUND: '当前用户尚未加入企业',
  ENTERPRISE_CONTEXT_REQUIRED: '当前用户关联多个企业，需要选择企业',
}

export function getCurrentIdentity(): Promise<CurrentIdentityResponse> {
  return request<CurrentIdentityResponse>({
    path: '/api/me',
    method: 'GET',
  })
}

export function getIdentityErrorMessage(error: ApiError): string {
  return IDENTITY_ERROR_MESSAGE[error.code] ?? '身份暂不可用'
}
