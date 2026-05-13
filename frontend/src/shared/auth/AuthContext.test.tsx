import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { setAuthToken } from '../api';

function TestConsumer() {
  const { user, isLoading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'idle'}</span>
      <span data-testid="user">{user ? user.name : 'anonymous'}</span>
      <button onClick={logout}>logg ut</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>
  );
}

const validUser = {
  id: 'u1',
  name: 'Børre',
  email: 'borre@hitti.no',
  phone: '12345678',
  role: 'Owner',
  organization: { id: 'o1', name: 'Hitti', email: 'org@hitti.no', phone: '00000000' },
};

describe('AuthContext', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should_have_loading_true_initially_when_token_exists', async () => {
    // Arrange
    setAuthToken('valid-token');
    let resolveFetch: (value: Response) => void = () => {};
    vi.mocked(globalThis.fetch).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      })
    );

    // Act
    renderWithProvider();

    // Assert
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    // Cleanup pending promise so React doesn't complain
    await act(async () => {
      resolveFetch({ ok: true, json: () => Promise.resolve(validUser) } as Response);
    });
  });

  it('should_set_user_and_stop_loading_after_successful_auth_me', async () => {
    // Arrange
    setAuthToken('valid-token');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validUser),
    } as Response);

    // Act
    renderWithProvider();

    // Assert
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));
    expect(screen.getByTestId('user')).toHaveTextContent('Børre');
  });

  it('should_set_user_to_null_when_auth_me_returns_401', async () => {
    // Arrange
    setAuthToken('expired-token');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve(null),
    } as Response);

    // Act
    renderWithProvider();

    // Assert
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));
    expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should_clear_localStorage_and_reset_user_on_logout', async () => {
    // Arrange
    setAuthToken('valid-token');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validUser),
    } as Response);
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Børre'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: /logg ut/i }));

    // Assert
    expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
