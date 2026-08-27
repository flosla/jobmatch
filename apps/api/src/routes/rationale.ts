import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorResponseSchema, regenerateRationaleResponseSchema } from '@jobmatch/shared'
import { seedStore } from '../data/seedStore.js'
import { llmClient } from '../llm/azureFoundryClient.js'

export function registerRationaleRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.post(
    '/api/matches/:jobId/rationale/regenerate',
    {
      schema: {
        params: z.object({ jobId: z.string() }),
        response: { 200: regenerateRationaleResponseSchema, 404: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const match = seedStore.getMatch(request.params.jobId)
      if (!match) {
        return reply.code(404).send({ error: `No match found for jobId "${request.params.jobId}"` })
      }
      const rationale = await llmClient.generateMatchRationale({
        profile: seedStore.getProfile(),
        job: match.job,
        scoreBreakdown: match.scoreBreakdown,
      })
      return { rationale, generatedBy: 'mock-azure-ai-foundry' as const }
    },
  )
}
