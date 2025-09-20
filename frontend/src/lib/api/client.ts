import { useActiveContext } from "@/core/ActiveContext";

export type Extra = {
  intent?: string;             // e.g., "contacts.create"
  whenISO?: string;            // e.g., "2025-10-12T14:00"
  autonomy?: number;           // 0..5 UI policy level (if available)
  selectedId?: string;         // context entity
  selectedType?: string;       // "contact" | "deal" | ...
};

export function buildHeaders(extra?: Extra){
  const h: Record<string,string> = {};
  if (extra?.intent) h["X-WB-Intent"] = extra.intent;
  if (extra?.whenISO) h["X-WB-When"] = extra.whenISO;
  if (extra?.autonomy != null) h["X-WB-Autonomy"] = String(extra.autonomy);
  if (extra?.selectedId) h["X-WB-Selected-Id"] = extra.selectedId;
  if (extra?.selectedType) h["X-WB-Selected-Type"] = extra.selectedType;
  return h;
}

/**
 * Lightweight fetch wrapper. Usage:
 *   const { withContext } = useApi();
 *   await withContext('/api/crm/contacts', { method:'POST', body: JSON.stringify(data) }, { intent:'contacts.create' })
 */
export function useApi(){
  const { selectedEntity, recentIntents } = useActiveContext();
  // Note: autonomy can be read from your Mode/Autonomy provider if available; here we keep it optional.

  async function withContext(input: RequestInfo | URL, init?: RequestInit, extra?: Extra){
    const headers = new Headers(init?.headers || {});
    const ex = { ...extra };
    if (selectedEntity){
      ex.selectedId = selectedEntity.id;
      ex.selectedType = selectedEntity.type;
    }
    for (const [k,v] of Object.entries(buildHeaders(ex))) headers.set(k, v);

    // Always send JSON content-type for bodies
    if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type','application/json');

    const res = await fetch(input, { ...init, headers });
    return res;
  }

  return { withContext };
}