import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import WhyDrawer from "@/features/buoy/WhyDrawer";
import { o365Strings as strings } from "./strings";

type Item = {
  id: string;
  subject: string;
  updatedAt: string;
  kind: "email" | "document";
};

type Props = {
  onClose?: () => void;
};

const mockItems: Item[] = [
  { id: "m1", subject: "Statusmøte med Nordtek", updatedAt: "2025-09-18 08:42", kind: "email" },
  { id: "m2", subject: "Q4 Forecast.xlsx", updatedAt: "2025-09-17 15:20", kind: "document" },
  { id: "m3", subject: "Kontrakt ACME — utkast", updatedAt: "2025-09-17 11:04", kind: "document" },
  { id: "m4", subject: "Oppfølgingsmail: Pilotprosjekt", updatedAt: "2025-09-16 09:55", kind: "email" },
];

export default function O365Panel({ onClose }: Props) {
  const [whyOpen, setWhyOpen] = useState(false);
  const explanations = useMemo(
    () =>
      mockItems.map((item) => ({
        title: item.subject,
        quote: strings.lastUpdated(item.updatedAt),
        source: item.kind === "email" ? "Outlook" : "SharePoint",
      })),
    []
  );

  return (
    <section className="space-y-4" aria-label={strings.title}>
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{strings.title}</h2>
          <p className="text-sm text-slate-400">{strings.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setWhyOpen(true)}>{strings.openWhy}</Button>
          <Button variant="ghost" onClick={onClose}>{strings.close}</Button>
        </div>
      </header>
      <div className="grid gap-3" role="list">
        {mockItems.map((item) => (
          <article
            key={item.id}
            role="listitem"
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium text-slate-100">{item.subject}</div>
                <div className="text-xs text-slate-400">{strings.lastUpdated(item.updatedAt)}</div>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {item.kind === "email" ? strings.emailBadge : strings.documentBadge}
              </span>
            </div>
          </article>
        ))}
      </div>
      {whyOpen && (
        <WhyDrawer
          explanations={explanations}
          onClose={() => setWhyOpen(false)}
          title={strings.subtitle}
        />
      )}
    </section>
  );
}
