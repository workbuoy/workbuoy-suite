import type { IngestSource } from './types';
import { SalesforceLeadsAdapter } from './adapters/salesforce';
import { HubSpotContactsAdapter } from './adapters/hubspot';

// Back-compat internal adapters (stubs introduced in Beta)
export function loadAdapters(): IngestSource[] {
  const list: IngestSource[] = [];
  // Wrap adapter to IngestSource signature (pull -> fetch)
  function asSource(a: { name: ()=>any, fetch: ()=>Promise<any[]> }): IngestSource {
    return { name: a.name as any, pull: () => a.fetch() as any };
  }
  // Enable both by default unless explicitly disabled via env (keep behavior deterministic)
  if (process.env.WB_ADAPTERS_SALESFORCE !== '0') list.push(asSource(new SalesforceLeadsAdapter()));
  if (process.env.WB_ADAPTERS_HUBSPOT !== '0') list.push(asSource(new HubSpotContactsAdapter()));
  return list;
}

// New external adapters (Delta)
import { GmailAdapter } from './adapters/gmail';
import { CalendarAdapter } from './adapters/calendar';
import { SlackAdapter } from './adapters/slack';

export function loadExternalAdapters(): IngestSource[] {
  const list: IngestSource[] = [];
  function asSource(a: { name: ()=>any, fetch: ()=>Promise<any[]> }): IngestSource {
    return { name: a.name as any, pull: () => a.fetch() as any };
  }
  if (process.env.WB_ADAPTERS_GMAIL !== '0') list.push(asSource(new GmailAdapter()));
  if (process.env.WB_ADAPTERS_CALENDAR !== '0') list.push(asSource(new CalendarAdapter()));
  if (process.env.WB_ADAPTERS_SLACK !== '0') list.push(asSource(new SlackAdapter()));
  return list;
}
