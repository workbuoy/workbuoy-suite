import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { audit_events_total } from '../metrics/metrics.js';
import { emitMetricsEvent } from '../metrics/events.js';

const dir = '.audit';
mkdirSync(dir, { recursive: true });
const file = join(dir, 'audit.log');

function extractString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

export function audit(ev: any) {
  try {
    appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...ev }) + '\n');
    audit_events_total.inc();
  } catch {}

  const type = typeof ev?.type === 'string' ? ev.type : '';
  if (!type) {
    return;
  }

  if (type === 'rbac.denied') {
    const details = ev?.details ?? {};
    emitMetricsEvent('rbac:denied', {
      resource: extractString(details.resourceKind, 'unknown'),
      action: extractString(details.action, 'unknown'),
    });
    return;
  }

  if (type === 'rbac.policy.change') {
    const details = ev?.details ?? {};
    emitMetricsEvent('rbac:policy_change', {
      op: extractString(details.op, 'unknown'),
    });
  }
}
