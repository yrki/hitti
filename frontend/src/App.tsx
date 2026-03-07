import { Routes, Route } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { ProtectedRoute } from './shared/auth/ProtectedRoute';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth';
import { DashboardPage } from './features/dashboard';
import { MembersPage, MemberFormPage } from './features/members';
import { ActivitiesPage, ActivityFormPage, ActivityDetailPage, RsvpPage } from './features/activities';
import { SettingsPage } from './features/settings';

export function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="registrer" element={<RegisterPage />} />
      <Route path="glemt-passord" element={<ForgotPasswordPage />} />
      <Route path="tilbakestill-passord" element={<ResetPasswordPage />} />
      <Route path="svar/:token" element={<RsvpPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="medlemmer" element={<MembersPage />} />
        <Route path="medlemmer/ny" element={<MemberFormPage />} />
        <Route path="medlemmer/:id/rediger" element={<MemberFormPage />} />
        <Route path="aktiviteter" element={<ActivitiesPage />} />
        <Route path="aktiviteter/ny" element={<ActivityFormPage />} />
        <Route path="aktiviteter/:id" element={<ActivityDetailPage />} />
        <Route path="aktiviteter/:id/rediger" element={<ActivityFormPage />} />
        <Route path="innstillinger" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
