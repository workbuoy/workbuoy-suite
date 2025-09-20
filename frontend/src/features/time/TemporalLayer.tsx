import React, { useEffect, useMemo, useRef } from "react";
import { temporalStrings as strings } from "./strings";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/store/settings";

type TemporalState = "past" | "now" | "future";

type TemporalItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  state?: TemporalState;
};

type Props = {
  items: TemporalItem[];
  onClose?: () => void;
  anchorLabel?: string;
};

function resolveState(item: TemporalItem): TemporalState {
  if (item.state) return item.state;
  const now = Date.now();
  const start = new Date(item.start).getTime();
  const end = item.end ? new Date(item.end).getTime() : start;
  if (end < now) return "past";
  if (start > now) return "future";
  return "now";
}

function categorize(items: TemporalItem[]) {
  const groups: Record<TemporalState, TemporalItem[]> = {
    past: [],
    now: [],
    future: [],
  };
  items.forEach((item) => {
    const state = resolveState(item);
    groups[state].push(item);
  });
  (Object.keys(groups) as TemporalState[]).forEach((key) => {
    groups[key] = groups[key].sort((a, b) => a.start.localeCompare(b.start));
  });
  return groups;
}

export default function TemporalLayer({ items, onClose, anchorLabel }: Props) {
  const groups = useMemo(() => categorize(items), [items]);
  const nowRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const animate = !reducedMotion;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        nowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const label = anchorLabel ? `${strings.title} – ${anchorLabel}` : strings.title;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="absolute inset-0 z-40 flex flex-col bg-slate-950/85 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100">{label}</h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label={strings.overlayClose}>
          {strings.overlayClose}
        </Button>
      </div>
      <div className="relative flex-1 overflow-y-auto px-4 pb-6">
        {animate && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-900/20 px-3 py-2 text-xs text-indigo-100" role="note">
            <span role="img" aria-label="Tre-finger-sveip">👆</span>
            <span>{strings.gestureHint}</span>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3" role="list">
          <Section
            id="temporal-past"
            title={strings.sections.past}
            items={groups.past}
            animate={animate}
          />
          <Section
            id="temporal-now"
            title={strings.sections.now}
            items={groups.now}
            markerRef={nowRef}
            animate={animate}
          />
          <Section
            id="temporal-future"
            title={strings.sections.future}
            items={groups.future}
            animate={animate}
          />
        </div>
      </div>
    </div>
  );
}

type SectionProps = {
  id: string;
  title: string;
  items: TemporalItem[];
  markerRef?: React.RefObject<HTMLDivElement>;
  animate: boolean;
};

function Section({ id, title, items, markerRef, animate }: SectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900/80 px-1 py-2">
        <h3 id={id} className="text-sm font-semibold text-slate-200">
          {title}
        </h3>
        {markerRef && (
          <div ref={markerRef} className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs text-indigo-100">
            {strings.nowMarker}
          </div>
        )}
      </div>
      <ul role="list" className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            role="listitem"
            className="rounded-md border border-slate-800/60 bg-slate-900/80 px-3 py-2"
            title={`${item.title} – ${item.start}`}
            style={animate ? { transition: "transform 220ms ease, opacity 220ms ease" } : undefined}
          >
            <div className="flex items-center justify-between">
              <span>{item.title}</span>
              <span className="text-xs text-slate-400">{item.start}</span>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-md border border-dashed border-slate-800/60 px-3 py-2 text-xs text-slate-500">
            —
          </li>
        )}
      </ul>
    </section>
  );
}
