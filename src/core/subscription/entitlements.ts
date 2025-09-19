import { ProactivityMode } from '../proactivity/modes';
import type { SubscriptionEntitlement, SubscriptionPlan } from './types';

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = 'flex';

export const PLAN_ENTITLEMENTS: Record<SubscriptionPlan, SubscriptionEntitlement> = {
  flex: { plan: 'flex', maxMode: ProactivityMode.Ambisiøs },
  secure: { plan: 'secure', maxMode: ProactivityMode.Proaktiv },
  enterprise: { plan: 'enterprise', maxMode: ProactivityMode.Tsunami },
};

export function getPlanMaxMode(plan: SubscriptionPlan): ProactivityMode {
  return PLAN_ENTITLEMENTS[plan]?.maxMode ?? ProactivityMode.Proaktiv;
}

export function isSubscriptionPlan(plan: string | undefined): plan is SubscriptionPlan {
  return plan === 'flex' || plan === 'secure' || plan === 'enterprise';
}
