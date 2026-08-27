import type { MatchFeedbackStatus, MatchWithJob, SeniorityLevel, WorkplaceType } from '@jobmatch/shared'

/**
 * Pure, dependency-free client-side filtering for the matches list.
 * Everything here operates on the already-loaded match array -- filter
 * options and boundaries are derived from that data, and applying a
 * filter never triggers a network request.
 */

export type MatchTier = 'medium' | 'high' | 'top'
export type SalaryQuartile = '1' | '2' | '3' | '4'

export interface FilterOption<T extends string> {
  value: T
  label: string
  count: number
}

export interface MatchFilterState {
  salaryQuartile: Set<SalaryQuartile>
  seniority: Set<SeniorityLevel>
  workplaceType: Set<WorkplaceType>
  matchTier: Set<MatchTier>
  /** When true, only 'saved' matches are shown -- a genuine narrowing filter. */
  savedOnly: boolean
  /** When false (default), 'dismissed' matches are hidden -- a reveal toggle, not a narrowing filter. */
  showDismissed: boolean
}

export function createEmptyFilterState(): MatchFilterState {
  return {
    salaryQuartile: new Set(),
    seniority: new Set(),
    workplaceType: new Set(),
    matchTier: new Set(),
    savedOnly: false,
    showDismissed: false,
  }
}

export function isFilterActive(filters: MatchFilterState): boolean {
  return (
    filters.salaryQuartile.size > 0 ||
    filters.seniority.size > 0 ||
    filters.workplaceType.size > 0 ||
    filters.matchTier.size > 0 ||
    filters.savedOnly
  )
}

export function activeFilterCount(filters: MatchFilterState): number {
  return (
    filters.salaryQuartile.size +
    filters.seniority.size +
    filters.workplaceType.size +
    filters.matchTier.size +
    (filters.savedOnly ? 1 : 0)
  )
}

export function countByFeedback(matches: MatchWithJob[], status: MatchFeedbackStatus): number {
  return matches.filter((m) => m.feedback === status).length
}

// --- Match tier (score) --------------------------------------------------

export function matchTierOf(score: number): MatchTier | null {
  const pct = score * 100
  if (pct >= 90) return 'top'
  if (pct >= 80) return 'high'
  if (pct >= 70) return 'medium'
  return null
}

const MATCH_TIER_ORDER: MatchTier[] = ['top', 'high', 'medium']
const MATCH_TIER_LABEL: Record<MatchTier, string> = {
  top: 'Top (90–100%)',
  high: 'High (80–90%)',
  medium: 'Medium (70–80%)',
}

export function buildMatchTierOptions(matches: MatchWithJob[]): FilterOption<MatchTier>[] {
  const counts = new Map<MatchTier, number>()
  for (const match of matches) {
    const tier = matchTierOf(match.score)
    if (tier) counts.set(tier, (counts.get(tier) ?? 0) + 1)
  }
  return MATCH_TIER_ORDER.filter((tier) => counts.has(tier)).map((tier) => ({
    value: tier,
    label: MATCH_TIER_LABEL[tier],
    count: counts.get(tier)!,
  }))
}

// --- Seniority -------------------------------------------------------------

const SENIORITY_ORDER: SeniorityLevel[] = ['junior', 'mid', 'senior', 'staff']
const SENIORITY_LABEL: Record<SeniorityLevel, string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
}

export function buildSeniorityOptions(matches: MatchWithJob[]): FilterOption<SeniorityLevel>[] {
  const counts = new Map<SeniorityLevel, number>()
  for (const match of matches) {
    counts.set(match.job.seniority, (counts.get(match.job.seniority) ?? 0) + 1)
  }
  return SENIORITY_ORDER.filter((level) => counts.has(level)).map((level) => ({
    value: level,
    label: SENIORITY_LABEL[level],
    count: counts.get(level)!,
  }))
}

// --- Work model --------------------------------------------------------------

const WORKPLACE_ORDER: WorkplaceType[] = ['remote', 'hybrid', 'onsite']
const WORKPLACE_LABEL: Record<WorkplaceType, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
}

export function buildWorkplaceOptions(matches: MatchWithJob[]): FilterOption<WorkplaceType>[] {
  const counts = new Map<WorkplaceType, number>()
  for (const match of matches) {
    counts.set(match.job.workplaceType, (counts.get(match.job.workplaceType) ?? 0) + 1)
  }
  return WORKPLACE_ORDER.filter((type) => counts.has(type)).map((type) => ({
    value: type,
    label: WORKPLACE_LABEL[type],
    count: counts.get(type)!,
  }))
}

// --- Salary quartiles --------------------------------------------------------

function salaryMidpoint(match: MatchWithJob): number | null {
  const range = match.job.salaryRange
  return range ? (range.min + range.max) / 2 : null
}

/** Linear-interpolation percentile (matches the common "numpy default" method). */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 1) return sortedValues[0]!
  const idx = (p / 100) * (sortedValues.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sortedValues[lower]!
  const weight = idx - lower
  return sortedValues[lower]! * (1 - weight) + sortedValues[upper]! * weight
}

