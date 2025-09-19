import { createPortal } from "react-dom";
import type { FormEvent, KeyboardEvent, MouseEvent } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/api/client";

export type Contact = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt?: string | null;
};

type ContactDraft = {
  name: string;
  email: string;
  phone: string;
};

const TEXT = {
  title: "Contacts",
  subtitle: "Manage and keep track of the people you work with.",
  add: "Add Contact",
  cancel: "Cancel",
  submit: "Save",
  nameLabel: "Name",
  emailLabel: "Email",
  phoneLabel: "Phone",
  dialogDescription: "All fields are optional except name.",
  nameRequired: "Name is required.",
  createError: "Could not create contact. Try again.",
  loadError: "We could not load contacts right now.",
  deleteError: "Could not delete contact. It has been restored.",
  deleteConfirm: (name: string) => `Delete ${name || "contact"}?`,
  noContacts: "No contacts yet.",
  retry: "Retry",
  loading: "Loading contacts…",
  saving: "Saving…",
  deleting: "Deleting…",
};

const FOCUSABLE_SELECTOR =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

type AddContactDialogProps = {
  open: boolean;
  draft: ContactDraft;
  onDraftChange: (draft: ContactDraft) => void;
  onSubmit: () => Promise<void> | void;
  onClose: () => void;
  busy: boolean;
  error: string | null;
};

