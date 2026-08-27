import { z } from 'zod'

export const seniorityLevelSchema = z.enum(['junior', 'mid', 'senior', 'staff'])
export type SeniorityLevel = z.infer<typeof seniorityLevelSchema>

export const employmentTypeSchema = z.enum(['full_time', 'contract', 'part_time'])
export type EmploymentType = z.infer<typeof employmentTypeSchema>

export const workplaceTypeSchema = z.enum(['remote', 'hybrid', 'onsite'])
export type WorkplaceType = z.infer<typeof workplaceTypeSchema>

export const salaryRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  currency: z.string(),
})
export type SalaryRange = z.infer<typeof salaryRangeSchema>

export const jobPostingSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  workplaceType: workplaceTypeSchema,
  seniority: seniorityLevelSchema,
  employmentType: employmentTypeSchema,
  postedDate: z.string(), // ISO yyyy-mm-dd
  description: z.string(),
  requirements: z.array(z.string()),
  niceToHave: z.array(z.string()),
  skillsRequired: z.array(z.string()),
  salaryRange: salaryRangeSchema.nullable(),
  applyUrl: z.url(),
})
export type JobPosting = z.infer<typeof jobPostingSchema>
