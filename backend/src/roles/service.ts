import { Prisma, PrismaClient } from '@prisma/client';

type RoleInput = {
  role_id?: string;
  roleId?: string;
  id?: string;
  title?: string;
  inherits?: string[];
  feature_caps?: Record<string, unknown>;
  featureCaps?: Record<string, unknown>;
  scope_hints?: Record<string, unknown>;
  scopeHints?: Record<string, unknown>;
};

type FeatureInput = {
  id?: string;
  feature_id?: string;
  title?: string;
  name?: string;
  description?: string;
  default_autonomy_cap?: number | null;
  defaultAutonomyCap?: number | null;
  capabilities?: string[];
};

export type ImportResult = {
  roles: number;
  features: number;
};

const prisma = new PrismaClient();
const models = Prisma.dmmf.datamodel.models;

function lowerCamel(name: string) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function findModel(...candidates: string[]) {
  for (const name of candidates) {
    const model = models.find((m) => m.name === name);
    if (model) return model;
  }
  return undefined;
}

function findField(model: Prisma.DMMF.Model | undefined, matcher: (field: Prisma.DMMF.Field) => boolean) {
  return model?.fields.find(matcher);
}

export async function importRolesAndFeatures(roles: RoleInput[], features: FeatureInput[]): Promise<ImportResult> {
  const summary: ImportResult = { roles: 0, features: 0 };

  const roleModel = findModel('Role', 'Roles');
  if (roleModel) {
    const roleDelegate = (prisma as Record<string, any>)[lowerCamel(roleModel.name)];
    const idField =
      findField(roleModel, (field) => field.isId) ??
      findField(roleModel, (field) => field.name === 'role_id' || field.name === 'roleId');
    const titleField = findField(roleModel, (field) => field.name === 'title' || field.name === 'name');
    const inheritsField = findField(roleModel, (field) => field.name === 'inherits');
    const capsField =
      findField(roleModel, (field) => field.name === 'feature_caps' || field.name === 'featureCaps');
    const hintsField = findField(roleModel, (field) => field.name === 'scope_hints' || field.name === 'scopeHints');

    if (roleDelegate?.upsert && idField) {
      for (const role of roles) {
        const roleId = role.role_id ?? role.roleId ?? role.id;
        if (!roleId) continue;
        const data: Record<string, unknown> = {};
        if (titleField) data[titleField.name] = role.title ?? roleId;
        if (inheritsField) data[inheritsField.name] = Array.isArray(role.inherits) ? role.inherits : [];
        if (capsField)
          data[capsField.name] =
            typeof role.feature_caps === 'object' && role.feature_caps
              ? role.feature_caps
              : typeof role.featureCaps === 'object' && role.featureCaps
              ? role.featureCaps
              : {};
        if (hintsField)
          data[hintsField.name] =
            typeof role.scope_hints === 'object' && role.scope_hints
              ? role.scope_hints
              : typeof role.scopeHints === 'object' && role.scopeHints
              ? role.scopeHints
              : {};
        try {
          await roleDelegate.upsert({
            where: { [idField.name]: roleId },
            update: data,
            create: { [idField.name]: roleId, ...data },
          });
          summary.roles += 1;
        } catch (error) {
          console.warn('[importRolesAndFeatures] role upsert failed:', error);
        }
      }
    }
  }

  const featureModel = findModel('Feature', 'Features');
  if (featureModel) {
    const featureDelegate = (prisma as Record<string, any>)[lowerCamel(featureModel.name)];
    const idField =
      findField(featureModel, (field) => field.isId) ??
      findField(featureModel, (field) => field.name === 'id' || field.name === 'feature_id');
    const titleField = findField(featureModel, (field) => field.name === 'title' || field.name === 'name');
    const descriptionField = findField(featureModel, (field) => field.name === 'description');
    const autonomyField =
      findField(featureModel, (field) => field.name === 'default_autonomy_cap' || field.name === 'defaultAutonomyCap');
    const capabilitiesField = findField(featureModel, (field) => field.name === 'capabilities');

    if (featureDelegate?.upsert && idField) {
      for (const feature of features) {
        const featureId = feature.id ?? feature.feature_id;
        if (!featureId) continue;
        const data: Record<string, unknown> = {};
        if (titleField) data[titleField.name] = feature.title ?? feature.name ?? featureId;
        if (descriptionField) data[descriptionField.name] = feature.description ?? '';
        if (autonomyField)
          data[autonomyField.name] =
            feature.default_autonomy_cap ?? feature.defaultAutonomyCap ?? null;
        if (capabilitiesField)
          data[capabilitiesField.name] = Array.isArray(feature.capabilities) ? feature.capabilities : [];
        try {
          await featureDelegate.upsert({
            where: { [idField.name]: featureId },
            update: data,
            create: { [idField.name]: featureId, ...data },
          });
          summary.features += 1;
        } catch (error) {
          console.warn('[importRolesAndFeatures] feature upsert failed:', error);
        }
      }
    }
  }

  return summary;
}
