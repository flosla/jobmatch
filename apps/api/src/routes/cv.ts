import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { cvParsePreviewRequestSchema, cvParsePreviewResponseSchema } from '@jobmatch/shared'
import { parseCv } from '../cv/parseCv.js'

export function registerCvRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.post(
    '/api/cv/parse-preview',
    {
      schema: {
        body: cvParsePreviewRequestSchema,
        response: { 200: cvParsePreviewResponseSchema },
      },
    },
    async (request) => ({ extracted: parseCv(request.body.rawText) }),
  )
}
