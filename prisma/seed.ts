import { createRequire } from 'node:module';

const backendRequire = createRequire(new URL('../backend/package.json', import.meta.url));
const { Prisma, PrismaClient } = backendRequire('@prisma/client') as typeof import('@prisma/client');

type Model = Prisma.DMMF.Model;
type Field = Prisma.DMMF.Field;

const prisma = new PrismaClient();
const models = Prisma.dmmf.datamodel.models;

const findModel = (name: string): Model | undefined =>
  models.find((model) => model.name === name);

const lowerCamel = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);

const getDelegate = (name: string) => (prisma as Record<string, any>)[lowerCamel(name)];

const findField = (model: Model | undefined, matcher: (field: Field) => boolean) =>
  model?.fields.find(matcher);

async function seedOrg() {
  const orgModel = findModel('Org');
  if (!orgModel) return null;

  const slugField = findField(orgModel, (field) => field.name === 'slug');
  const nameField = findField(orgModel, (field) => field.name === 'name' || field.name === 'title');
  if (!slugField || !nameField) return null;

  const orgDelegate = getDelegate('Org');
  if (!orgDelegate?.upsert) return null;

  const data: Record<string, any> = {
    [slugField.name]: 'demo',
    [nameField.name]: 'Workbuoy Demo',
  };

  try {
    return await orgDelegate.upsert({
      where: { [slugField.name]: 'demo' },
      update: data,
      create: data,
    });
  } catch (error) {
    console.warn('Skipping org seed:', (error as Error).message);
    return null;
  }
}

async function seedLead() {
  const leadModel = findModel('Lead');
  if (!leadModel) return null;

  const emailField = findField(leadModel, (field) => field.name === 'email');
  const nameField = findField(leadModel, (field) => field.name === 'name');
  if (!emailField && !nameField) return null;

  const leadDelegate = getDelegate('Lead');
  if (!leadDelegate?.create) return null;

  const data: Record<string, any> = {};
  if (emailField) data[emailField.name] = 'alice@example.com';
  if (nameField) data[nameField.name] = 'Alice Example';

  try {
    if (emailField && leadDelegate.findFirst) {
      const existing = await leadDelegate.findFirst({
        where: { [emailField.name]: 'alice@example.com' },
      });
      if (existing) return existing;
    }

    return await leadDelegate.create({ data });
  } catch (error) {
    console.warn('Skipping lead seed:', (error as Error).message);
    return null;
  }
}

async function seedTask(lead: Record<string, any> | null) {
  const taskModel = findModel('Task');
  if (!taskModel) return null;

  const taskDelegate = getDelegate('Task');
  if (!taskDelegate?.create) return null;

  const titleField = findField(taskModel, (field) => field.name === 'title');
  if (!titleField) return null;

  const data: Record<string, any> = {
    [titleField.name]: 'Demo Task',
  };

  const statusField = findField(taskModel, (field) => field.name === 'status');
  if (statusField) data[statusField.name] = 'todo';

  if (lead) {
    const relationField = findField(
      taskModel,
      (field) => field.kind === 'object' && field.type === 'Lead'
    );

    if (relationField) {
      const leadModel = findModel('Lead');
      const leadIdField = findField(leadModel, (field) => field.isId) ??
        findField(leadModel, (field) => field.isUnique && field.name === 'email');

      if (leadIdField && lead[leadIdField.name] !== undefined) {
        data[relationField.name] = {
          connect: {
            [leadIdField.name]: lead[leadIdField.name],
          },
        };
      }
    }
  }

  try {
    return await taskDelegate.create({ data });
  } catch (error) {
    console.warn('Skipping task seed:', (error as Error).message);
    return null;
  }
}

async function seedLog() {
  const logModel = findModel('Log') ?? findModel('LogEntry');
  if (!logModel) return null;

  const messageField = findField(
    logModel,
    (field) => field.name === 'message' || field.name === 'msg'
  );
  if (!messageField) return null;

  const logDelegate = getDelegate(logModel.name);
  if (!logDelegate?.create) return null;

  const data: Record<string, any> = {
    [messageField.name]: 'Seed: demo data',
  };

  const timestampField = findField(
    logModel,
    (field) =>
      (field.name === 'timestamp' || field.name === 'ts' || field.name === 'createdAt') &&
      !field.hasDefaultValue
  );
  if (timestampField) data[timestampField.name] = new Date();

  try {
    return await logDelegate.create({ data });
  } catch (error) {
    console.warn('Skipping log seed:', (error as Error).message);
    return null;
  }
}

async function main() {
  const org = await seedOrg();
  const lead = await seedLead();
  await seedTask(lead);
  await seedLog();

  if (org) {
    console.log('Seeded demo org:', org);
  }
  if (lead) {
    console.log('Seeded lead:', lead);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
