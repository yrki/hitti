import { Routes, Route } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { DashboardPage } from './features/dashboard';
import { MembersPage } from './features/members';
import { NotificationsPage } from './features/notifications';
import { SettingsPage } from './features/settings';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="medlemmer" element={<MembersPage />} />
        <Route path="varsler" element={<NotificationsPage />} />
        <Route path="innstillinger" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
