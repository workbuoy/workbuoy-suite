declare module '@prisma/client' {
  export type FeatureUsageAction = 'open' | 'complete' | 'dismiss';

  export type Feature = Record<string, any>;
  export type Role = Record<string, any>;
  export type OrgRoleOverride = Record<string, any>;
  export type UserRole = Record<string, any>;
  export type FeatureUsage = Record<string, any>;

  export namespace Prisma {
    export type InputJsonValue = unknown;
    export type RoleUpsertArgs = { create: any; update: any };
    export type FeatureUpsertArgs = { create: any; update: any };
    export type OrgRoleOverrideUpsertArgs = { create: any; update: any };
    export type UserRoleUpsertArgs = { create: any; update: any };
  }

  export class PrismaClient {
    constructor(...args: unknown[]);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(actions: Array<Promise<T>>): Promise<T[]>;
    feature: {
      findMany(args?: any): Promise<Feature[]>;
      upsert(args: any): Promise<Feature>;
    };
    role: {
      findMany(args?: any): Promise<Role[]>;
      findUnique(args: any): Promise<Role | null>;
      upsert(args: any): Promise<Role>;
      deleteMany(args?: any): Promise<{ count?: number }>;
    };
    orgRoleOverride: {
      findMany(args?: any): Promise<OrgRoleOverride[]>;
      findUnique(args: any): Promise<OrgRoleOverride | null>;
      upsert(args: any): Promise<OrgRoleOverride>;
      deleteMany(args?: any): Promise<{ count?: number }>;
    };
    userRole: {
      findMany(args?: any): Promise<UserRole[]>;
      findUnique(args: any): Promise<UserRole | null>;
      upsert(args: any): Promise<UserRole>;
      deleteMany(args?: any): Promise<{ count?: number }>;
    };
    featureUsage: {
      create(args: any): Promise<FeatureUsage>;
      groupBy(args: any): Promise<Array<{ featureId: string; _count: { _all: number } }>>;
      deleteMany(args?: any): Promise<{ count?: number }>;
    };
    roleBinding: {
      findFirst(args: any): Promise<{ role: string } | null>;
    };
    [model: string]: any;
  }
}
