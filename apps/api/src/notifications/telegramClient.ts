/**
 * Real Telegram Bot API integration (not mocked, unlike the Azure AI
 * Foundry client). Inert until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are
 * configured -- see apps/api/.env.example and README.md "Telegram daily
 * summary" for setup steps.
 */

export class TelegramNotConfiguredError extends Error {
  constructor() {
    super(
      'Telegram is not configured on the server. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID ' +
        'in apps/api/.env (see README.md "Telegram daily summary" for setup steps).',
    )
    this.name = 'TelegramNotConfiguredError'
  }
}

export class TelegramApiError extends Error {
  constructor(description: string) {
    super(`Telegram API rejected the request: ${description}`)
    this.name = 'TelegramApiError'
  }
}

interface TelegramSendMessageResponse {
  ok: boolean
  description?: string
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    throw new TelegramNotConfiguredError()
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  const body = (await res.json().catch(() => null)) as TelegramSendMessageResponse | null
  if (!res.ok || !body?.ok) {
    throw new TelegramApiError(body?.description ?? res.statusText)
  }
}
