import type { StatCard as StatCardType } from '../types';
import styles from './StatCard.module.css';

interface Props {
  stat: StatCardType;
}

const trendIcons = { up: '↑', down: '↓', neutral: '→' } as const;

export function StatCard({ stat }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{stat.label}</span>
      <span className={styles.value}>
        {stat.value.toLocaleString('nb-NO')}
        {stat.trend && (
          <span className={`${styles.trend} ${styles[stat.trend]}`}>
            {trendIcons[stat.trend]}
          </span>
        )}
      </span>
    </div>
  );
}
