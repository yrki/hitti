import { StatCard } from './components/StatCard';
import type { StatCard as StatCardType } from './types';
import styles from './DashboardPage.module.css';

const stats: StatCardType[] = [
  { label: 'Totalt antall medlemmer', value: 1243, trend: 'up' },
  { label: 'Aktive varsler', value: 18, trend: 'neutral' },
  { label: 'Sendte varsler denne uken', value: 342, trend: 'up' },
  { label: 'Uleste varsler', value: 7, trend: 'down' },
];

export function DashboardPage() {
  return (
    <div>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}
