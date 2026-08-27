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
}: {
  matches: MatchWithJob[]
  filters: MatchFilterState
  onChange: (next: MatchFilterState) => void
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
      {isFilterActive(filters) && (
        <button type="button" className={styles.clearAll} onClick={() => onChange(createEmptyFilterState())}>
          Clear all
        </button>
      )}
    </div>
  )
}
