import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ActivityDetailPage } from './ActivityDetailPage';
import type { Activity, Participant } from './types';
import { ParticipantStatus, InvitationChannel, NotificationStatus } from './types';

// ActivityMap bruker maplibre-gl — returnerer null
vi.mock('./components/ActivityMap', () => ({
  ActivityMap: () => null,
}));

// SendInvitationDialog — enkel stub med gjenkjennelig tekst
vi.mock('./components/SendInvitationDialog', () => ({
  SendInvitationDialog: ({ onClose }: { onClose: () => void; onSend: () => void; sending: boolean }) => (
    <div data-testid="send-invitation-dialog">
      <button onClick={onClose}>Lukk dialog</button>
    </div>
  ),
}));

vi.mock('./components/ParticipantList', () => ({
  ParticipantList: () => null,
}));

vi.mock('./services/activitiesApi', () => ({
  getActivity: vi.fn(),
  getParticipants: vi.fn(),
  sendInvitations: vi.fn(),
  resendInvitation: vi.fn(),
}));

vi.mock('../../shared/hooks/usePageTitle', () => ({ usePageTitle: vi.fn() }));

import { getActivity, getParticipants } from './services/activitiesApi';

const mockActivity: Activity = {
  id: 'test-id-789',
  title: 'Testaktivitet',
  description: '<p>Beskrivelse</p>',
  startTime: '2026-06-01T18:00:00.000Z',
  endTime: '2026-06-01T20:00:00.000Z',
  location: 'Hittihagen',
  contactName: 'Ola',
  contactEmail: 'ola@test.no',
  contactPhone: '12345678',
};

const mockParticipants: Participant[] = [
  {
    id: 'deltaker-1',
    memberId: 'member-1',
    memberName: 'Kari',
    memberEmail: 'kari@test.no',
    memberPhone: '87654321',
    status: ParticipantStatus.Accepted,
    invitationChannel: InvitationChannel.Email,
    notificationStatus: NotificationStatus.Sent,
    invitedAt: '2026-05-01T10:00:00Z',
    respondedAt: '2026-05-02T10:00:00Z',
    notificationSentAt: '2026-05-01T10:00:00Z',
    notificationFailedAt: null,
  },
];

function renderDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/aktiviteter/:id" element={<ActivityDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ActivityDetailPage — invite-query-parameter', () => {
  beforeEach(() => {
    vi.mocked(getActivity).mockResolvedValue(mockActivity);
    vi.mocked(getParticipants).mockResolvedValue(mockParticipants);
  });

  it('åpner SendInvitationDialog når URL inneholder invite=1', async () => {
    // Arrange — URL inneholder ?invite=1

    // Act
    renderDetail(`/aktiviteter/${mockActivity.id}?invite=1`);

    // Assert — dialogen rendres
    await waitFor(() =>
      expect(screen.getByTestId('send-invitation-dialog')).toBeInTheDocument()
    );
  });

  it('viser ikke SendInvitationDialog uten invite-parameter i URL', async () => {
    // Arrange — vanlig URL uten invite

    // Act
    renderDetail(`/aktiviteter/${mockActivity.id}`);

    // Assert — dialogen er ikke i DOM
    await waitFor(() =>
      expect(screen.queryByTestId('send-invitation-dialog')).not.toBeInTheDocument()
    );
  });

  it('viser aktivitetstittel etter lasting', async () => {
    // Arrange
    renderDetail(`/aktiviteter/${mockActivity.id}`);

    // Act + Assert
    expect(await screen.findByText(mockActivity.title)).toBeInTheDocument();
  });
});
