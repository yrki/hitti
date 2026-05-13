import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RsvpPage } from './RsvpPage';

function renderRsvp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/rsvp/:token" element={<RsvpPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const validResult = {
  activityTitle: 'Yogakveld',
  startTime: '2026-06-01T18:00:00Z',
  endTime: '2026-06-01T19:30:00Z',
  activityLocation: 'Hittihagen',
  accepted: true,
};

describe('RsvpPage', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should_show_invitation_details_when_token_and_response_are_valid', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResult),
    } as Response);

    // Act
    renderRsvp('/rsvp/abc123?svar=ja');

    // Assert
    expect(await screen.findByText(/Du er påmeldt/i)).toBeInTheDocument();
    expect(screen.getByText(/Yogakveld/)).toBeInTheDocument();
    expect(screen.getByText(/Hittihagen/)).toBeInTheDocument();
  });

  it('should_show_error_message_when_api_returns_404', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Invitasjon finnes ikke' }),
    } as Response);

    // Act
    renderRsvp('/rsvp/feiltoken?svar=ja');

    // Assert
    expect(await screen.findByText(/Invitasjon finnes ikke/i)).toBeInTheDocument();
    expect(screen.getByText(/Oops!/)).toBeInTheDocument();
  });

  it('should_show_confirmation_after_clicking_Ja', async () => {
    // Arrange: ingen ?svar => komponenten viser knapper.
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...validResult, accepted: true }),
    } as Response);
    renderRsvp('/rsvp/abc123');
    const yesButton = await screen.findByRole('button', { name: /Ja, jeg blir med/i });

    // Act
    await userEvent.click(yesButton);

    // Assert
    await waitFor(() => expect(screen.getByText(/Du er påmeldt/i)).toBeInTheDocument());
  });

  it('should_show_decline_confirmation_after_clicking_Nei', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...validResult, accepted: false }),
    } as Response);
    renderRsvp('/rsvp/abc123');
    const noButton = await screen.findByRole('button', { name: /Nei, jeg kan ikke/i });

    // Act
    await userEvent.click(noButton);

    // Assert
    await waitFor(() => expect(screen.getByText(/Svar registrert/i)).toBeInTheDocument());
  });
});
