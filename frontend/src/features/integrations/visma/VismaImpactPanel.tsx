import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import WhyDrawer from "@/features/buoy/WhyDrawer";
import { demoVisma, type DemoVismaData, type DemoBreakdown } from "@/features/demo/data";

const strings = {
  title: "Visma ERP – Effekt",
  subtitle: "KPI-er og mikrograf for purring",
  close: "Lukk",
  openWhy: "Audit",
  kpiTarget: (value: string) => `Mål: ${value}`,
  collectionLabels: {
    cost: "Kostnadsfordeling",
    time: "Tidsbruk",
    reminders: "Purringer",
  } as const,
};

type Props = {
  data?: DemoVismaData;
  onClose?: () => void;
};

function formatValue(value: number, unit: string): string {
  if (unit === "NOK") {
    return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);
  }
  return `${value} ${unit}`;
}

function formatTarget(value: number, unit: string): string {
  if (unit === "NOK") {
    return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);
  }
  return `${value} ${unit}`;
}

function TrendBadge({ trend }: { trend: DemoVismaData["kpis"][number]["trend"] }) {
  const label = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const color = trend === "up" ? "text-emerald-300" : trend === "down" ? "text-red-300" : "text-slate-300";
  const description = trend === "up" ? "Trend opp" : trend === "down" ? "Trend ned" : "Trend stabil";
  return (
    <span className={`text-lg font-semibold ${color}`} role="img" aria-label={description}>
      {label}
    </span>
  );
}

function MiniBar({ label, items }: { label: string; items: DemoBreakdown[] }) {
  const total = items.reduce((acc, item) => acc + item.value, 0);
  return (
    <section aria-label={label} className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-sm font-semibold text-slate-200">{label}</h3>
      <ul className="space-y-2" role="list">
        {items.map((item) => {
          const percentage = total === 0 ? 0 : Math.round((item.value / total) * 100);
          return (
            <li key={item.id} role="listitem" className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800" role="img" aria-label={`${item.label}: ${percentage}%`}>
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function VismaImpactPanel({ data = demoVisma, onClose }: Props) {
  const [whyOpen, setWhyOpen] = useState(false);

  const explanations = useMemo(
    () =>
      data.kpis.map((kpi) => ({
        title: kpi.label,
        quote: `${formatValue(kpi.value, kpi.unit)} · ${strings.kpiTarget(formatTarget(kpi.target, kpi.unit))}`,
        source: kpi.trend === "up" ? "Økende" : kpi.trend === "down" ? "Synkende" : "Stabil",
      })),
    [data]
  );

  return (
    <section className="space-y-4" aria-label={strings.title}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{strings.title}</h2>
          <p className="text-xs text-slate-400">{strings.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setWhyOpen(true)}>
            {strings.openWhy}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {strings.close}
          </Button>
        </div>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {data.kpis.map((kpi) => (
          <article key={kpi.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4" aria-label={kpi.label}>
            <header className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{kpi.label}</h3>
                <p className="text-xs text-slate-400">{strings.kpiTarget(formatTarget(kpi.target, kpi.unit))}</p>
              </div>
              <TrendBadge trend={kpi.trend} />
            </header>
            <div className="mt-4 text-lg font-semibold text-slate-100">{formatValue(kpi.value, kpi.unit)}</div>
          </article>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <MiniBar label={strings.collectionLabels.cost} items={data.collections.cost} />
        <MiniBar label={strings.collectionLabels.time} items={data.collections.time} />
        <MiniBar label={strings.collectionLabels.reminders} items={data.collections.reminders} />
      </div>
      {whyOpen && (
        <WhyDrawer explanations={explanations} onClose={() => setWhyOpen(false)} title={strings.title} />
      )}
    </section>
  );
}
