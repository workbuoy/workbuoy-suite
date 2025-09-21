/* eslint-disable @typescript-eslint/no-var-requires */
import type { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

type PrismaModule = typeof import('@prisma/client');

type PrismaClientConstructor = new (...args: unknown[]) => PrismaClient;

let PrismaClientCtor: PrismaClientConstructor | undefined;

try {
  const mod = require('@prisma/client') as PrismaModule;
  PrismaClientCtor = mod.PrismaClient as PrismaClientConstructor;
} catch (error) {
  if (process.env.FF_PERSISTENCE === 'true') {
    throw error;
  }
}

function createNoopClient(): PrismaClient {
  const message = 'Prisma client is not available. Install @prisma/client or disable FF_PERSISTENCE.';
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

const prismaInstance = PrismaClientCtor ? new PrismaClientCtor() : createNoopClient();

export const prisma: PrismaClient = global.__prisma__ ?? prismaInstance;

if (process.env.NODE_ENV !== 'production') global.__prisma__ = prisma;
