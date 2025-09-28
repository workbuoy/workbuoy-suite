import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function parseLog(): PrismaClient['$on'] extends never ? never : any {
  const raw = (process.env.PRISMA_LOG ?? '').trim();
  if (!raw) {
    return undefined as any;
  }
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) as any;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: parseLog(),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
