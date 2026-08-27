import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorResponseSchema, jobPostingSchema } from '@jobmatch/shared'
import { seedStore } from '../data/seedStore.js'

export function registerJobRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
    '/api/jobs/:id',
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: { 200: jobPostingSchema, 404: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const job = seedStore.getJob(request.params.id)
      if (!job) {
        return reply.code(404).send({ error: `No job posting found with id "${request.params.id}"` })
      }
      return job
    },
  )
}
