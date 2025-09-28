import type { PrismaClient } from '@prisma/client';

const dryRun = process.argv.includes('--dry-run');
const inProduction = process.env.NODE_ENV === 'production';
const allowSeed = process.env.SEED === 'true' || !inProduction;

let prisma: PrismaClient | undefined;

async function main() {
  if (!allowSeed) {
    console.log('[seed] Skipping (production environment without SEED=true)');
    return;
  }

  if (dryRun) {
    console.log('[seed] Dry run requested — no changes will be written');
    return;
  }

  if (process.env.SEED !== 'true') {
    process.env.SEED = 'true';
  }

  const prismaModule = await import('../src/db/prisma.js');
  prisma = prismaModule.default;

  const results = await prisma.$transaction(async (tx) => {
    const systemTenant = await tx.tenant.upsert({
      where: { slug: 'system' },
      create: { slug: 'system', name: 'System' },
      update: { name: 'System' },
    });

    const adminRole = await tx.role.upsert({
      where: { role_id: 'admin' },
      create: {
        role_id: 'admin',
        title: 'Administrator',
        inherits: [],
        featureCaps: {},
        scopeHints: {},
        profile: {},
      },
      update: {
        title: 'Administrator',
      },
    });

    const crmFeature = await tx.feature.upsert({
      where: { id: 'crm-core' },
      create: {
        id: 'crm-core',
        title: 'CRM Core',
        description: 'Baseline pipeline and contact management features',
        capabilities: ['pipelines.read', 'pipelines.write', 'contacts.read', 'contacts.write'],
        defaultAutonomyCap: 3,
        metadata: { seeded: true },
      },
      update: {
        title: 'CRM Core',
        capabilities: ['pipelines.read', 'pipelines.write', 'contacts.read', 'contacts.write'],
      },
    });

    await tx.roleBinding.deleteMany({
      where: {
        tenantId: systemTenant.id,
        role: 'admin',
        group: 'system-admins',
      },
    });

    const binding = await tx.roleBinding.create({
      data: {
        tenantId: systemTenant.id,
        role: 'admin',
        group: 'system-admins',
      },
    });

    return { systemTenant, adminRole, crmFeature, binding };
  });

  console.log(`[seed] Tenant ready: ${results.systemTenant.slug}`);
  console.log(`[seed] Role ready: ${results.adminRole.role_id}`);
  console.log(`[seed] Feature ready: ${results.crmFeature.id}`);
  console.log('[seed] Seeded admin role binding for group "system-admins"');
}

main()
  .then(() => {
    console.log('[seed] Done (idempotent)');
  })
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
