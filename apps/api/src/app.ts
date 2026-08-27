import cors from '@fastify/cors'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { corsOptions } from './plugins/cors.js'
import { registerCvRoutes } from './routes/cv.js'
import { registerJobRoutes } from './routes/jobs.js'
import { registerMatchRoutes } from './routes/matches.js'
import { registerNotificationRoutes } from './routes/notifications.js'
import { registerProfileRoutes } from './routes/profile.js'
import { registerRationaleRoutes } from './routes/rationale.js'

export function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(cors, corsOptions)

  registerProfileRoutes(app)
  registerJobRoutes(app)
  registerMatchRoutes(app)
  registerRationaleRoutes(app)
  registerCvRoutes(app)
  registerNotificationRoutes(app)

  return app
}
