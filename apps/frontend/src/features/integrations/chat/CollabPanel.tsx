import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import WhyDrawer from "@/features/buoy/WhyDrawer";
import { demoThreads, type DemoThread } from "@/features/demo/data";

const strings = {
  title: "Samarbeid (Slack/Teams)",
  subtitle: "Siste tråder med risiko- og kundesignal",
  empty: "Ingen tråder tilgjengelig i demoen.",
  openWhy: "Hvorfor", 
  close: "Lukk",
  participants: (list: string[]) => `Deltakere: ${list.join(", ")}`,
  updated: (formatted: string) => `Oppdatert ${formatted}`,
};

const platformBadge: Record<DemoThread["platform"], string> = {
  Slack: "Slack",
  Teams: "Teams",
};

function formatTimestamp(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

type Props = {
  threads?: DemoThread[];
  onClose?: () => void;
};

export default function CollabPanel({ threads = demoThreads, onClose }: Props) {
  const [selected, setSelected] = useState<DemoThread | null>(null);
  const ordered = useMemo(
    () => threads.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [threads]
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
          {ordered.map((thread) => (
            <li key={thread.id} role="listitem">
              <article className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{thread.channel}</h3>
                    <p className="text-xs text-slate-400">{strings.updated(formatTimestamp(thread.updatedAt))}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">
                    {platformBadge[thread.platform]}
                  </span>
                </div>
                <p className="text-sm text-slate-200">{thread.snippet}</p>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>{strings.participants(thread.participants)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={() => setSelected(thread)}
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
              title: selected.channel,
              quote: selected.snippet,
              source: platformBadge[selected.platform],
            },
          ]}
          onClose={() => setSelected(null)}
          title={strings.title}
        />
      )}
    </section>
  );
}
