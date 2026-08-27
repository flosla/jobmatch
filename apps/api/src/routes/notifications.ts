import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { MatchWithJob } from '@jobmatch/shared'
import { errorResponseSchema, telegramSummaryRequestSchema, telegramSummaryResponseSchema } from '@jobmatch/shared'
import { seedStore } from '../data/seedStore.js'
import { sendTelegramMessage, TelegramApiError, TelegramNotConfiguredError } from '../notifications/telegramClient.js'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatMatchLine(match: MatchWithJob, index: number): string {
  const pct = Math.round(match.score * 100)
  return (
    `${index + 1}. <b>${escapeHtml(match.job.title)}</b> @ ${escapeHtml(match.job.company)} — ` +
    `${pct}% match (${escapeHtml(match.job.workplaceType)})\n` +
    `<a href="${escapeHtml(match.job.applyUrl)}">Apply</a>`
  )
}

function buildSummaryMessage(date: string, matches: MatchWithJob[], filterSummary: string | null): string {
  const lines = [`📋 <b>Daily Job Matches</b> — ${escapeHtml(date)}`]
  if (filterSummary) lines.push(`Filters: ${escapeHtml(filterSummary)}`)
  lines.push('', `Showing ${matches.length} match${matches.length === 1 ? '' : 'es'}`, '')
  matches.forEach((match, i) => lines.push(formatMatchLine(match, i), ''))
  return lines.join('\n').trim()
}

export function registerNotificationRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.post(
    '/api/notifications/telegram-summary',
    {
      schema: {
        body: telegramSummaryRequestSchema,
        response: {
          200: telegramSummaryResponseSchema,
          400: errorResponseSchema,
          502: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { date, jobIds, filterSummary } = request.body

      const matches = jobIds
        .map((jobId) => seedStore.getMatch(jobId))
        .filter((match): match is MatchWithJob => match != null)

      if (matches.length === 0) {
        return reply.code(400).send({ error: 'None of the provided jobIds correspond to a known match.' })
      }

      const message = buildSummaryMessage(date, matches, filterSummary)

      try {
        await sendTelegramMessage(message)
      } catch (err) {
        if (err instanceof TelegramNotConfiguredError) {
          return reply.code(503).send({ error: err.message })
        }
        if (err instanceof TelegramApiError) {
          return reply.code(502).send({ error: err.message })
        }
        throw err
      }

      return { sent: true as const, matchCount: matches.length }
    },
  )
}
