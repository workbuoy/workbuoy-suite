import type { Prisma } from '@prisma/client';

type JsonInput = Prisma.InputJsonValue;
type JsonOutput = Prisma.JsonValue;

type RoleUpsert = Prisma.RoleUpsertArgs;
type FeatureUpsert = Prisma.FeatureUpsertArgs;
type OrgOverrideUpsert = Prisma.OrgRoleOverrideUpsertArgs;
type UserRoleUpsert = Prisma.UserRoleUpsertArgs;

declare const jsonInput: JsonInput;

declare const roleUpsertArgs: RoleUpsert;
declare const featureUpsertArgs: FeatureUpsert;
declare const orgOverrideUpsertArgs: OrgOverrideUpsert;
declare const userRoleUpsertArgs: UserRoleUpsert;
declare const jsonOutput: JsonOutput;

const _roleUpsertArgs = {
  where: { role_id: 'role-id' },
  update: {
    title: 'Role Title',
    inherits: ['base-role'],
    featureCaps: jsonInput,
    scopeHints: jsonInput,
    profile: jsonInput,
  },
  create: {
    role_id: 'role-id',
    title: 'Role Title',
    inherits: ['base-role'],
    featureCaps: jsonInput,
    scopeHints: jsonInput,
    profile: jsonInput,
  },
} satisfies RoleUpsert;

const _featureUpsertArgs = {
  where: { id: 'feature-id' },
  update: {
    title: 'Feature Title',
    description: 'A helpful capability',
    defaultAutonomyCap: 3,
    capabilities: ['capability'],
    metadata: jsonInput,
  },
  create: {
    id: 'feature-id',
    title: 'Feature Title',
    description: 'A helpful capability',
    defaultAutonomyCap: 3,
    capabilities: ['capability'],
    metadata: jsonInput,
  },
} satisfies FeatureUpsert;

const _orgOverrideUpsertArgs = {
  where: { tenant_id_role_id: { tenant_id: 'tenant', role_id: 'role' } },
  update: {
    featureCaps: jsonInput,
    disabledFeatures: ['feature-a'],
  },
  create: {
    tenant_id: 'tenant',
    role_id: 'role',
    featureCaps: jsonInput,
    disabledFeatures: ['feature-a'],
  },
} satisfies OrgOverrideUpsert;

const _userRoleUpsertArgs = {
  where: { user_id: 'user' },
  update: {
    tenant_id: 'tenant',
    primaryRole: 'role',
    secondaryRoles: ['role-b'],
  },
  create: {
    user_id: 'user',
    tenant_id: 'tenant',
    primaryRole: 'role',
    secondaryRoles: ['role-b'],
  },
} satisfies UserRoleUpsert;

void roleUpsertArgs;
void featureUpsertArgs;
void orgOverrideUpsertArgs;
void userRoleUpsertArgs;
void jsonOutput;
void _roleUpsertArgs;
void _featureUpsertArgs;
void _orgOverrideUpsertArgs;
void _userRoleUpsertArgs;

export {};
