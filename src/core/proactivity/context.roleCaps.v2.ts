export type EffectiveContext = {
  requested: number;
  caps: { role?: number; feature?: number; subscription?: number; tenant?: number };
  basis: string[];
};

export function computeEffectiveModeV2(input: { requested: number; roleCap?: number; featureCap?: number; subscriptionCap?: number; tenantCap?: number; flags?: { killSwitch?: boolean; secureTenant?: boolean } }): EffectiveContext {
  const basis: string[] = [];
  const caps = {
    role: input.roleCap ?? Infinity,
    feature: input.featureCap ?? Infinity,
    subscription: input.subscriptionCap ?? Infinity,
    tenant: input.tenantCap ?? Infinity
  };
  if (Number.isFinite(caps.role)) basis.push(`roleCap=${caps.role}`);
  if (Number.isFinite(caps.feature)) basis.push(`featureCap=${caps.feature}`);
  if (Number.isFinite(caps.subscription)) basis.push(`tenantPlanCap=${caps.subscription}`);
  if (Number.isFinite(caps.tenant)) basis.push(`tenantPolicyCap=${caps.tenant}`);
  if (input.flags?.killSwitch) basis.push('kill');
  if (input.flags?.secureTenant) basis.push('secureTenant');

  const requested = input.requested;
  let eff = Math.min(requested, caps.role, caps.feature, caps.subscription, caps.tenant);
  if (input.flags?.killSwitch) eff = Math.min(eff, 0);
  if (input.flags?.secureTenant) eff = Math.min(eff, 3);

  return { requested, caps, basis: basis.concat([`effective=${eff}`]) };
}
