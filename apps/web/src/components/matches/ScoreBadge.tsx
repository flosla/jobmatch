import styles from './ScoreBadge.module.css'

export function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const tier = pct >= 75 ? 'strong' : pct >= 50 ? 'solid' : 'partial'
  return <span className={`${styles.badge} ${styles[tier]}`}>{pct}% match</span>
}
