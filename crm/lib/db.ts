import { createRequire } from 'node:module';
import type { PrismaClient } from '@prisma/client';

const require = createRequire(import.meta.url);

declare global {
  // eslint-disable-next-line no-var
  var __crm_prisma__: PrismaClient | undefined;
}

type PrismaModule = typeof import('@prisma/client');

class InMemoryPrisma {
  #users = new Map<string, { id: string; email: string; name: string | null }>();

  user = {
    findMany: async () => Array.from(this.#users.values()),
    upsert: async ({ where, update, create }: any) => {
      const id = create?.id ?? where?.id ?? create?.email ?? `user-${this.#users.size + 1}`;
      const existing = this.#users.get(id) ?? null;
      const next = existing
        ? { ...existing, ...update }
        : {
            id,
            email: create?.email ?? id,
            name: create?.name ?? null,
          };
      this.#users.set(id, next);
      return next;
    },
  };
}

let realClient: PrismaClient | undefined;

function loadRealClient(): PrismaClient | undefined {
  if (realClient) {
    return realClient;
  }
  try {
    const mod = require('@prisma/client') as PrismaModule;
    const Ctor = mod.PrismaClient as new () => PrismaClient;
    realClient = new Ctor();
    if (process.env.NODE_ENV !== 'production') {
      global.__crm_prisma__ = realClient;
    }
    return realClient;
  } catch (error) {
    if (process.env.FF_PERSISTENCE === 'true') {
      throw error;
    }
    return undefined;
  }
}

const inMemory = new InMemoryPrisma();

function resolveClient(): PrismaClient {
  if (process.env.FF_PERSISTENCE === 'true') {
    const client = loadRealClient();
    if (!client) {
      throw new Error('Prisma client unavailable while FF_PERSISTENCE=true');
    }
    return client;
  }

  if (global.__crm_prisma__) {
    return global.__crm_prisma__;
  }

  const proxy = new Proxy(inMemory as unknown as PrismaClient, {
    get(target, prop, receiver) {
      const value = Reflect.get(target as unknown as Record<string, unknown>, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  if (process.env.NODE_ENV !== 'production') {
    global.__crm_prisma__ = proxy;
  }
  return proxy;
}

export const prisma: PrismaClient = resolveClient();
