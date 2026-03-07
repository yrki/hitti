import { Routes, Route } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { DashboardPage } from './features/dashboard';
import { MembersPage, MemberFormPage } from './features/members';
import { ActivitiesPage, ActivityFormPage } from './features/activities';
import { NotificationsPage } from './features/notifications';
import { SettingsPage } from './features/settings';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="medlemmer" element={<MembersPage />} />
        <Route path="medlemmer/ny" element={<MemberFormPage />} />
        <Route path="medlemmer/:id/rediger" element={<MemberFormPage />} />
        <Route path="aktiviteter" element={<ActivitiesPage />} />
        <Route path="aktiviteter/ny" element={<ActivityFormPage />} />
        <Route path="aktiviteter/:id/rediger" element={<ActivityFormPage />} />
        <Route path="varsler" element={<NotificationsPage />} />
        <Route path="innstillinger" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
