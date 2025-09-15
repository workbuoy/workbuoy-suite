export const ENV = {
  KILL_SWITCH_ALL: process.env.KILL_SWITCH_ALL === '1' || process.env.KILL_SWITCH_ALL === 'true',
  // Per-tenant kill switch: KILL_SWITCH_TENANT_<TENANTID>=1
  isTenantKillSwitch(tenantId: string) {
    const key = `KILL_SWITCH_TENANT_${tenantId}`;
    const v = process.env[key];
    return v === '1' || v === 'true';
  }
};
