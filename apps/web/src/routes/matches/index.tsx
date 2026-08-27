import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { apiClient } from '../../lib/apiClient'
import { JobPreviewCard } from '../../components/matches/JobPreviewCard'
import { MatchFilterBar } from '../../components/matches/MatchFilterBar'
import { TelegramSummaryButton } from '../../components/matches/TelegramSummaryButton'
import { Skeleton } from '../../components/shared/Skeleton'
import { applyFilters, computeSalaryBreakpoints, createEmptyFilterState, type MatchFilterState } from '../../lib/matchFilters'
import styles from './index.module.css'

export const Route = createFileRoute('/matches/')({
  loader: () => apiClient.getTodayMatches(),
  pendingComponent: MatchesPending,
  component: MatchesPage,
})

function MatchesPage() {
  const { date, matches } = Route.useLoaderData()
  const [filters, setFilters] = useState<MatchFilterState>(createEmptyFilterState)

  // All matches were already fetched once by the loader above. Everything
  // below is a pure client-side re-slice of that array -- no request is
  // made when the user changes a filter.
  const salaryBreakpoints = useMemo(() => computeSalaryBreakpoints(matches), [matches])
  const filteredMatches = useMemo(
    () => applyFilters(matches, filters, salaryBreakpoints),
    [matches, filters, salaryBreakpoints],
  )

  return (
    <main className="page">
      <div className={styles.headerRow}>
        <div className="pageHeader">
          <h1>Today's top matches</h1>
          <p>
            Showing {filteredMatches.length} of {matches.length} jobs ranked for you on {date}, based on your
            profile and CV.
          </p>
        </div>
        <MatchFilterBar matches={matches} filters={filters} onChange={setFilters} />
      </div>

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
            <JobPreviewCard key={match.jobId} match={match} />
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
