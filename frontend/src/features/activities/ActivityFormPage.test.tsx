import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ActivityFormPage } from './ActivityFormPage';
import type { Activity, CreateActivityRequest } from './types';

// Mock ActivityForm slik at vi kontrollerer hva onSubmit kalles med
vi.mock('./components/ActivityForm', () => ({
  ActivityForm: ({
    activity,
    onSubmit,
    onCancel,
  }: {
    activity?: Activity;
    onSubmit: (data: CreateActivityRequest, sendInvitations: boolean) => void;
    onCancel: () => void;
  }) => (
    <div>
      <span data-testid="activity-id">{activity?.id ?? 'ingen'}</span>
      <button
        onClick={() =>
          onSubmit(
            { title: 'Test', description: '', startTime: '', endTime: '', location: '', contactName: '', contactEmail: '', contactPhone: '' },
            false
          )
        }
      >
        submit-save
      </button>
      <button
        onClick={() =>
          onSubmit(
            { title: 'Test', description: '', startTime: '', endTime: '', location: '', contactName: '', contactEmail: '', contactPhone: '' },
            true
          )
        }
      >
        submit-invite
      </button>
      <button onClick={onCancel}>cancel</button>
    </div>
  ),
}));

vi.mock('./services/activitiesApi', () => ({
  getActivity: vi.fn(),
  createActivity: vi.fn(),
  updateActivity: vi.fn(),
}));

vi.mock('../../shared/hooks/usePageTitle', () => ({ usePageTitle: vi.fn() }));

import { createActivity, updateActivity, getActivity } from './services/activitiesApi';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createdActivity: Activity = {
  id: 'ny-id-456',
  title: 'Test',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

const existingActivity: Activity = {
  id: 'gammel-id-123',
  title: 'Gammel',
  description: '',
  startTime: '2026-06-01T18:00:00.000Z',
  endTime: '2026-06-01T20:00:00.000Z',
  location: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

function renderNew() {
  return render(
    <MemoryRouter initialEntries={['/aktiviteter/ny']}>
      <Routes>
        <Route path="/aktiviteter/ny" element={<ActivityFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEdit(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/aktiviteter/${id}/rediger`]}>
      <Routes>
        <Route path="/aktiviteter/:id/rediger" element={<ActivityFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ActivityFormPage — ny aktivitet', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(createActivity).mockResolvedValue(createdActivity);
  });

  it('navigerer til aktivitet uten query-param når lagre velges', async () => {
    // Arrange
    renderNew();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'submit-save' }));

    // Assert
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/aktiviteter/${createdActivity.id}`)
    );
  });

  it('navigerer til aktivitet med invite=1 når send invitasjoner velges', async () => {
    // Arrange
    renderNew();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'submit-invite' }));

    // Assert
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/aktiviteter/${createdActivity.id}?invite=1`)
    );
  });
});

describe('ActivityFormPage — eksisterende aktivitet', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(getActivity).mockResolvedValue(existingActivity);
    vi.mocked(updateActivity).mockResolvedValue(existingActivity);
  });

  it('navigerer med invite=1 etter oppdatering når invitasjoner skal sendes', async () => {
    // Arrange
    renderEdit(existingActivity.id);
    await screen.findByTestId('activity-id');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'submit-invite' }));

    // Assert
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/aktiviteter/${existingActivity.id}?invite=1`)
    );
  });

  it('navigerer uten invite-param etter oppdatering når bare lagring velges', async () => {
    // Arrange
    renderEdit(existingActivity.id);
    await screen.findByTestId('activity-id');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'submit-save' }));

    // Assert
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/aktiviteter/${existingActivity.id}`)
    );
  });
});
