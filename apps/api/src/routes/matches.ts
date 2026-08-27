import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorResponseSchema, getMatchesResponseSchema, matchWithJobSchema } from '@jobmatch/shared'
import { seedStore } from '../data/seedStore.js'

export function registerMatchRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
    '/api/matches',
    { schema: { response: { 200: getMatchesResponseSchema } } },
    async () => seedStore.getTodayMatches(),
  )

  typedApp.get(
    '/api/matches/:jobId',
    {
      schema: {
        params: z.object({ jobId: z.string() }),
        response: { 200: matchWithJobSchema, 404: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const match = seedStore.getMatch(request.params.jobId)
      if (!match) {
        return reply.code(404).send({ error: `No match found for jobId "${request.params.jobId}"` })
      }
      return match
    },
  )
}
