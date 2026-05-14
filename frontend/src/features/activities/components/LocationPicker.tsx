import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './LocationPicker.module.css';

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (location: string, coords?: Coords) => void;
  initialCoords?: Coords;
}

const OSLO: Coords = { lat: 59.9139, lng: 10.7522 };
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

async function reverseGeocode(coords: Coords, signal: AbortSignal): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=no`;
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return typeof data.display_name === 'string' ? data.display_name : null;
}

export function LocationPicker({ value, onChange, initialCoords }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useEffect(() => {
    if (!containerRef.current) return;

    const start = initialCoords ?? OSLO;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [start.lng, start.lat],
      zoom: initialCoords ? 14 : 11,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    function placeMarker(coords: Coords) {
      if (markerRef.current) {
        markerRef.current.setLngLat([coords.lng, coords.lat]);
      } else {
        const marker = new maplibregl.Marker({ color: '#AF5D63', draggable: true })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map);
        marker.on('dragend', () => {
          const ll = marker.getLngLat();
          handlePick({ lat: ll.lat, lng: ll.lng });
        });
        markerRef.current = marker;
      }
    }

    function handlePick(picked: Coords) {
      placeMarker(picked);
      map.flyTo({ center: [picked.lng, picked.lat], zoom: Math.max(map.getZoom(), 14), duration: 600 });
      onChangeRef.current(valueRef.current, picked);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLookingUp(true);
      reverseGeocode(picked, controller.signal)
        .then((label) => {
          if (label && !controller.signal.aborted) {
            onChangeRef.current(label, picked);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) setLookingUp(false);
        });
    }

    map.on('click', (event) => {
      handlePick({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    });

    if (initialCoords) placeMarker(initialCoords);

    return () => {
      abortRef.current?.abort();
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>
        Klikk pa kartet for a velge stedet aktiviteten skal vaere.
        {lookingUp && <span className={styles.lookingUp}> Henter adresse...</span>}
      </p>
      <div ref={containerRef} className={styles.map} />
    </div>
  );
}
