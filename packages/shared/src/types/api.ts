import { z } from 'zod'
import { matchFeedbackStatusSchema, matchWithJobSchema } from './match.js'
import { profileSchema } from './profile.js'

export const getMatchesResponseSchema = z.object({
  date: z.string(), // ISO yyyy-mm-dd, "today" for the demo's matching run
  matches: z.array(matchWithJobSchema),
})
export type GetMatchesResponse = z.infer<typeof getMatchesResponseSchema>

export const cvParsePreviewRequestSchema = z.object({
  rawText: z.string().min(1),
})
export type CvParsePreviewRequest = z.infer<typeof cvParsePreviewRequestSchema>

export const cvParsePreviewResponseSchema = z.object({
  extracted: profileSchema.omit({ id: true, cv: true }).partial(),
})
export type CvParsePreviewResponse = z.infer<typeof cvParsePreviewResponseSchema>

export const regenerateRationaleResponseSchema = z.object({
  rationale: z.string(),
  generatedBy: z.literal('mock-azure-ai-foundry'),
})
export type RegenerateRationaleResponse = z.infer<typeof regenerateRationaleResponseSchema>

export const setMatchFeedbackRequestSchema = z.object({
  status: matchFeedbackStatusSchema,
})
export type SetMatchFeedbackRequest = z.infer<typeof setMatchFeedbackRequestSchema>

export const setMatchFeedbackResponseSchema = z.object({
  jobId: z.string(),
  feedback: matchFeedbackStatusSchema,
})
export type SetMatchFeedbackResponse = z.infer<typeof setMatchFeedbackResponseSchema>

export const errorResponseSchema = z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof errorResponseSchema>

export const telegramSummaryRequestSchema = z.object({
  date: z.string(),
  jobIds: z.array(z.string()).min(1).max(50),
  filterSummary: z.string().nullable(),
})
export type TelegramSummaryRequest = z.infer<typeof telegramSummaryRequestSchema>

export const telegramSummaryResponseSchema = z.object({
  sent: z.literal(true),
  matchCount: z.number().int().min(1),
})
export type TelegramSummaryResponse = z.infer<typeof telegramSummaryResponseSchema>
