import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

// maplibre-gl bruker WebGL/canvas som ikke finnes i jsdom.
// click-handlere samles opp slik at tester kan utløse kartklkk.
const clickHandlers: Array<(e: { lngLat: { lat: number; lng: number } }) => void> = [];

const markerInstance = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
  getLngLat: vi.fn().mockReturnValue({ lat: 0, lng: 0 }),
  on: vi.fn(),
};

const mapInstance = {
  addControl: vi.fn(),
  on: vi.fn((event: string, handler: (e: { lngLat: { lat: number; lng: number } }) => void) => {
    if (event === 'click') clickHandlers.push(handler);
  }),
  flyTo: vi.fn(),
  getZoom: vi.fn().mockReturnValue(11),
  remove: vi.fn(),
};

vi.mock('maplibre-gl', () => {
  // Vitest krever function-uttrykk (ikke arrow-funksjoner) når vi.fn brukes som konstruktør.
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

import { LocationPicker } from './LocationPicker';

describe('LocationPicker', () => {
  beforeEach(() => {
    clickHandlers.length = 0;
    vi.clearAllMocks();
    mapInstance.flyTo.mockImplementation(() => {});
    mapInstance.getZoom.mockReturnValue(11);
    markerInstance.setLngLat.mockReturnThis();
    markerInstance.addTo.mockReturnThis();
    markerInstance.getLngLat.mockReturnValue({ lat: 0, lng: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rendrer hint-tekst over kartet', () => {
    // Arrange
    const onChange = vi.fn();

    // Act
    render(<LocationPicker value="" onChange={onChange} />);

    // Assert
    expect(screen.getByText(/Klikk pa kartet/i)).toBeInTheDocument();
  });

  it('kaller onChange med koordinater umiddelbart ved kartklikk', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<LocationPicker value="Gamlestedet" onChange={onChange} />);
    const coords = { lat: 59.9139, lng: 10.7522 };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ display_name: 'Oslo sentrum' }),
    }));

    // Act — utløs click-handleren som komponenten registrerte via map.on('click', ...)
    clickHandlers.forEach((h) => h({ lngLat: coords }));

    // Assert — handlePick kaller onChange umiddelbart med eksisterende value + koordinater
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('Gamlestedet', coords);
    });
  });

  it('kaller onChange med geokodert adresselabel etter reverse geocoding', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<LocationPicker value="Gamlestedet" onChange={onChange} />);
    const coords = { lat: 59.9139, lng: 10.7522 };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ display_name: 'Storgata 1, Oslo' }),
    }));

    // Act
    clickHandlers.forEach((h) => h({ lngLat: coords }));

    // Assert — reverseGeocode returnerer label, onChange kalles med ny label + koordinater
    await waitFor(() => {
      const geocodedCall = onChange.mock.calls.find(([label]) => label === 'Storgata 1, Oslo');
      expect(geocodedCall).toBeDefined();
      expect(geocodedCall![1]).toEqual(coords);
    });
  });

  it('viser henter-adresse-tekst mens reverse geocoding pågår', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<LocationPicker value="" onChange={onChange} />);

    let resolveFetch!: (value: unknown) => void;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(
      new Promise((res) => { resolveFetch = res; })
    ));

    // Act
    clickHandlers.forEach((h) => h({ lngLat: { lat: 60, lng: 10 } }));

    // Assert — "Henter adresse..."-tekst vises mens geocoding er i gang
    await waitFor(() =>
      expect(screen.getByText(/Henter adresse/i)).toBeInTheDocument()
    );

    // Fullfør fetch for å unngå åpne promises
    resolveFetch({ ok: true, json: () => Promise.resolve({ display_name: 'Et sted' }) });
  });
});
