import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { profileSchema, updateProfileRequestSchema } from '@jobmatch/shared'
import { seedStore } from '../data/seedStore.js'

export function registerProfileRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
    '/api/profile',
    { schema: { response: { 200: profileSchema } } },
    async () => seedStore.getProfile(),
  )

  typedApp.put(
    '/api/profile',
    {
      schema: {
        body: updateProfileRequestSchema,
        response: { 200: profileSchema },
      },
    },
    async (request) => seedStore.updateProfile(request.body),
  )
}
