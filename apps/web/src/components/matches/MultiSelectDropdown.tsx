import { useEffect, useRef, useState } from 'react'
import type { FilterOption } from '../../lib/matchFilters'
import styles from './MultiSelectDropdown.module.css'

export function MultiSelectDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: FilterOption<T>[]
  selected: Set<T>
  onChange: (next: Set<T>) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggleValue(value: T) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  return (
    <div className={styles.dropdown} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${selected.size > 0 ? styles.triggerActive : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {label}
        {selected.size > 0 && <span className={styles.badge}>{selected.size}</span>}
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {options.length === 0 ? (
            <p className={styles.empty}>No options available</p>
          ) : (
            options.map((option) => (
              <label className={styles.option} key={option.value}>
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  onChange={() => toggleValue(option.value)}
                />
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.count}>{option.count}</span>
              </label>
            ))
          )}
          {selected.size > 0 && (
            <button type="button" className={styles.clearButton} onClick={() => onChange(new Set())}>
              Clear {label.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
