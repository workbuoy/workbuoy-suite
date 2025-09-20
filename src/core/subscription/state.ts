import { ProactivityMode } from '../proactivity/modes';
import { DEFAULT_SUBSCRIPTION_PLAN, getPlanMaxMode } from './entitlements';
import type { SubscriptionPlan, SubscriptionSettings } from './types';
import { persistenceEnabled } from '../config/dbFlag';
import { SubscriptionRepo } from './db/SubscriptionRepo';

const SUBSCRIPTIONS = new Map<string, SubscriptionSettings>();
const repo = new SubscriptionRepo();

function defaults(tenantId: string): SubscriptionSettings {
  return { tenantId, plan: DEFAULT_SUBSCRIPTION_PLAN, killSwitch: false, secureTenant: false };
}

export async function ensureSubscriptionHydrated(tenantId: string): Promise<void> {
  if (!persistenceEnabled()) return;
  if (SUBSCRIPTIONS.has(tenantId)) return;
  const existing = await repo.get(tenantId);
  const snapshot = existing ?? defaults(tenantId);
  SUBSCRIPTIONS.set(tenantId, snapshot);
  if (!existing) {
    await repo.upsert(snapshot);
  }
}

export function getSubscriptionForTenant(tenantId: string): SubscriptionSettings {
  const existing = SUBSCRIPTIONS.get(tenantId);
  if (existing) return { ...existing };
  const fallback = defaults(tenantId);
  SUBSCRIPTIONS.set(tenantId, fallback);
  return { ...fallback };
}

export async function setSubscriptionForTenant(
  tenantId: string,
  update: Partial<SubscriptionSettings>
): Promise<SubscriptionSettings> {
  const current = getSubscriptionForTenant(tenantId);
  const next: SubscriptionSettings = {
    ...current,
    ...update,
    tenantId,
  };
  SUBSCRIPTIONS.set(tenantId, next);
  if (persistenceEnabled()) {
    await repo.upsert(next);
  }
  return { ...next };
}

export interface SubscriptionCapSummary {
  tenantId: string;
  plan: SubscriptionPlan;
  killSwitch: boolean;
  secureTenant: boolean;
  maxMode: ProactivityMode;
}

export function getSubscriptionCap(tenantId: string): SubscriptionCapSummary {
  const settings = getSubscriptionForTenant(tenantId);
  const planCap = settings.maxOverride ?? getPlanMaxMode(settings.plan);
  const secureCap = settings.secureTenant ? Math.min(planCap, ProactivityMode.Proaktiv) as ProactivityMode : planCap;
  const maxMode = settings.killSwitch ? ProactivityMode.Usynlig : secureCap;
  return {
    tenantId,
    plan: settings.plan,
    killSwitch: Boolean(settings.killSwitch),
    secureTenant: Boolean(settings.secureTenant),
    maxMode,
  };
}

export function resetSubscriptionState() {
  SUBSCRIPTIONS.clear();
}

export async function listSubscriptions(): Promise<SubscriptionSettings[]> {
  if (persistenceEnabled()) {
    const rows = await repo.list();
    rows.forEach(row => SUBSCRIPTIONS.set(row.tenantId, row));
  }
  return Array.from(SUBSCRIPTIONS.values()).map(s => ({ ...s }));
}
