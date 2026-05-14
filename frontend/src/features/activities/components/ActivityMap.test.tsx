import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const markerInstance = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};

const mapInstance = {
  addControl: vi.fn(),
  flyTo: vi.fn(),
  remove: vi.fn(),
};

vi.mock('maplibre-gl', () => {
  function MapMock() { return mapInstance; }
  function MarkerMock() { return markerInstance; }
  function NavigationControlMock() { return {}; }

  return {
    default: {
      Map: MapMock,
      Marker: MarkerMock,
      NavigationControl: NavigationControlMock,
    },
  };
});

import { ActivityMap } from './ActivityMap';

const nominatimHit = [{ lat: '59.9139', lon: '10.7522', display_name: 'Oslo' }];

describe('ActivityMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mapInstance.flyTo.mockImplementation(() => {});
    markerInstance.setLngLat.mockReturnThis();
    markerInstance.addTo.mockReturnThis();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('viser ladetekst mens geokoding pågår', () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    // Act
    render(<ActivityMap location="Oslo" />);

    // Assert
    expect(screen.getByText('Henter kart...')).toBeInTheDocument();
  });

  it('viser ikke feilmelding mens geokoding laster', () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    // Act
    render(<ActivityMap location="Oslo" />);

    // Assert
    expect(screen.queryByText('Fant ikke stedet på kartet.')).not.toBeInTheDocument();
  });

  it('plasserer markør med koordinater fra Nominatim', async () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(nominatimHit),
    }));

    // Act
    render(<ActivityMap location="Oslo" />);

    // Assert — marker plasseres med koordinater fra Nominatim-svaret
    await waitFor(() => {
      expect(markerInstance.setLngLat).toHaveBeenCalledWith([10.7522, 59.9139]);
    });
  });

  it('viser ikke-funnet-melding når Nominatim returnerer tom liste', async () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }));

    // Act
    render(<ActivityMap location="Ikkestednavn123xyz" />);

    // Assert
    await waitFor(() =>
      expect(screen.getByText('Fant ikke stedet på kartet.')).toBeInTheDocument()
    );
  });

  it('viser ikke-funnet-melding og kaller ikke fetch når sted er tom streng', async () => {
    // Arrange — tom location-streng skal gi not-found uten å kalle fetch
    vi.stubGlobal('fetch', vi.fn());

    // Act
    render(<ActivityMap location="" />);

    // Assert
    await waitFor(() =>
      expect(screen.getByText('Fant ikke stedet på kartet.')).toBeInTheDocument()
    );
    expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
  });

  it('viser ikke-funnet-melding når fetch feiler', async () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('nettverksfeil')));

    // Act
    render(<ActivityMap location="Oslo" />);

    // Assert
    await waitFor(() =>
      expect(screen.getByText('Fant ikke stedet på kartet.')).toBeInTheDocument()
    );
  });
});
