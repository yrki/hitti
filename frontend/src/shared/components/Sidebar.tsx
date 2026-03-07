import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/medlemmer', label: 'Medlemmer', icon: '👥' },
  { to: '/aktiviteter', label: 'Aktiviteter', icon: '📅' },
  { to: '/innstillinger', label: 'Innstillinger', icon: '⚙️' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>{user?.organization.name ?? 'Medlemsvarsling'}</h2>
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
      <div className={styles.footer}>
        <button className={styles.footerButton} onClick={handleLogout}>
          Logg ut
        </button>
      </div>
    </aside>
  );
}
