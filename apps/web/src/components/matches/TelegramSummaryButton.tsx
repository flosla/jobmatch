import { useState } from 'react'
import type { MatchWithJob } from '@jobmatch/shared'
import { apiClient } from '../../lib/apiClient'
import { describeActiveFilters, type MatchFilterState } from '../../lib/matchFilters'
import { TelegramIcon } from '../icons/TelegramIcon'
import styles from './TelegramSummaryButton.module.css'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; count: number } | { kind: 'error'; message: string }

export function TelegramSummaryButton({
  date,
  matches,
  filteredMatches,
  filters,
}: {
  date: string
  matches: MatchWithJob[]
  filteredMatches: MatchWithJob[]
  filters: MatchFilterState
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function handleClick() {
    setStatus({ kind: 'sending' })
    try {
      const result = await apiClient.sendTelegramSummary({
        date,
        jobIds: filteredMatches.map((match) => match.jobId),
        filterSummary: describeActiveFilters(filters, matches),
      })
      setStatus({ kind: 'sent', count: result.matchCount })
      setTimeout(() => setStatus({ kind: 'idle' }), 5000)
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to send.' })
    }
  }

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        disabled={filteredMatches.length === 0 || status.kind === 'sending'}
      >
        <TelegramIcon />
        {status.kind === 'sending' ? 'Sending…' : "Send today's summary"}
      </button>

      {status.kind === 'sent' && (
        <span className={`${styles.status} ${styles.statusSent}`}>
          ✓ Sent {status.count} match{status.count === 1 ? '' : 'es'} to Telegram
        </span>
      )}
      {status.kind === 'error' && <span className={`${styles.status} ${styles.statusError}`}>{status.message}</span>}
    </div>
  )
}
