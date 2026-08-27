import styles from './SkillsChips.module.css'

export function SkillsChips({ skills }: { skills: string[] }) {
  return (
    <section className={styles.card}>
      <h2>Skills</h2>
      <div className={styles.chips}>
        {skills.map((skill) => (
          <span className={styles.chip} key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </section>
  )
}
