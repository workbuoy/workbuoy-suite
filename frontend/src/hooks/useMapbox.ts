import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

type MarkerInput = {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  color?: string;
};

type UseMapboxOptions = {
  token?: string;
  style?: string;
  center?: [number, number];
  zoom?: number;
  markers?: MarkerInput[];
};

export function useMapbox(containerRef: React.RefObject<HTMLDivElement>, options: UseMapboxOptions) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
  const token = options.token || viteEnv.VITE_MAPBOX_TOKEN || (window as any)?.MAPBOX_TOKEN;

  useEffect(() => {
    if (!containerRef.current) return;
    if (!token) return;
    if (map) return;

    mapboxgl.accessToken = token;
    const instance = new mapboxgl.Map({
      container: containerRef.current,
      style: options.style || (viteEnv.VITE_MAPBOX_STYLE_URL as string) || 'mapbox://styles/mapbox/light-v11',
      center: options.center || [10.75, 59.91],
      zoom: options.zoom ?? 3,
    });

    setMap(instance);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      instance.remove();
      setMap(null);
    };
  }, [containerRef, options.center, options.style, options.zoom, token, map]);

  useEffect(() => {
    if (!map) return;
    const desiredMarkers = options.markers || [];
    const currentMarkers = markersRef.current;

    // Remove markers that are no longer present
    for (const [id, marker] of currentMarkers.entries()) {
      if (!desiredMarkers.find((m) => m.id === id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // Add or update markers
    desiredMarkers.forEach((markerInput) => {
      const position: [number, number] = [markerInput.lng, markerInput.lat];
      const existing = currentMarkers.get(markerInput.id);
      if (existing) {
        existing.setLngLat(position);
        if (markerInput.label) existing.getElement().setAttribute('aria-label', markerInput.label);
        return;
      }
      const marker = new mapboxgl.Marker({ color: markerInput.color || '#2563eb' })
        .setLngLat(position);
      if (markerInput.label) {
        marker.getElement().setAttribute('aria-label', markerInput.label);
        marker.getElement().setAttribute('title', markerInput.label);
      }
      marker.addTo(map);
      currentMarkers.set(markerInput.id, marker);
    });
  }, [map, options.markers]);

  return map;
}
