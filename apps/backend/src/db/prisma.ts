import { createRequire } from 'node:module';
import type { PrismaClient } from '@prisma/client';

const require = createRequire(import.meta.url);

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

type PrismaClientConstructor = new (...args: unknown[]) => PrismaClient;

let PrismaClientCtor: PrismaClientConstructor | undefined;

function envBool(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function loadPrismaCtor(): PrismaClientConstructor | undefined {
  if (PrismaClientCtor) {
    return PrismaClientCtor;
  }
  try {
    const mod = require('@prisma/client') as { PrismaClient: PrismaClientConstructor };
    PrismaClientCtor = mod.PrismaClient;
    return PrismaClientCtor;
  } catch (error) {
    if (envBool('FF_PERSISTENCE', false)) {
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
      const globalRef = globalThis as typeof globalThis & { __prisma__?: PrismaClient };
      if (globalRef.__prisma__ && globalRef.__prisma__ !== noopClient) {
        realClient = globalRef.__prisma__;
      } else {
        realClient = new ctor();
        if (process.env.NODE_ENV !== 'production') {
          globalRef.__prisma__ = realClient;
        }
      }
    }
    return realClient;
  }
  if (process.env.NODE_ENV !== 'production') {
    (globalThis as typeof globalThis & { __prisma__?: PrismaClient }).__prisma__ = noopClient;
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
