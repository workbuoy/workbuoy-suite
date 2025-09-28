import type { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

function parseLogLevels(input: string | undefined): Prisma.LogLevel[] | undefined {
  if (!input) {
    return undefined;
  }
  const allowed: Prisma.LogLevel[] = ['info', 'query', 'warn', 'error'];
  const entries = input
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is Prisma.LogLevel => allowed.includes(item as Prisma.LogLevel));
  return entries.length > 0 ? entries : undefined;
}

function createClient(): PrismaClient {
  const log = parseLogLevels(process.env.PRISMA_LOG);
  return new PrismaClient({
    log,
  });
}

function createNoopClient(): PrismaClient {
  const message =
    'Prisma persistence is disabled. Enable FF_PERSISTENCE or run with SEED=true to allow database access.';
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {};
      }
      return () => {
        throw new Error(message);
      };
    },
  };
  return new Proxy({}, handler) as unknown as PrismaClient;
}

const shouldUseRealClient = (() => {
  if (process.env.SEED === 'true') {
    return true;
  }
  if (process.env.FF_PERSISTENCE === 'true') {
    return true;
  }
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return true;
  }
  return false;
})();

const prisma = shouldUseRealClient
  ? globalForPrisma.prisma ?? createClient()
  : createNoopClient();

if (shouldUseRealClient && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
