import {
  cvParsePreviewRequestSchema,
  cvParsePreviewResponseSchema,
  getMatchesResponseSchema,
  jobPostingSchema,
  matchWithJobSchema,
  profileSchema,
  regenerateRationaleResponseSchema,
  setMatchFeedbackRequestSchema,
  setMatchFeedbackResponseSchema,
  telegramSummaryRequestSchema,
  telegramSummaryResponseSchema,
  updateProfileRequestSchema,
  type CvParsePreviewResponse,
  type GetMatchesResponse,
  type JobPosting,
  type MatchFeedbackStatus,
  type MatchWithJob,
  type Profile,
  type RegenerateRationaleResponse,
  type SetMatchFeedbackResponse,
  type TelegramSummaryRequest,
  type TelegramSummaryResponse,
  type UpdateProfileRequest,
} from '@jobmatch/shared'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(
  path: string,
  schema: { parse: (value: unknown) => T },
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body && typeof body === 'object' && 'error' in body ? String(body.error) : res.statusText
    throw new Error(`API request to ${path} failed (${res.status}): ${message}`)
  }
  return schema.parse(await res.json())
}

export const apiClient = {
  getProfile: (): Promise<Profile> => request('/api/profile', profileSchema),

  updateProfile: (patch: UpdateProfileRequest): Promise<Profile> =>
    request('/api/profile', profileSchema, {
      method: 'PUT',
      body: JSON.stringify(updateProfileRequestSchema.parse(patch)),
    }),

  getTodayMatches: (): Promise<GetMatchesResponse> => request('/api/matches', getMatchesResponseSchema),

  getMatch: (jobId: string): Promise<MatchWithJob> => request(`/api/matches/${jobId}`, matchWithJobSchema),

  setMatchFeedback: (jobId: string, status: MatchFeedbackStatus): Promise<SetMatchFeedbackResponse> =>
    request(`/api/matches/${jobId}/feedback`, setMatchFeedbackResponseSchema, {
      method: 'PUT',
      body: JSON.stringify(setMatchFeedbackRequestSchema.parse({ status })),
    }),

  getJob: (jobId: string): Promise<JobPosting> => request(`/api/jobs/${jobId}`, jobPostingSchema),

  regenerateRationale: (jobId: string): Promise<RegenerateRationaleResponse> =>
    request(`/api/matches/${jobId}/rationale/regenerate`, regenerateRationaleResponseSchema, {
      method: 'POST',
    }),

  parseCvPreview: (rawText: string): Promise<CvParsePreviewResponse> =>
    request('/api/cv/parse-preview', cvParsePreviewResponseSchema, {
      method: 'POST',
      body: JSON.stringify(cvParsePreviewRequestSchema.parse({ rawText })),
    }),

  sendTelegramSummary: (payload: TelegramSummaryRequest): Promise<TelegramSummaryResponse> =>
    request('/api/notifications/telegram-summary', telegramSummaryResponseSchema, {
      method: 'POST',
      body: JSON.stringify(telegramSummaryRequestSchema.parse(payload)),
    }),
}
