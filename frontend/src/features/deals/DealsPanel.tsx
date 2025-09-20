import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/api";
import UndoToast from "@/components/UndoToast";
import TemporalLayer from "@/features/time/TemporalLayer";
import { dealsStrings as strings } from "./strings";
import { audioCue } from "@/features/peripheral/AudioCue";

type Deal = {
  id: string;
  contactId?: string;
  value?: number;
  status: string;
  updatedAt?: string;
};

type UndoInfo = {
  message: string;
  token?: string;
  applyLocalUndo?: () => void;
};

export function DealsPanel() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [undoInfo, setUndoInfo] = useState<UndoInfo | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [showTemporal, setShowTemporal] = useState(false);

  async function load() {
    const res = await apiFetch<Deal[]>('/api/deals');
    setDeals(res);
  }
  useEffect(()=>{ load().catch(()=>setDeals([])); }, []);

  async function updateStatus(id:string, status:string) {
    const previous = deals.find(d => d.id === id)?.status;
    try {
      const result = await apiFetch<{ undoToken?: string }>('/api/deals', { method:'POST', body: JSON.stringify({ id, status }) });
      setDeals(current => current.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d));
      setUndoInfo({
        message: strings.toast.statusChanged(id, status),
        token: result?.undoToken,
        applyLocalUndo: previous ? () => setDeals(current => current.map(d => d.id === id ? { ...d, status: previous } : d)) : undefined,
      });
      setToastOpen(true);
      audioCue.play('success');
    } catch (error) {
      setUndoInfo({ message: strings.toast.statusChanged(id, status) });
      setToastOpen(true);
      audioCue.play('error');
    }
  }

  async function performUndo() {
    if (!undoInfo?.token) return false;
    try {
      await apiFetch('/core/undo', { method: 'POST', body: JSON.stringify({ token: undoInfo.token }) });
      undoInfo.applyLocalUndo?.();
      await load();
      return true;
    } catch (error) {
      return false;
    }
  }

  const temporalItems = useMemo(() =>
    deals.map((deal) => {
      const updated = deal.updatedAt || new Date().toISOString();
      let state: 'past' | 'now' | 'future' = 'now';
      if (deal.status === 'won') state = 'past';
      if (deal.status === 'open') state = 'future';
      return {
        id: deal.id,
        title: `${deal.contactId || deal.id}`,
        start: updated,
        state,
      };
    }),
  [deals]);

  return (
    <Card className="m-2">
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">{strings.title}</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowTemporal(true)} aria-pressed={showTemporal}>
            {strings.overlayToggle}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-2 py-2">{strings.id}</th>
                <th className="px-2 py-2">{strings.contact}</th>
                <th className="px-2 py-2">{strings.value}</th>
                <th className="px-2 py-2">{strings.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {deals.map(d=>(
                <tr key={d.id}>
                  <td className="px-2 py-2 font-mono text-xs text-slate-400">{d.id}</td>
                  <td className="px-2 py-2 text-slate-300">{d.contactId}</td>
                  <td className="px-2 py-2 text-slate-300">{d.value ?? '—'}</td>
                  <td className="px-2 py-2">
                    <Select value={d.status} onValueChange={(s)=>updateStatus(d.id,s)} aria-label={strings.status}>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {showTemporal && (
        <TemporalLayer
          items={temporalItems}
          onClose={() => setShowTemporal(false)}
          anchorLabel={strings.title}
        />
      )}
      <UndoToast
        open={toastOpen && !!undoInfo}
        title={undoInfo?.message || ''}
        canUndo={!!undoInfo?.token}
        onUndo={performUndo}
        onClose={() => {
          setToastOpen(false);
          setUndoInfo(null);
        }}
      />
    </Card>
  );
}
