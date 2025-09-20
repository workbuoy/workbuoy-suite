import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/api";
import UndoToast from "@/components/UndoToast";
import { contactsStrings as strings } from "./strings";
import TemporalLayer from "@/features/time/TemporalLayer";
import { audioCue } from "@/features/peripheral/AudioCue";
import ContactMap from "./ContactMap";

type FormState = { id: string; name: string; email: string; phone: string };
type Contact = { id: string; name: string; email?: string; phone?: string; createdAt?: string };

type UndoInfo = {
  message: string;
  token?: string;
  applyLocalUndo?: () => void;
};

const initialForm: FormState = { id: "", name: "", email: "", phone: "" };

export type ContactsPanelProps = {
  onClose?: () => void;
};

export function ContactsPanel({ onClose }: ContactsPanelProps = {}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [undoInfo, setUndoInfo] = useState<UndoInfo | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [showTemporal, setShowTemporal] = useState(false);
  const [showMap, setShowMap] = useState(false);

  async function load() {
    const res = await apiFetch<Contact[]>('/api/crm/contacts');
    setContacts(res);
  }

  useEffect(() => {
    load().catch(() => setContacts([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await apiFetch<Contact & { undoToken?: string }>(
        '/api/crm/contacts',
        { method: 'POST', body: JSON.stringify(form) }
      );
      setContacts(current => [created, ...current]);
      audioCue.play('success');
      setUndoInfo({
        message: strings.toast.created(created.name),
        token: created.undoToken,
        applyLocalUndo: () => setContacts(current => current.filter(c => c.id !== created.id)),
      });
      setToastOpen(true);
      setOpen(false);
      setForm(initialForm);
    } catch (error) {
      audioCue.play('error');
      setUndoInfo({ message: strings.toast.cannotUndo });
      setToastOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(contact: Contact) {
    try {
      const result = await apiFetch<{ undoToken?: string; restored?: Contact }>('/api/crm/contacts', {
        method: 'DELETE',
        body: JSON.stringify({ id: contact.id }),
      });
      setContacts(current => current.filter(c => c.id !== contact.id));
      audioCue.play('success');
      setUndoInfo({
        message: strings.toast.deleted(contact.name || contact.id),
        token: result?.undoToken,
        applyLocalUndo: () => setContacts(current => [contact, ...current]),
      });
      setToastOpen(true);
    } catch (error) {
      audioCue.play('error');
      setUndoInfo({ message: strings.toast.cannotUndo });
      setToastOpen(true);
    }
  }

  async function performUndo() {
    if (!undoInfo?.token) {
      return false;
    }
    try {
      await apiFetch('/core/undo', {
        method: 'POST',
        body: JSON.stringify({ token: undoInfo.token }),
      });
      undoInfo.applyLocalUndo?.();
      await load();
      return true;
    } catch (error) {
      return false;
    }
  }

  const temporalItems = useMemo(() =>
    contacts.map((contact) => {
      const created = contact.createdAt || new Date().toISOString();
      const createdDate = new Date(created);
      const diff = createdDate.getTime() - Date.now();
      let state: 'past' | 'now' | 'future' = 'now';
      if (diff < -86400000) state = 'past';
      else if (diff > 86400000) state = 'future';
      return {
        id: contact.id,
        title: contact.name || contact.id,
        start: created,
        state,
      };
    }),
  [contacts]);

  return (
    <Card className="m-2">
      <CardContent>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-100">{strings.title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemporal(true)}
              aria-pressed={showTemporal}
            >
              {strings.overlayToggle}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMap((prev) => !prev)}
              aria-pressed={showMap}
            >
              {showMap ? "Skjul kart" : "Vis kart"}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={strings.close}>
                {strings.close}
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <Button>{strings.addContact}</Button>
              </DialogTrigger>
              <DialogContent>
                <div className="grid gap-3" role="form" aria-label={strings.addContact}>
                  <Input
                    placeholder={strings.idPlaceholder}
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                  />
                  <Input
                    placeholder={strings.namePlaceholder}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    placeholder={strings.emailPlaceholder}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <Input
                    placeholder={strings.phonePlaceholder}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Button onClick={save} disabled={saving} aria-busy={saving}>
                    {saving ? strings.saving : strings.save}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-2 py-2">{strings.tableHeadings.id}</th>
                <th className="px-2 py-2">{strings.tableHeadings.name}</th>
                <th className="px-2 py-2">{strings.tableHeadings.email}</th>
                <th className="px-2 py-2">{strings.tableHeadings.phone}</th>
                <th className="px-2 py-2">{strings.tableHeadings.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-2 py-2 font-mono text-xs text-slate-400">{contact.id}</td>
                  <td className="px-2 py-2">{contact.name}</td>
                  <td className="px-2 py-2 text-slate-300">{contact.email}</td>
                  <td className="px-2 py-2 text-slate-300">{contact.phone}</td>
                  <td className="px-2 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(contact)}
                      aria-label={`${strings.delete} ${contact.name}`}
                    >
                      {strings.delete}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showMap && (
          <div className="mt-4">
            <ContactMap contacts={contacts} />
          </div>
        )}
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
        description={!undoInfo?.token ? strings.toast.cannotUndo : undefined}
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

export default ContactsPanel;
