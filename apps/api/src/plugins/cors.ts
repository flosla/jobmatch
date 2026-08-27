import type { FastifyCorsOptions } from '@fastify/cors'

export const corsOptions: FastifyCorsOptions = {
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  methods: ['GET', 'HEAD', 'POST', 'PUT'],
}
