import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './ActivityMap.module.css';

interface Props {
  location: string;
}

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

interface Coords {
  lat: number;
  lng: number;
}

async function forwardGeocode(query: string, signal: AbortSignal): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}&accept-language=no`;
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export function ActivityMap({ location }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading');

  useEffect(() => {
    if (!location.trim()) {
      setStatus('not-found');
      return;
    }

    const controller = new AbortController();
    setStatus('loading');

    forwardGeocode(location, controller.signal)
      .then((coords) => {
        if (controller.signal.aborted) return;
        if (!coords || !containerRef.current) {
          setStatus('not-found');
          return;
        }

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 16, duration: 600 });
          markerRef.current?.setLngLat([coords.lng, coords.lat]);
        } else {
          const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLE,
            center: [coords.lng, coords.lat],
            zoom: 16,
            attributionControl: { compact: true },
            interactive: true,
          });
          map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
          mapRef.current = map;
          markerRef.current = new maplibregl.Marker({ color: '#AF5D63' })
            .setLngLat([coords.lng, coords.lat])
            .addTo(map);
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('not-found');
      });

    return () => {
      controller.abort();
    };
  }, [location]);

  useEffect(() => () => {
    markerRef.current?.remove();
    markerRef.current = null;
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.map} />
      {status === 'loading' && <p className={styles.overlay}>Henter kart...</p>}
      {status === 'not-found' && <p className={styles.overlay}>Fant ikke stedet på kartet.</p>}
    </div>
  );
}
