import { NavLink } from 'react-router-dom';
import hittiLogo from '../../assets/hitti-logo.svg';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/medlemmer', label: 'Medlemmer', icon: '♟' },
  { to: '/aktiviteter', label: 'Aktiviteter', icon: '◉' },
  { to: '/innstillinger', label: 'Innstillinger', icon: '⚙' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={hittiLogo} alt="hitti" className={styles.logoImage} />
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
