import { persistenceEnabled } from '../config/dbFlag';

let PrismaClientCtor: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ PrismaClient: PrismaClientCtor } = require('@prisma/client'));
} catch (err) {
  PrismaClientCtor = null;
}

function createStub() {
  return new Proxy(
    {},
    {
      get() {
        if (persistenceEnabled()) {
          throw new Error('Persistence requires @prisma/client. Run `npx prisma generate` before enabling FF_PERSISTENCE.');
        }
        throw new Error('Prisma client is not available in memory mode.');
      },
    }
  );
}

const prismaInstance: any = (() => {
  if (!PrismaClientCtor) {
    return createStub();
  }
  const existing = (global as any).__prisma__;
  if (existing) return existing;
  const client = new PrismaClientCtor();
  if (process.env.NODE_ENV !== 'production') {
    (global as any).__prisma__ = client;
  }
  return client;
})();

export const prisma = prismaInstance;
