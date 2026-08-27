import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildApp } from './app.js'

test('GET /api/matches returns 10 ranked matches', async () => {
  const app = buildApp()
  const res = await app.inject({ method: 'GET', url: '/api/matches' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.matches.length, 10)
  assert.ok(body.matches[0].score >= body.matches[9].score)
})

test('GET /api/jobs/:id 404s for an unknown id', async () => {
  const app = buildApp()
  const res = await app.inject({ method: 'GET', url: '/api/jobs/does-not-exist' })
  assert.equal(res.statusCode, 404)
})

test('GET /api/jobs/:id returns a known job', async () => {
  const app = buildApp()
  const res = await app.inject({ method: 'GET', url: '/api/jobs/job-001' })
  assert.equal(res.statusCode, 200)
  assert.equal(res.json().title, 'Senior AI Engineer')
})

test('POST /api/notifications/telegram-summary 503s when Telegram is not configured', async () => {
  delete process.env.TELEGRAM_BOT_TOKEN
  delete process.env.TELEGRAM_CHAT_ID

  const app = buildApp()
  const res = await app.inject({
    method: 'POST',
    url: '/api/notifications/telegram-summary',
    payload: { date: '2026-08-26', jobIds: ['job-001'], filterSummary: null },
  })
  assert.equal(res.statusCode, 503)
  assert.match(res.json().error, /not configured/i)
})

test('POST /api/notifications/telegram-summary 400s when no jobIds match', async () => {
  const app = buildApp()
  const res = await app.inject({
    method: 'POST',
    url: '/api/notifications/telegram-summary',
    payload: { date: '2026-08-26', jobIds: ['does-not-exist'], filterSummary: null },
  })
  assert.equal(res.statusCode, 400)
})
