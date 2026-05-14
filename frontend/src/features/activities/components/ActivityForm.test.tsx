import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityForm } from './ActivityForm';
import type { Activity } from '../types';

// ReactQuill bruker nettleser-API-er som ikke finnes i jsdom
vi.mock('react-quill-new', () => ({
  default: (props: { value: string; onChange: (v: string) => void }) => (
    <textarea value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}));

// LocationPicker bruker maplibre-gl — returnerer null i tester
vi.mock('./LocationPicker', () => ({
  LocationPicker: () => null,
}));

// CSS-import fra react-quill-new
vi.mock('react-quill-new/dist/quill.snow.css', () => ({}));

const existingActivity: Activity = {
  id: 'abc-123',
  title: 'Gammel aktivitet',
  description: '',
  startTime: '2026-06-01T18:00:00.000Z',
  endTime: '2026-06-01T20:00:00.000Z',
  location: 'Gymsalen',
  contactName: 'Kari',
  contactEmail: 'kari@test.no',
  contactPhone: '87654321',
};

describe('ActivityForm — ny aktivitet (ingen activity-prop)', () => {
  it('viser opprett-aktivitet-knapp når ingen aktivitet er satt', () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Act
    render(<ActivityForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Assert
    expect(screen.getByRole('button', { name: /^opprett aktivitet$/i })).toBeInTheDocument();
  });

  it('viser opprett-og-send-knapp når ingen aktivitet er satt', () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Act
    render(<ActivityForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Assert
    expect(screen.getByRole('button', { name: /opprett og send invitasjoner/i })).toBeInTheDocument();
  });

  it('viser ny-aktivitet-overskrift når ingen aktivitet er satt', () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Act
    render(<ActivityForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Assert
    expect(screen.getByRole('heading', { name: /ny aktivitet/i })).toBeInTheDocument();
  });
});

describe('ActivityForm — eksisterende aktivitet (activity-prop satt)', () => {
  it('viser oppdater-aktivitet-knapp når aktivitet er satt', () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Act
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Assert
    expect(screen.getByRole('button', { name: /^oppdater aktivitet$/i })).toBeInTheDocument();
  });

  it('viser oppdater-og-send-knapp når aktivitet er satt', () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Act
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Assert
    expect(screen.getByRole('button', { name: /oppdater og send invitasjoner/i })).toBeInTheDocument();
  });

  it('viser rediger-aktivitet-overskrift når aktivitet er satt', () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Act
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Assert
    expect(screen.getByRole('heading', { name: /rediger aktivitet/i })).toBeInTheDocument();
  });
});

describe('ActivityForm — submit-oppførsel', () => {
  it('kaller onSubmit med sendInvitations=false ved klikk på lagre', async () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /^oppdater aktivitet$/i }));

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][1]).toBe(false);
  });

  it('kaller onSubmit med sendInvitations=true ved klikk på send invitasjoner', async () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /oppdater og send invitasjoner/i }));

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][1]).toBe(true);
  });

  it('sender med tittel og sted i innsendingsdata', async () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /^oppdater aktivitet$/i }));

    // Assert
    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData.title).toBe(existingActivity.title);
    expect(submittedData.location).toBe(existingActivity.location);
  });

  it('kaller onCancel og ikke onSubmit ved klikk på avbryt', async () => {
    // Arrange
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<ActivityForm activity={existingActivity} onSubmit={onSubmit} onCancel={onCancel} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /avbryt/i }));

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
