import { Link } from '@tanstack/react-router'
import type { MatchWithJob } from '@jobmatch/shared'
import { ScoreBadge } from './ScoreBadge'
import styles from './JobPreviewCard.module.css'

export function JobPreviewCard({ match }: { match: MatchWithJob }) {
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
    </Link>
  )
}
