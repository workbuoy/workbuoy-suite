import { prisma as defaultClient } from '../../core/db/prisma';
import type { FeatureDef } from '../types';

type FeatureRecord = {
  id: string;
  title: string;
  description?: string | null;
  defaultAutonomyCap: number;
  capabilities: string[];
  metadata: Record<string, any> | null;
};

function toRecord(feature: FeatureDef): FeatureRecord {
  const { id, title, description, defaultAutonomyCap, capabilities, ...rest } = feature;
  const metadata = rest && Object.keys(rest).length ? rest : null;
  return {
    id,
    title,
    description: description ?? null,
    defaultAutonomyCap: defaultAutonomyCap ?? 3,
    capabilities: capabilities ?? [],
    metadata,
  };
}

function fromRecord(row: any): FeatureDef {
  const metadata = (row?.metadata as Partial<FeatureDef> | undefined) ?? {};
  return {
    ...metadata,
    id: row.id,
    title: row.title ?? metadata.title ?? row.id,
    description: row.description ?? metadata.description,
    defaultAutonomyCap: row.defaultAutonomyCap ?? metadata.defaultAutonomyCap ?? 3,
    capabilities: row.capabilities ?? metadata.capabilities ?? [],
  };
}

export class FeatureRepo {
  constructor(private client: typeof defaultClient = defaultClient) {}

  async listFeatures(): Promise<FeatureDef[]> {
    const rows = await (this.client as any).feature.findMany({ orderBy: { id: 'asc' } });
    return rows.map(fromRecord);
  }

  async getFeature(id: string): Promise<FeatureDef | undefined> {
    const row = await (this.client as any).feature.findUnique({ where: { id } });
    return row ? fromRecord(row) : undefined;
  }

  async upsertFeature(feature: FeatureDef): Promise<void> {
    const data = toRecord(feature);
    await (this.client as any).feature.upsert({
      where: { id: data.id },
      create: data,
      update: { ...data },
    });
  }

  async upsertMany(features: FeatureDef[]): Promise<void> {
    if (!features.length) return;
    await (this.client as any).$transaction(
      features.map(feature => {
        const data = toRecord(feature);
        return (this.client as any).feature.upsert({
          where: { id: data.id },
          create: data,
          update: { ...data },
        });
      })
    );
  }
}
