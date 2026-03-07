import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/medlemmer': 'Medlemmer',
  '/varsler': 'Varsler',
  '/innstillinger': 'Innstillinger',
};

export function Header() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? 'Medlemsvarsling';

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
