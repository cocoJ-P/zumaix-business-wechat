import {
  CREATE_SUBMISSION_TIMEOUT_MS,
  PROCESS_SUBMISSION_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
} from './config'
import { request } from './client'
import type {
  CreateUserSubmissionRequest,
  CreateUserSubmissionResponse,
  UserSubmissionDetail,
} from './types'

export function createUserSubmission(
  input: CreateUserSubmissionRequest
): Promise<CreateUserSubmissionResponse> {
  return request<CreateUserSubmissionResponse>({
    path: '/api/user-submissions',
    method: 'POST',
    data: input,
    timeout: CREATE_SUBMISSION_TIMEOUT_MS,
  })
}

export function processUserSubmission(
  submissionId: string
): Promise<UserSubmissionDetail> {
  return request<UserSubmissionDetail>({
    path: `/api/user-submissions/${submissionId}/process`,
    method: 'POST',
    timeout: PROCESS_SUBMISSION_TIMEOUT_MS,
  })
}

export function getUserSubmission(
  submissionId: string
): Promise<UserSubmissionDetail> {
  return request<UserSubmissionDetail>({
    path: `/api/user-submissions/${submissionId}`,
    method: 'GET',
    timeout: REQUEST_TIMEOUT_MS,
  })
}