function AddContactDialog({
  open,
  draft,
  onDraftChange,
  onSubmit,
  onClose,
  busy,
  error,
}: AddContactDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return () => undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      } else {
        containerRef.current?.focus();
      }
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) {
          event.preventDefault();
          containerRef.current.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (current === first || !containerRef.current.contains(current)) {
            event.preventDefault();
            last.focus();
          }
        } else if (current === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
    },
    [onSubmit],
  );

  const content = useMemo(() => {
    if (!open) return null;
    return (
      <div
        role="presentation"
        onMouseDown={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(9,11,18,0.72)",
          display: "grid",
          placeItems: "center",
          padding: 16,
          zIndex: 10_000,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          ref={containerRef}
          tabIndex={-1}
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            width: "min(440px, 100%)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 48px rgba(8,12,20,0.65)",
            display: "grid",
            gap: 16,
          }}
        >
          <header style={{ display: "grid", gap: 4 }}>
            <h2 id={titleId} style={{ margin: 0 }}>
              {TEXT.add}
            </h2>
            <p
              id={descriptionId}
              style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}
            >
              {TEXT.dialogDescription}
            </p>
          </header>
          {error ? (
            <div
              role="alert"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(218,30,40,0.45)",
                background: "rgba(218,30,40,0.12)",
                padding: "10px 12px",
                color: "#ffd7d9",
              }}
            >
              {error}
            </div>
          ) : null}
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: 12 }}
            aria-busy={busy}
          >
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 13 }}>{TEXT.nameLabel}</span>
              <input
                ref={nameInputRef}
                value={draft.name}
                onChange={(event) =>
                  onDraftChange({ ...draft, name: event.target.value })
                }
                required
                aria-required="true"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(12,14,20,0.7)",
                  color: "var(--ink)",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 13 }}>{TEXT.emailLabel}</span>
              <input
                type="email"
                value={draft.email}
                onChange={(event) =>
                  onDraftChange({ ...draft, email: event.target.value })
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(12,14,20,0.7)",
                  color: "var(--ink)",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 13 }}>{TEXT.phoneLabel}</span>
              <input
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  onDraftChange({ ...draft, phone: event.target.value })
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(12,14,20,0.7)",
                  color: "var(--ink)",
                }}
              />
            </label>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "var(--muted)",
                }}
              >
                {TEXT.cancel}
              </button>
              <button
                type="submit"
                disabled={busy}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "var(--accent)",
                  color: "#0b0c10",
                  fontWeight: 600,
                  minWidth: 96,
                }}
              >
                {busy ? TEXT.saving : TEXT.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [open, handleOverlayClick, handleSubmit, draft, onDraftChange, busy, error]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

const emptyDraft = (): ContactDraft => ({ name: "", email: "", phone: "" });

export function ContactsPanel(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<ContactDraft>(() => emptyDraft());
  const [draftError, setDraftError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, boolean>>({});
  const pendingOperations = useRef(
    new Map<string, { type: "delete"; contact: Contact; index: number }>(),
  );

  const tableTitleId = useId();
  const tableHeaderIds = useMemo(
    () => ({
      name: `${tableTitleId}-name`,
      email: `${tableTitleId}-email`,
      phone: `${tableTitleId}-phone`,
      actions: `${tableTitleId}-actions`,
    }),
    [tableTitleId],
  );

  const reload = useCallback(
    async (options?: { signal?: { cancelled: boolean } }) => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await apiFetch<Contact[]>("/api/crm/contacts");
        if (options?.signal?.cancelled) return;
        setContacts(() => data);
      } catch (error) {
        if (options?.signal?.cancelled) return;
        setLoadError(TEXT.loadError);
      } finally {
        if (options?.signal?.cancelled) return;
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    void reload({ signal });
    return () => {
      signal.cancelled = true;
    };
  }, [reload]);

  useEffect(() => {
    if (!dialogOpen) {
      setDraft(emptyDraft());
      setDraftError(null);
    }
  }, [dialogOpen]);

  const handleDraftChange = useCallback((next: ContactDraft) => {
    setDraft(next);
  }, []);

  const handleCreate = useCallback(async () => {
    const trimmedName = draft.name.trim();
    const trimmedEmail = draft.email.trim();
    const trimmedPhone = draft.phone.trim();

    if (!trimmedName) {
      setDraftError(TEXT.nameRequired);
      return;
    }

    setDraftError(null);
    setCreating(true);

    const optimistic: Contact = {
      id: `tmp-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail ? trimmedEmail : undefined,
      phone: trimmedPhone ? trimmedPhone : undefined,
    };

    setContacts((prev) => [optimistic, ...prev]);

    try {
      const created = await apiFetch<Contact>("/api/crm/contacts", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail ? trimmedEmail : undefined,
          phone: trimmedPhone ? trimmedPhone : undefined,
        }),
      });
      setContacts((prev) =>
        prev.map((item) => (item.id === optimistic.id ? created : item)),
      );
      setDialogOpen(false);
      setDraft(emptyDraft());
    } catch (error) {
      setContacts((prev) => prev.filter((item) => item.id !== optimistic.id));
      setDraftError(TEXT.createError);
    } finally {
      setCreating(false);
    }
  }, [draft, setContacts]);

  const handleDelete = useCallback(
    (contact: Contact) => {
      if (!window.confirm(TEXT.deleteConfirm(contact.name ?? ""))) {
        return;
      }
      setDeleteError(null);
      setPendingDeletes((prev) => ({ ...prev, [contact.id]: true }));

      let operationId: string | null = null;
      let inverseRecord:
        | { type: "delete"; contact: Contact; index: number }
        | null = null;

      setContacts((prev) => {
        const index = prev.findIndex((item) => item.id === contact.id);
        if (index === -1) {
          return prev;
        }

        operationId = `del_${contact.id}_${Date.now()}`;
        inverseRecord = {
          type: "delete",
          contact: prev[index],
          index,
        };
        pendingOperations.current.set(operationId, inverseRecord);

        return prev.slice(0, index).concat(prev.slice(index + 1));
      });

      if (!operationId || !inverseRecord) {
        setPendingDeletes((pending) => {
          if (!pending[contact.id]) return pending;
          const next = { ...pending };
          delete next[contact.id];
          return next;
        });
        return;
      }

      void (async () => {
        try {
          await apiFetch(`/api/crm/contacts?id=${encodeURIComponent(contact.id)}`, {
            method: "DELETE",
          });
          pendingOperations.current.delete(operationId!);
        } catch (error) {
          const inverse =
            pendingOperations.current.get(operationId!) ?? inverseRecord;
          pendingOperations.current.delete(operationId!);
          if (inverse) {
            setContacts((current) => {
              if (current.some((item) => item.id === inverse.contact.id)) {
                return current;
              }
              const insertAt = Math.min(inverse.index, current.length);
              const restored = current.slice();
              restored.splice(insertAt, 0, inverse.contact);
              return restored;
            });
          }
          setDeleteError(TEXT.deleteError);
        } finally {
          setPendingDeletes((pending) => {
            if (!pending[contact.id]) return pending;
            const next = { ...pending };
            delete next[contact.id];
            return next;
          });
        }
      })();
    },
    [apiFetch, pendingOperations],
  );

  const busy = creating || Object.values(pendingDeletes).some(Boolean);

  return (
    <section
      aria-labelledby={tableTitleId}
      className="cardbg"
      style={{
        borderRadius: 16,
        padding: 20,
        display: "grid",
        gap: 16,
        minHeight: 280,
        position: "relative",
      }}
    >
      <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <h1 id={tableTitleId} style={{ margin: 0, fontSize: 20 }}>
            {TEXT.title}
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
            {TEXT.subtitle}
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={dialogOpen}
          disabled={creating}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: "var(--accent)",
            color: "#081018",
            fontWeight: 600,
            boxShadow: "0 6px 18px rgba(8,12,20,0.35)",
          }}
        >
          {TEXT.add}
        </button>
      </header>
      {loadError ? (
        <div
          role="alert"
          style={{
            borderRadius: 12,
            border: "1px solid rgba(241,61,85,0.45)",
            background: "rgba(241,61,85,0.16)",
            padding: "10px 12px",
            color: "#ffd7d9",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void reload()}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "var(--ink)",
            }}
          >
            {TEXT.retry}
          </button>
        </div>
      ) : null}
      {deleteError ? (
        <div
          role="alert"
          style={{
            borderRadius: 12,
            border: "1px solid rgba(241,61,85,0.28)",
            background: "rgba(241,61,85,0.12)",
            padding: "10px 12px",
            color: "#ffd7d9",
          }}
        >
          {deleteError}
        </div>
      ) : null}
      <div
        aria-busy={busy || loading}
        style={{
          overflow: "auto",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <table
          role="table"
          aria-labelledby={tableTitleId}
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 420,
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.04)" }}>
            <tr>
              <th
                id={tableHeaderIds.name}
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--muted)",
                }}
              >
                {TEXT.nameLabel}
              </th>
              <th
                id={tableHeaderIds.email}
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--muted)",
                }}
              >
                {TEXT.emailLabel}
              </th>
              <th
                id={tableHeaderIds.phone}
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--muted)",
                }}
              >
                {TEXT.phoneLabel}
              </th>
              <th
                id={tableHeaderIds.actions}
                scope="col"
                style={{
                  textAlign: "right",
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--muted)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ padding: "20px 16px", textAlign: "center" }}
                >
                  <span role="status" aria-live="polite">
                    {TEXT.loading}
                  </span>
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  {TEXT.noContacts}
                </td>
              </tr>
            ) : (
              contacts.map((contact) => {
                const deleting = Boolean(pendingDeletes[contact.id]);
                return (
                  <tr
                    key={contact.id}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <td
                      headers={tableHeaderIds.name}
                      style={{ padding: "12px 16px", fontWeight: 600 }}
                    >
                      {contact.name}
                    </td>
                    <td
                      headers={tableHeaderIds.email}
                      style={{
                        padding: "12px 16px",
                        color: contact.email ? "var(--ink)" : "var(--muted)",
                      }}
                    >
                      {contact.email || "—"}
                    </td>
                    <td
                      headers={tableHeaderIds.phone}
                      style={{
                        padding: "12px 16px",
                        color: contact.phone ? "var(--ink)" : "var(--muted)",
                      }}
                    >
                      {contact.phone || "—"}
                    </td>
                    <td
                      headers={tableHeaderIds.actions}
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => void handleDelete(contact)}
                        disabled={deleting}
                        aria-label={`Delete ${contact.name}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "transparent",
                          color: deleting ? "var(--muted)" : "var(--ink)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          minWidth: 92,
                          justifyContent: "flex-end",
                        }}
                      >
                        <span aria-hidden="true">🗑</span>
                        {deleting ? TEXT.deleting : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AddContactDialog
        open={dialogOpen}
        draft={draft}
        onDraftChange={handleDraftChange}
        onSubmit={handleCreate}
        onClose={() => setDialogOpen(false)}
        busy={creating}
        error={draftError}
      />
    </section>
  );
}

export default ContactsPanel;
