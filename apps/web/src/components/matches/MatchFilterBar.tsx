import { useMemo } from 'react'
import type { MatchWithJob } from '@jobmatch/shared'
import {
  buildMatchTierOptions,
  buildSalaryQuartileOptions,
  buildSeniorityOptions,
  buildWorkplaceOptions,
  createEmptyFilterState,
  isFilterActive,
  type MatchFilterState,
} from '../../lib/matchFilters'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import styles from './MatchFilterBar.module.css'

/**
 * All filter options are derived from the currently loaded `matches` array
 * (already fetched once, up front) -- selecting a filter only re-slices
 * that in-memory array. No request is made when filters change.
 */
export function MatchFilterBar({
  matches,
  filters,
  onChange,
  savedCount,
  dismissedCount,
}: {
  matches: MatchWithJob[]
  filters: MatchFilterState
  onChange: (next: MatchFilterState) => void
  savedCount: number
  dismissedCount: number
}) {
  const salaryOptions = useMemo(() => buildSalaryQuartileOptions(matches), [matches])
  const seniorityOptions = useMemo(() => buildSeniorityOptions(matches), [matches])
  const workplaceOptions = useMemo(() => buildWorkplaceOptions(matches), [matches])
  const matchTierOptions = useMemo(() => buildMatchTierOptions(matches), [matches])

  return (
    <div className={styles.bar}>
      <MultiSelectDropdown
        label="Salary"
        options={salaryOptions}
        selected={filters.salaryQuartile}
        onChange={(next) => onChange({ ...filters, salaryQuartile: next })}
      />
      <MultiSelectDropdown
        label="Experience"
        options={seniorityOptions}
        selected={filters.seniority}
        onChange={(next) => onChange({ ...filters, seniority: next })}
      />
      <MultiSelectDropdown
        label="Work model"
        options={workplaceOptions}
        selected={filters.workplaceType}
        onChange={(next) => onChange({ ...filters, workplaceType: next })}
      />
      <MultiSelectDropdown
        label="Match"
        options={matchTierOptions}
        selected={filters.matchTier}
        onChange={(next) => onChange({ ...filters, matchTier: next })}
      />
      <button
        type="button"
        className={`${styles.togglePill} ${filters.savedOnly ? styles.togglePillActive : ''}`}
        onClick={() => onChange({ ...filters, savedOnly: !filters.savedOnly })}
      >
        Saved{savedCount > 0 ? ` (${savedCount})` : ''}
      </button>
      {/* Always mounted (not conditionally rendered on dismissedCount) so its column never
          appears/disappears and shifts every control after it -- only its enabled state and
          label change as dismissedCount updates. */}
      <button
        type="button"
        disabled={dismissedCount === 0}
        className={`${styles.togglePill} ${filters.showDismissed ? styles.togglePillActive : ''}`}
        onClick={() => onChange({ ...filters, showDismissed: !filters.showDismissed })}
      >
        {filters.showDismissed ? 'Hide dismissed' : dismissedCount > 0 ? `Show dismissed (${dismissedCount})` : 'Show dismissed'}
      </button>
      {/* Same reasoning: always mounted, hidden (not unmounted) when there's nothing to clear,
          so its column keeps reserving space instead of collapsing the row. */}
      <button
        type="button"
        className={styles.clearAll}
        style={{ visibility: isFilterActive(filters) ? 'visible' : 'hidden' }}
        onClick={() => onChange(createEmptyFilterState())}
      >
        Clear all
      </button>
    </div>
  )
}
