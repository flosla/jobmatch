import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { MatchFeedbackStatus } from '@jobmatch/shared'
import { apiClient } from '../../lib/apiClient'
import { JobPreviewCard } from '../../components/matches/JobPreviewCard'
import { MatchFilterBar } from '../../components/matches/MatchFilterBar'
import { TelegramSummaryButton } from '../../components/matches/TelegramSummaryButton'
import { Skeleton } from '../../components/shared/Skeleton'
import {
  applyFilters,
  computeSalaryBreakpoints,
  countByFeedback,
  createEmptyFilterState,
  type MatchFilterState,
} from '../../lib/matchFilters'
import styles from './index.module.css'

export const Route = createFileRoute('/matches/')({
  loader: () => apiClient.getTodayMatches(),
  pendingComponent: MatchesPending,
  component: MatchesPage,
})

function MatchesPage() {
  const { date, matches: loadedMatches } = Route.useLoaderData()
  const [matches, setMatches] = useState(loadedMatches)
  const [filters, setFilters] = useState<MatchFilterState>(createEmptyFilterState)

  function handleFeedbackChange(jobId: string, feedback: MatchFeedbackStatus) {
    setMatches((prev) => prev.map((m) => (m.jobId === jobId ? { ...m, feedback } : m)))
  }

  // All matches were already fetched once by the loader above. Everything
  // below is a pure client-side re-slice of that array -- no request is
  // made when the user changes a filter.
  const savedCount = useMemo(() => countByFeedback(matches, 'saved'), [matches])
  const dismissedCount = useMemo(() => countByFeedback(matches, 'dismissed'), [matches])
  const salaryBreakpoints = useMemo(() => computeSalaryBreakpoints(matches), [matches])
  const filteredMatches = useMemo(
    () => applyFilters(matches, filters, salaryBreakpoints),
    [matches, filters, salaryBreakpoints],
  )

  return (
    <main className="page">
      <div className="pageHeader">
        <h1>Today's top matches</h1>
        <p>
          Showing {filteredMatches.length} of {matches.length} jobs ranked for you on {date}, based on your
          profile and CV.
        </p>
      </div>

      <MatchFilterBar
        matches={matches}
        filters={filters}
        onChange={setFilters}
        savedCount={savedCount}
        dismissedCount={dismissedCount}
      />

      <TelegramSummaryButton date={date} matches={matches} filteredMatches={filteredMatches} filters={filters} />

      {filteredMatches.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No matches for the selected filters.</p>
          <button type="button" className={styles.emptyStateReset} onClick={() => setFilters(createEmptyFilterState())}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredMatches.map((match) => (
            <JobPreviewCard key={match.jobId} match={match} onFeedbackChange={handleFeedbackChange} />
          ))}
        </div>
      )}
    </main>
  )
}

function MatchesPending() {
  return (
    <main className="page">
      <div className="pageHeader">
        <h1>Today's top matches</h1>
      </div>
      <div className={styles.list}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="112px" />
        ))}
      </div>
    </main>
  )
}
