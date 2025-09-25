/* eslint-disable @typescript-eslint/no-var-requires */
import type { PrismaClient } from '@prisma/client';
import { envBool } from '../env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

type PrismaModule = typeof import('@prisma/client');

type PrismaClientConstructor = new (...args: unknown[]) => PrismaClient;

let PrismaClientCtor: PrismaClientConstructor | undefined;

function loadPrismaCtor(): PrismaClientConstructor | undefined {
  if (PrismaClientCtor) {
    return PrismaClientCtor;
  }
  try {
    const mod = require('@prisma/client') as PrismaModule;
    PrismaClientCtor = mod.PrismaClient as PrismaClientConstructor;
    return PrismaClientCtor;
  } catch (error) {
    if (process.env.FF_PERSISTENCE === 'true') {
      throw error;
    }
    return undefined;
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
  return new Proxy({}, handler) as unknown as PrismaClient;
}

const noopClient = createNoopClient();
let realClient: PrismaClient | null = null;

function resolveClient(): PrismaClient {
  if (envBool('FF_PERSISTENCE', false)) {
    if (!realClient) {
      const ctor = loadPrismaCtor();
      if (!ctor) {
        throw new Error('Prisma client is not available. Install @prisma/client or disable FF_PERSISTENCE.');
      }
      if (global.__prisma__ && global.__prisma__ !== noopClient) {
        realClient = global.__prisma__;
      } else {
        realClient = new ctor();
        if (process.env.NODE_ENV !== 'production') {
          global.__prisma__ = realClient;
        }
      }
    }
    return realClient;
  }
  if (process.env.NODE_ENV !== 'production') {
    global.__prisma__ = noopClient;
  }
  return noopClient;
}

export const prisma: PrismaClient = new Proxy(noopClient, {
  get(_target, prop, receiver) {
    const client = resolveClient();
    const value = Reflect.get(client as unknown as Record<string, unknown>, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  set(_target, prop, value, receiver) {
    const client = resolveClient();
    return Reflect.set(client as unknown as Record<string, unknown>, prop, value, receiver);
  },
});
