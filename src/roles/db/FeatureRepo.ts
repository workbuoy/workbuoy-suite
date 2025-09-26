import { Prisma } from '@prisma/client';
import { prisma } from '../../core/db/prisma';
import type { FeatureDef } from '../types';

interface FeatureRow {
  id: string;
  title: string;
  description: string | null;
  defaultAutonomyCap: number | null;
  capabilities: FeatureDef['capabilities'];
}

function toJson(value: unknown): Prisma.JsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.JsonValue;
}

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
        metadata: toJson({ ...feature }),
      },
      update: {
        title: feature.title,
        description: feature.description,
        defaultAutonomyCap: feature.defaultAutonomyCap ?? 3,
        capabilities: feature.capabilities,
        metadata: toJson({ ...feature }),
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
          metadata: toJson({ ...feature }),
        },
        update: {
          title: feature.title,
          description: feature.description,
          defaultAutonomyCap: feature.defaultAutonomyCap ?? 3,
          capabilities: feature.capabilities,
          metadata: toJson({ ...feature }),
        },
      })
    ));
    return features.length;
  }
}
