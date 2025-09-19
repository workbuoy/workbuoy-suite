import { ProactivityMode } from '../proactivity/modes';
import { DEFAULT_SUBSCRIPTION_PLAN, getPlanMaxMode } from './entitlements';
import type { SubscriptionPlan, SubscriptionSettings } from './types';

const SUBSCRIPTIONS = new Map<string, SubscriptionSettings>();

export function getSubscriptionForTenant(tenantId: string): SubscriptionSettings {
  const existing = SUBSCRIPTIONS.get(tenantId);
  if (existing) return { ...existing };
  return { tenantId, plan: DEFAULT_SUBSCRIPTION_PLAN, killSwitch: false, secureTenant: false };
}

export function setSubscriptionForTenant(tenantId: string, update: Partial<SubscriptionSettings>): SubscriptionSettings {
  const current = getSubscriptionForTenant(tenantId);
  const next: SubscriptionSettings = {
    ...current,
    ...update,
    tenantId,
  };
  SUBSCRIPTIONS.set(tenantId, next);
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

export function listSubscriptions() {
  return Array.from(SUBSCRIPTIONS.values()).map(s => ({ ...s }));
}
