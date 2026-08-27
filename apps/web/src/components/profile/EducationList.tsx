import type { Education } from '@jobmatch/shared'
import styles from './EducationList.module.css'

export function EducationList({ education }: { education: Education[] }) {
  return (
    <section className={styles.card}>
      <h2>Education</h2>
      {education.map((entry) => (
        <div className={styles.entry} key={`${entry.institution}-${entry.startYear}`}>
          <span className={styles.entryMain}>
            <span className={styles.entryDegree}>
              {entry.degree} {entry.field}
            </span>
            <br />
            <span className={styles.entryInstitution}>{entry.institution}</span>
          </span>
          <span className={styles.entryYears}>
            {entry.startYear}–{entry.endYear}
          </span>
        </div>
      ))}
    </section>
  )
}
