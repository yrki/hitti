import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      <span className={styles.orgName}>{user?.organization.name}</span>
      <div className={styles.userSection}>
        <span className={styles.userName}>{user?.name}</span>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logg ut
        </button>
      </div>
    </header>
  );
}
