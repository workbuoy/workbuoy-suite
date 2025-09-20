import React, { useEffect, useMemo, useRef, useState } from "react";
import { semanticZoomStrings as strings } from "./strings";

type SemanticZoomItem = {
  id: string;
  title: string;
  when: string;
  weight: number;
  type: string;
};

type Props = {
  items?: SemanticZoomItem[];
};

const defaultItems: SemanticZoomItem[] = [
  { id: "z1", title: "Ring kunde A", when: "2025-09-18", weight: 3, type: "Salg" },
  { id: "z2", title: "Send tilbud B", when: "2025-09-19", weight: 5, type: "Salg" },
  { id: "z3", title: "Workshop med Ops", when: "2025-09-22", weight: 2, type: "Leveranse" },
  { id: "z4", title: "Strategimøte Q4", when: "2025-09-28", weight: 4, type: "Strategi" },
  { id: "z5", title: "Onboarding Kunde C", when: "2025-10-02", weight: 3, type: "Leveranse" },
  { id: "z6", title: "Retrospektiv", when: "2025-10-04", weight: 1, type: "Team" },
];

const levelOrder = ["list", "timeline", "strategy"] as const;
type Level = typeof levelOrder[number];

function clampLevel(level: number) {
  return Math.min(Math.max(level, 0), levelOrder.length - 1);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

function formatWeekLabel(date: Date) {
  const formatter = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" });
  const month = new Intl.DateTimeFormat("nb-NO", { month: "long" }).format(date);
  const weekNumber = getISOWeek(date);
  return `${strings.timelineLabel(`Uke ${weekNumber}`)} · ${formatter.format(date)} (${month})`;
}

function groupByWeek(items: SemanticZoomItem[]) {
  const groups: Record<string, { label: string; items: SemanticZoomItem[] }> = {};
  items.forEach((item) => {
    const date = new Date(item.when);
    const weekStart = startOfWeek(date);
    const key = weekStart.toISOString().slice(0, 10);
    if (!groups[key]) {
      groups[key] = { label: formatWeekLabel(weekStart), items: [] };
    }
    groups[key].items.push(item);
  });
  return Object.entries(groups)
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function groupByType(items: SemanticZoomItem[]) {
  const map = new Map<string, SemanticZoomItem[]>();
  items.forEach((item) => {
    const entry = map.get(item.type) ?? [];
    entry.push(item);
    map.set(item.type, entry);
  });
  return Array.from(map.entries()).map(([type, list]) => ({
    type,
    items: list.sort((a, b) => b.weight - a.weight),
  }));
}

export default function SemanticZoom({ items = defaultItems }: Props) {
  const [level, setLevel] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sortedItems = useMemo(() => items.slice().sort((a, b) => a.when.localeCompare(b.when)), [items]);
  const weekGroups = useMemo(() => groupByWeek(sortedItems), [sortedItems]);
  const typeGroups = useMemo(() => groupByType(items), [items]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          setLevel((prev) => clampLevel(prev - 1));
        }
        if (event.key === "-") {
          event.preventDefault();
          setLevel((prev) => clampLevel(prev + 1));
        }
      }
      if (event.key === "1") setLevel(0);
      if (event.key === "2") setLevel(1);
      if (event.key === "3") setLevel(2);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
        setLevel((prev) =>
          clampLevel(prev + (event.deltaY > 0 ? 1 : -1))
        );
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  const currentLevel = levelOrder[level];

  return (
    <section
      ref={containerRef}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-100"
      aria-label={strings.title}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{strings.title}</h2>
          <p className="text-xs text-slate-400">
            {strings.shortcuts.zoomIn} · {strings.shortcuts.zoomOut} · {strings.shortcuts.levelKeys}
          </p>
        </div>
        <div className="inline-flex gap-2" role="tablist" aria-label="Zoom nivå">
          {levelOrder.map((name, index) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={level === index}
              className={`rounded-full border px-3 py-1 text-xs ${level === index ? 'border-indigo-400 bg-indigo-500/20' : 'border-slate-700 bg-transparent'}`}
              onClick={() => setLevel(index)}
            >
              {strings.levels[name]}
            </button>
          ))}
        </div>
      </header>

      {currentLevel === "list" && (
        <ul role="list" className="grid gap-3">
          {sortedItems.map((item) => (
            <li
              key={item.id}
              role="listitem"
              className="rounded-lg border border-slate-800 bg-slate-900/80 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-slate-400">{item.when}</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">{strings.clusterLabel(item.type)}</div>
            </li>
          ))}
        </ul>
      )}

      {currentLevel === "timeline" && (
        <div className="grid gap-4" role="list">
          {weekGroups.map((group) => (
            <section key={group.key} role="group" aria-labelledby={`week-${group.key}`} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <h3 id={`week-${group.key}`} className="text-sm font-semibold text-slate-200">
                {group.label}
              </h3>
              <ul role="list" className="mt-2 space-y-2">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-md border border-slate-800/60 bg-slate-900/80 px-3 py-2">
                    <span>{item.title}</span>
                    <span className="text-xs text-slate-400">{item.when}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {currentLevel === "strategy" && (
        <div className="grid gap-4 md:grid-cols-3">
          {typeGroups.map((group) => (
            <article key={group.type} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <h3 className="text-sm font-semibold text-slate-200">{strings.clusterLabel(group.type)}</h3>
              <ul role="list" className="mt-2 space-y-2">
                {group.items.map((item) => (
                  <li key={item.id} className="rounded-md border border-slate-800/60 bg-slate-900/80 px-3 py-2" role="listitem">
                    <div className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-xs text-slate-400">{item.weight.toFixed(1)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
