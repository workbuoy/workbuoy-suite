/* eslint-disable @typescript-eslint/no-var-requires */
import type { PrismaClient } from '@prisma/client';

type PrismaModule = typeof import('@prisma/client');

let PrismaClientCtor: (new (...args: unknown[]) => PrismaClient) | undefined;

try {
  const mod = require('@prisma/client') as PrismaModule;
  PrismaClientCtor = mod.PrismaClient as new (...args: unknown[]) => PrismaClient;
} catch (error) {
  if (process.env.FF_PERSISTENCE === 'true') {
    throw error;
  }
}

function createNoopClient(): PrismaClient {
  const message = 'Prisma client unavailable; install @prisma/client or disable FF_PERSISTENCE to use in-memory mode.';
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
  return new Proxy({}, handler) as PrismaClient;
}

export const prisma: PrismaClient = PrismaClientCtor ? new PrismaClientCtor() : createNoopClient();
