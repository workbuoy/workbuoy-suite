import { prisma as defaultClient } from '../../db/prisma';
import type { SubscriptionSettings } from '../types';

function toRecord(settings: SubscriptionSettings) {
  return {
    tenantId: settings.tenantId,
    plan: settings.plan,
    killSwitch: Boolean(settings.killSwitch),
    secureTenant: Boolean(settings.secureTenant),
    maxOverride: settings.maxOverride ?? null,
  };
}

function fromRecord(row: any): SubscriptionSettings {
  return {
    tenantId: row.tenantId,
    plan: row.plan,
    killSwitch: Boolean(row.killSwitch),
    secureTenant: Boolean(row.secureTenant),
    maxOverride: row.maxOverride ?? undefined,
  };
}

export class SubscriptionRepo {
  constructor(private client: typeof defaultClient = defaultClient) {}

  async get(tenantId: string): Promise<SubscriptionSettings | undefined> {
    const row = await (this.client as any).subscriptionSetting.findUnique({ where: { tenantId } });
    return row ? fromRecord(row) : undefined;
  }

  async upsert(settings: SubscriptionSettings): Promise<SubscriptionSettings> {
    const data = toRecord(settings);
    const row = await (this.client as any).subscriptionSetting.upsert({
      where: { tenantId: data.tenantId },
      create: data,
      update: { ...data },
    });
    return fromRecord(row);
  }

  async list(): Promise<SubscriptionSettings[]> {
    const rows = await (this.client as any).subscriptionSetting.findMany();
    return rows.map(fromRecord);
  }
}
