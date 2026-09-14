import {
  CREATE_SUBMISSION_TIMEOUT_MS,
  PROCESS_SUBMISSION_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
} from './config'
import { request } from './client'
import type {
  CreateServiceCaseResponse,
  CreateUserSubmissionRequest,
  CreateUserSubmissionResponse,
  UserSubmissionDetail,
  UserSubmissionListResponse,
} from './types'

const MY_SUBMISSIONS_LIMIT = 20

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

export function listMyUserSubmissions(): Promise<UserSubmissionListResponse> {
  return request<UserSubmissionListResponse>({
    path: `/api/user-submissions/mine?limit=${MY_SUBMISSIONS_LIMIT}&offset=0`,
    method: 'GET',
    timeout: REQUEST_TIMEOUT_MS,
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

export function createServiceCase(
  submissionId: string
): Promise<CreateServiceCaseResponse> {
  return request<CreateServiceCaseResponse>({
    path: `/api/user-submissions/${submissionId}/service-case`,
    method: 'POST',
    timeout: REQUEST_TIMEOUT_MS,
  })
}
