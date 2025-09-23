import React from 'react';

type LegendItem = {
  id: string;
  label: string;
  color: string;
  value?: string | number;
};

type MapLegendProps = {
  items: LegendItem[];
};

export function MapLegend({ items }: MapLegendProps) {
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <aside
      aria-label="Kartforklaring"
      className="rounded-md bg-slate-900/60 p-3 text-xs text-slate-100 shadow-lg backdrop-blur"
    >
      <h3 className="mb-2 text-sm font-semibold">Forklaring</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: item.color }} aria-hidden="true" />
              <span>{item.label}</span>
            </span>
            {item.value !== undefined && <span className="text-slate-300">{item.value}</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default MapLegend;
