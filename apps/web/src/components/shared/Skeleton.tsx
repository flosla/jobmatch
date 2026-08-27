import styles from './Skeleton.module.css'

export function Skeleton({ height = '1rem', width = '100%' }: { height?: string; width?: string }) {
  return <div className={styles.block} style={{ height, width }} />
}
