import { Link } from '@tanstack/react-router'
import styles from './Nav.module.css'

export function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/matches" className={styles.brand}>
          JobMatch
        </Link>
        <div className={styles.links}>
          <Link
            to="/matches"
            className={styles.link}
            activeProps={{ className: `${styles.link} ${styles.linkActive}` }}
          >
            Matches
          </Link>
          <Link
            to="/profile"
            className={styles.link}
            activeProps={{ className: `${styles.link} ${styles.linkActive}` }}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}
