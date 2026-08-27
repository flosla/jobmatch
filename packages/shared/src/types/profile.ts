import { z } from 'zod'

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startYear: z.number().int(),
  endYear: z.number().int(),
})
export type Education = z.infer<typeof educationSchema>

export const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string(),
  startDate: z.string(), // ISO yyyy-mm-dd
  endDate: z.string().nullable(), // null = present
  highlights: z.array(z.string()),
})
export type Experience = z.infer<typeof experienceSchema>

export const cvSchema = z.object({
  fileName: z.string(),
  uploadedAt: z.string(), // ISO datetime
  rawText: z.string(),
})
export type Cv = z.infer<typeof cvSchema>

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  headline: z.string(),
  email: z.email(),
  phone: z.string(),
  location: z.string(),
  links: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
  }),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  skills: z.array(z.string()),
  cv: cvSchema,
})
export type Profile = z.infer<typeof profileSchema>

export const updateProfileRequestSchema = profileSchema
  .omit({ id: true, cv: true })
  .partial()
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>
