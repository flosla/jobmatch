import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { MatchFeedbackStatus, MatchWithJob } from '@jobmatch/shared'
import { apiClient } from '../../lib/apiClient'
import { ScoreBadge } from './ScoreBadge'
import styles from './JobPreviewCard.module.css'

export function JobPreviewCard({
  match,
  onFeedbackChange,
}: {
  match: MatchWithJob
  onFeedbackChange?: (jobId: string, feedback: MatchFeedbackStatus) => void
}) {
  const [feedback, setFeedback] = useState(match.feedback)
  const [pending, setPending] = useState(false)

  async function handleSetFeedback(e: React.MouseEvent, status: MatchFeedbackStatus) {
    e.preventDefault()
    e.stopPropagation()
    setPending(true)
    try {
      const next = feedback === status ? 'none' : status
      const result = await apiClient.setMatchFeedback(match.jobId, next)
      setFeedback(result.feedback)
      onFeedbackChange?.(match.jobId, result.feedback)
    } finally {
      setPending(false)
    }
  }

  return (
    <Link to="/matches/$jobId" params={{ jobId: match.jobId }} className={styles.card}>
      <div className={styles.top}>
        <div>
          <p className={styles.rank}>#{match.rank}</p>
          <h3 className={styles.title}>{match.job.title}</h3>
          <p className={styles.company}>
            {match.job.company} · {match.job.location}
          </p>
        </div>
        <ScoreBadge score={match.score} />
      </div>

      <div className={styles.meta}>
        <span className={styles.tag}>{match.job.workplaceType}</span>
        <span className={styles.tag}>{match.job.seniority}</span>
        {match.job.salaryRange && (
          <span className={styles.tag}>
            {match.job.salaryRange.currency} {Math.round(match.job.salaryRange.min / 1000)}k–
            {Math.round(match.job.salaryRange.max / 1000)}k
          </span>
        )}
      </div>

      <p className={styles.rationale}>{match.rationale}</p>

      <div className={styles.footer}>
        <div className={styles.feedbackRow}>
          <button
            type="button"
            className={`${styles.feedbackButton} ${feedback === 'saved' ? styles.feedbackButtonSaved : ''}`}
            disabled={pending}
            onClick={(e) => handleSetFeedback(e, 'saved')}
          >
            {feedback === 'saved' ? 'Saved ✓' : 'Save'}
          </button>
          <button
            type="button"
            className={`${styles.feedbackButton} ${feedback === 'dismissed' ? styles.feedbackButtonDismissed : ''}`}
            disabled={pending}
            onClick={(e) => handleSetFeedback(e, 'dismissed')}
          >
            {feedback === 'dismissed' ? 'Dismissed ✓' : 'Dismiss'}
          </button>
        </div>
        <span className={styles.openHint}>View details →</span>
      </div>
    </Link>
  )
}
