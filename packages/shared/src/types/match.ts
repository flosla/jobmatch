import { z } from 'zod'
import { jobPostingSchema } from './job.js'

export const scoreBreakdownSchema = z.object({
  skillOverlap: z.number().min(0).max(1),
  titleSimilarity: z.number().min(0).max(1),
  seniorityFit: z.number().min(0).max(1),
  experienceYearsFit: z.number().min(0).max(1),
})
export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>

export const matchSchema = z.object({
  jobId: z.string(),
  profileId: z.string(),
  score: z.number().min(0).max(1),
  scoreBreakdown: scoreBreakdownSchema,
  rank: z.number().int().min(1),
  rationale: z.string(),
})
export type Match = z.infer<typeof matchSchema>

export const matchWithJobSchema = matchSchema.extend({
  job: jobPostingSchema,
})
export type MatchWithJob = z.infer<typeof matchWithJobSchema>