interface SalaryBreakpoints {
  q1: number
  q2: number
  q3: number
}

export function computeSalaryBreakpoints(matches: MatchWithJob[]): SalaryBreakpoints | null {
  const values = matches
    .map(salaryMidpoint)
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b)
  if (values.length === 0) return null
  return { q1: percentile(values, 25), q2: percentile(values, 50), q3: percentile(values, 75) }
}

export function salaryQuartileOf(match: MatchWithJob, breakpoints: SalaryBreakpoints | null): SalaryQuartile | null {
  const mid = salaryMidpoint(match)
  if (mid == null || !breakpoints) return null
  if (mid <= breakpoints.q1) return '1'
  if (mid <= breakpoints.q2) return '2'
  if (mid <= breakpoints.q3) return '3'
  return '4'
}

function formatK(value: number): string {
  return `$${Math.round(value / 1000)}k`
}

const SALARY_QUARTILE_ORDER: SalaryQuartile[] = ['1', '2', '3', '4']
const SALARY_QUARTILE_NAME: Record<SalaryQuartile, string> = {
  '1': 'Q1 · Lowest',
  '2': 'Q2',
  '3': 'Q3',
  '4': 'Q4 · Highest',
}

export function buildSalaryQuartileOptions(matches: MatchWithJob[]): FilterOption<SalaryQuartile>[] {
  const breakpoints = computeSalaryBreakpoints(matches)
  if (!breakpoints) return []

  const bucketValues = new Map<SalaryQuartile, number[]>()
  for (const match of matches) {
    const quartile = salaryQuartileOf(match, breakpoints)
    const mid = salaryMidpoint(match)
    if (quartile && mid != null) {
      const bucket = bucketValues.get(quartile) ?? []
      bucket.push(mid)
      bucketValues.set(quartile, bucket)
    }
  }

  return SALARY_QUARTILE_ORDER.filter((q) => (bucketValues.get(q)?.length ?? 0) > 0).map((quartile) => {
    const values = bucketValues.get(quartile)!
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const range = lo === hi ? formatK(lo) : `${formatK(lo)}–${formatK(hi)}`
    return { value: quartile, label: `${SALARY_QUARTILE_NAME[quartile]} (${range})`, count: values.length }
  })
}

// --- Human-readable summary of active filters ---------------------------------

/**
 * Builds a "Category: Label, Label · Category: Label" summary of the
 * currently active filters, reusing the same option-label builders the
 * dropdowns render from -- so the wording always matches what's on screen.
 * Used for the Telegram summary message. `matches` should be the full
 * (unfiltered) list, matching what the dropdown options were built from.
 */
export function describeActiveFilters(filters: MatchFilterState, matches: MatchWithJob[]): string | null {
  if (!isFilterActive(filters)) return null

  const parts: string[] = []

  const salaryLabels = buildSalaryQuartileOptions(matches)
    .filter((opt) => filters.salaryQuartile.has(opt.value))
    .map((opt) => opt.label)
  if (salaryLabels.length > 0) parts.push(`Salary: ${salaryLabels.join(', ')}`)

  const seniorityLabels = buildSeniorityOptions(matches)
    .filter((opt) => filters.seniority.has(opt.value))
    .map((opt) => opt.label)
  if (seniorityLabels.length > 0) parts.push(`Experience: ${seniorityLabels.join(', ')}`)

  const workplaceLabels = buildWorkplaceOptions(matches)
    .filter((opt) => filters.workplaceType.has(opt.value))
    .map((opt) => opt.label)
  if (workplaceLabels.length > 0) parts.push(`Work model: ${workplaceLabels.join(', ')}`)

  const matchTierLabels = buildMatchTierOptions(matches)
    .filter((opt) => filters.matchTier.has(opt.value))
    .map((opt) => opt.label)
  if (matchTierLabels.length > 0) parts.push(`Match: ${matchTierLabels.join(', ')}`)

  if (filters.savedOnly) parts.push('Saved only')

  return parts.length > 0 ? parts.join(' · ') : null
}

// --- Applying the combined filter state ---------------------------------------

export function applyFilters(
  matches: MatchWithJob[],
  filters: MatchFilterState,
  salaryBreakpoints: SalaryBreakpoints | null,
): MatchWithJob[] {
  return matches.filter((match) => {
    if (!filters.showDismissed && match.feedback === 'dismissed') return false
    if (filters.savedOnly && match.feedback !== 'saved') return false

    if (filters.seniority.size > 0 && !filters.seniority.has(match.job.seniority)) return false
    if (filters.workplaceType.size > 0 && !filters.workplaceType.has(match.job.workplaceType)) return false

    if (filters.matchTier.size > 0) {
      const tier = matchTierOf(match.score)
      if (!tier || !filters.matchTier.has(tier)) return false
    }

    if (filters.salaryQuartile.size > 0) {
      const quartile = salaryQuartileOf(match, salaryBreakpoints)
      if (!quartile || !filters.salaryQuartile.has(quartile)) return false
    }

    return true
  })
}
