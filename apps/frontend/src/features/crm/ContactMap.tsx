import React, { useMemo, useRef } from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { MapLegend } from '@/components/MapLegend';

type ContactWithGeo = {
  id: string;
  name?: string;
  lat?: number;
  lng?: number;
  geo_region?: string;
};

type ContactMapProps = {
  contacts: ContactWithGeo[];
};

const COLORS = ['#2563eb', '#f97316', '#22c55e', '#a855f7', '#ef4444'];
const DEFAULT_COLOR = COLORS[0] ?? '#2563eb';

export function ContactMap({ contacts }: ContactMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markers = useMemo(() => {
    return contacts
      .filter((contact) => typeof contact.lat === 'number' && typeof contact.lng === 'number')
      .map((contact, index) => ({
        id: contact.id,
        lat: contact.lat as number,
        lng: contact.lng as number,
        label: contact.name || contact.id,
        color: COLORS[index % COLORS.length] ?? DEFAULT_COLOR,
      }));
  }, [contacts]);

  const legendItems = useMemo(() => {
    return markers.map((marker) => ({ id: marker.id, label: marker.label, color: marker.color }));
  }, [markers]);

  const map = useMapbox(containerRef, {
    markers,
    token: (window as any)?.MAPBOX_TOKEN,
  });

  if (markers.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
        Ingen kontakter med geokoordinater.
      </div>
    );
  }

  const hasToken = Boolean((window as any)?.MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN);

  if (!hasToken) {
    return (
      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-200">
        Sett <code>MAPBOX_TOKEN</code> i miljøet for å aktivere kartet.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[280px] flex-col gap-3">
      <div ref={containerRef} className="h-72 w-full rounded-lg" aria-label="Kart over kontakter" />
      <div className="pointer-events-none absolute bottom-4 right-4">
        <MapLegend items={legendItems} />
      </div>
      {!map && <p className="text-xs text-slate-400">Laster kart …</p>}
    </div>
  );
}

export default ContactMap;
