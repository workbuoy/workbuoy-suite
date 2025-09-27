import { prisma } from '../../core/db/prisma';
import type { FeatureDef } from '../types';

const toPrismaJson = (value: unknown): any => (value === null ? (null as any) : (value as any));

type FeatureRow = {
  id: string;
  title: string;
  description: string | null;
  defaultAutonomyCap: number | null;
  capabilities: FeatureDef['capabilities'];
};

function mapRowToFeature(row: FeatureRow): FeatureDef {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    defaultAutonomyCap: (row.defaultAutonomyCap as FeatureDef['defaultAutonomyCap']) ?? undefined,
    capabilities: row.capabilities,
  };
}

export class FeatureRepo {
  async list(): Promise<FeatureDef[]> {
    const rows = await prisma.feature.findMany({ orderBy: { id: 'asc' } });
    return rows.map(mapRowToFeature);
  }

  async upsert(feature: FeatureDef): Promise<FeatureDef> {
    const row = await prisma.feature.upsert({
      where: { id: feature.id },
      create: {
        id: feature.id,
        title: feature.title,
        description: feature.description,
        defaultAutonomyCap: feature.defaultAutonomyCap ?? 3,
        capabilities: feature.capabilities,
        metadata: toPrismaJson({ ...feature }),
      },
      update: {
        title: feature.title,
        description: feature.description,
        defaultAutonomyCap: feature.defaultAutonomyCap ?? 3,
        capabilities: feature.capabilities,
        metadata: toPrismaJson({ ...feature }),
      },
    });
    return mapRowToFeature(row);
  }

  async upsertMany(features: FeatureDef[]): Promise<number> {
    if (!features.length) return 0;
    await prisma.$transaction(features.map(feature =>
      prisma.feature.upsert({
        where: { id: feature.id },
        create: {
          id: feature.id,
          title: feature.title,
          description: feature.description,
          defaultAutonomyCap: feature.defaultAutonomyCap ?? 3,
          capabilities: feature.capabilities,
          metadata: toPrismaJson({ ...feature }),
        },
        update: {
          title: feature.title,
          description: feature.description,
          defaultAutonomyCap: feature.defaultAutonomyCap ?? 3,
          capabilities: feature.capabilities,
          metadata: toPrismaJson({ ...feature }),
        },
      })
    ));
    return features.length;
  }
}
