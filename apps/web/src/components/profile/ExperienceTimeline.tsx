import type { Experience } from '@jobmatch/shared'
import styles from './ExperienceTimeline.module.css'

function formatDate(iso: string | null): string {
  if (!iso) return 'Present'
  const [year, month] = iso.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ExperienceTimeline({ experience }: { experience: Experience[] }) {
  return (
    <section className={styles.card}>
      <h2>Experience</h2>
      {experience.map((entry) => (
        <div className={styles.entry} key={`${entry.company}-${entry.startDate}`}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>{entry.title}</span>
            <span className={styles.entryDates}>
              {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
            </span>
          </div>
          <p className={styles.entryCompany}>
            {entry.company} · {entry.location}
          </p>
          <ul className={styles.highlights}>
            {entry.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
