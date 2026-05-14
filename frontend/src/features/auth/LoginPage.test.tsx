import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../../shared/auth/AuthContext';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const loginUser = {
  id: 'u1',
  name: 'Børre',
  email: 'borre@hitti.no',
  phone: '12345678',
  role: 'Owner',
  organization: { id: 'o1', name: 'Hitti', email: 'org@hitti.no', phone: '00000000' },
};

describe('LoginPage', () => {
  beforeEach(() => {
    // AuthProvider boot fetch: no token -> isLoading goes false without hitting fetch.
    // But ensure no stray token from leaked tests.
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('viser e-post- og passordfelter ved innlasting', async () => {
    // Arrange
    renderLogin();

    // Act
    const emailField = await screen.findByLabelText(/E-postadresse/i);
    const passwordField = await screen.findByLabelText(/Passord/i);

    // Assert
    expect(emailField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
  });

  it('kaller ikke API når feltene er tomme', async () => {
    // Arrange
    renderLogin();
    const submit = await screen.findByRole('button', { name: /Logg inn/i });

    // Act
    await userEvent.click(submit);

    // Assert
    // Browser's native required-validation prevents the submit handler from running,
    // so fetch is never called. (Belt-and-braces: handler also validates.)
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('videresender til forsiden etter vellykket innlogging', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'new-token', user: loginUser }),
    } as Response);
    renderLogin();
    await userEvent.type(await screen.findByLabelText(/E-postadresse/i), 'borre@hitti.no');
    await userEvent.type(screen.getByLabelText(/Passord/i), 'hemmelig123');

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Logg inn/i }));

    // Assert
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
    expect(localStorage.getItem('auth_token')).toBe('new-token');
  });

  it('viser feilmelding når innlogging mislykkes', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Feil brukernavn eller passord' }),
    } as Response);
    renderLogin();
    await userEvent.type(await screen.findByLabelText(/E-postadresse/i), 'feil@hitti.no');
    await userEvent.type(screen.getByLabelText(/Passord/i), 'feilpassord');

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Logg inn/i }));

    // Assert
    expect(await screen.findByText(/Feil brukernavn eller passord/i)).toBeInTheDocument();
  });
});
