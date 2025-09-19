import type { ProactivityMode } from '../proactivity/modes';

export type SubscriptionPlan = 'flex' | 'secure' | 'enterprise';

export interface SubscriptionSettings {
  tenantId: string;
  plan: SubscriptionPlan;
  killSwitch?: boolean;
  secureTenant?: boolean;
  maxOverride?: ProactivityMode;
}

export interface SubscriptionEntitlement {
  plan: SubscriptionPlan;
  maxMode: ProactivityMode;
}
