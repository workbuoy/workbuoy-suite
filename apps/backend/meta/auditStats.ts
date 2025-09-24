import { recordAuditFailures } from './metrics.js';

export type AuditStatsResponse = {
  window: { from: string; to: string };
  totals: { intents: number; actions: number; failures: number };
  top_errors: Array<{ code: string; count: number }>;
};

export interface AuditRepoEvent {
  type: 'intent' | 'action' | 'failure';
  code?: string;
}

export interface AuditRepo {
  listEvents(from: Date, to: Date): Promise<AuditRepoEvent[]>;
}

const HOUR_IN_MS = 60 * 60 * 1000;

const DEFAULT_WINDOW_FALLBACK = {
  totals: { intents: 0, actions: 0, failures: 0 },
  top_errors: [] as Array<{ code: string; count: number }>,
};

function normaliseDate(input: Date | undefined, fallback: Date): Date {
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return input;
  }
  return fallback;
}

function toIsoString(date: Date): string {
  return new Date(date.getTime()).toISOString();
}

export async function getAuditStats(
  repo: AuditRepo,
  from?: Date,
  to?: Date,
): Promise<AuditStatsResponse> {
  const now = new Date();
  const toTs = normaliseDate(to, now);
  const defaultFrom = new Date(toTs.getTime() - HOUR_IN_MS);
  const fromTs = normaliseDate(from, defaultFrom);

  if (fromTs.getTime() > toTs.getTime()) {
    const swapped = { from: toTs, to: fromTs };
    return {
      window: { from: toIsoString(swapped.from), to: toIsoString(swapped.to) },
      ...DEFAULT_WINDOW_FALLBACK,
    };
  }

  const events = await repo.listEvents(fromTs, toTs);

  const totals = {
    intents: events.filter((event) => event.type === 'intent').length,
    actions: events.filter((event) => event.type === 'action').length,
    failures: events.filter((event) => event.type === 'failure').length,
  };

  if (totals.failures > 0) {
    recordAuditFailures(totals.failures);
  }

  const errorCounts = new Map<string, number>();
  for (const event of events) {
    if (event.type === 'failure' && event.code) {
      errorCounts.set(event.code, (errorCounts.get(event.code) || 0) + 1);
    }
  }

  const top_errors = [...errorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));

  return {
    window: { from: toIsoString(fromTs), to: toIsoString(toTs) },
    totals,
    top_errors,
  };
}
