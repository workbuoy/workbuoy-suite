import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import WhyDrawer from "@/features/buoy/WhyDrawer";
import { demoWorkspaceEntries, type DemoWorkspaceEntry } from "@/features/demo/data";

const strings = {
  title: "Google Workspace",
  subtitle: "Seneste dokumenter og utkast",
  empty: "Ingen dokumenter i demoen ennå.",
  owner: (name: string) => `Eier: ${name}`,
  updated: (formatted: string) => `Oppdatert ${formatted}`,
  openWhy: "Hvorfor",
  close: "Lukk",
};

type Props = {
  entries?: DemoWorkspaceEntry[];
  onClose?: () => void;
};

const kindBadge: Record<DemoWorkspaceEntry["kind"], string> = {
  doc: "Dokument",
  sheet: "Regneark",
  slide: "Presentasjon",
  mail: "E-postutkast",
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function GWorkspacePanel({ entries = demoWorkspaceEntries, onClose }: Props) {
  const [selected, setSelected] = useState<DemoWorkspaceEntry | null>(null);
  const ordered = useMemo(
    () => entries.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [entries]
  );
  const empty = ordered.length === 0;

  return (
    <section className="space-y-4" aria-label={strings.title}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{strings.title}</h2>
          <p className="text-xs text-slate-400">{strings.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected(ordered[0] ?? null)} disabled={empty}>
            {strings.openWhy}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {strings.close}
          </Button>
        </div>
      </header>
      {empty ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          {strings.empty}
        </div>
      ) : (
        <ul className="grid gap-3" role="list">
          {ordered.map((entry) => (
            <li key={entry.id} role="listitem">
              <article className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{entry.title}</h3>
                    <p className="text-xs text-slate-400">{strings.updated(formatTimestamp(entry.updatedAt))}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">
                    {kindBadge[entry.kind]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{strings.owner(entry.owner)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={() => setSelected(entry)}
                  >
                    {strings.openWhy}
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <WhyDrawer
          explanations={[
            {
              title: selected.title,
              quote: `${strings.owner(selected.owner)} · ${strings.updated(formatTimestamp(selected.updatedAt))}`,
              source: kindBadge[selected.kind],
            },
          ]}
          onClose={() => setSelected(null)}
          title={strings.title}
        />
      )}
    </section>
  );
}
