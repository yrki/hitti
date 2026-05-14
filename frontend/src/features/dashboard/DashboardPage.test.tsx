import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

vi.mock('../../shared/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../../shared/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const activity = {
  id: '1',
  title: 'Pilates på stranda',
  startTime: '2026-06-15T09:00:00Z',
  endTime: '2026-06-15T10:00:00Z',
  location: 'Hittistrand',
  acceptedCount: 5,
  declinedCount: 1,
  invitedCount: 10,
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('viser tom-tilstand når API returnerer tom liste', async () => {
    // Arrange
    vi.mocked(apiFetch).mockResolvedValueOnce([]);

    // Act
    renderDashboard();

    // Assert
    expect(await screen.findByText('Her var det tomt!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opprett aktivitet' })).toBeInTheDocument();
  });

  it('navigerer til ny aktivitet ved klikk på opprett-knappen i tom-tilstand', async () => {
    // Arrange
    vi.mocked(apiFetch).mockResolvedValueOnce([]);
    renderDashboard();
    const button = await screen.findByRole('button', { name: 'Opprett aktivitet' });

    // Act
    await userEvent.click(button);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/aktiviteter/ny');
  });

  it('viser overskrift og ny-aktivitet-knapp når aktiviteter finnes', async () => {
    // Arrange
    vi.mocked(apiFetch).mockResolvedValueOnce([activity]);

    // Act
    renderDashboard();

    // Assert
    expect(await screen.findByText('Kommende aktiviteter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Ny aktivitet' })).toBeInTheDocument();
  });

  it('navigerer til ny aktivitet ved klikk på ny-aktivitet-knappen', async () => {
    // Arrange
    vi.mocked(apiFetch).mockResolvedValueOnce([activity]);
    renderDashboard();
    const button = await screen.findByRole('button', { name: '+ Ny aktivitet' });

    // Act
    await userEvent.click(button);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/aktiviteter/ny');
  });

  it('viser ladetekst mens API-kallet pågår', () => {
    // Arrange
    vi.mocked(apiFetch).mockReturnValueOnce(new Promise(() => {}));

    // Act
    renderDashboard();

    // Assert
    expect(screen.getByText('Laster...')).toBeInTheDocument();
  });

  it('viser ikke tom-tilstand mens siden laster', () => {
    // Arrange
    vi.mocked(apiFetch).mockReturnValueOnce(new Promise(() => {}));

    // Act
    renderDashboard();

    // Assert
    expect(screen.queryByText('Her var det tomt!')).not.toBeInTheDocument();
  });

  it('viser aktivitetstittelen i tabellen når aktiviteter finnes', async () => {
    // Arrange
    vi.mocked(apiFetch).mockResolvedValueOnce([activity]);

    // Act
    renderDashboard();

    // Assert
    expect(await screen.findByText('Pilates på stranda')).toBeInTheDocument();
  });

  it('viser tom-tilstand når API-kallet feiler', async () => {
    // Arrange
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('nettverksfeil'));

    // Act
    renderDashboard();

    // Assert
    await waitFor(() =>
      expect(screen.getByText('Her var det tomt!')).toBeInTheDocument()
    );
  });
});
