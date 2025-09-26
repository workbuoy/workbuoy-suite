import 'express';
import type { PrismaClient } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      [k: string]: unknown;
    }

    interface Request {
      /** set by auth middleware */
      user?: User;
      /** optional Workbuoy ctx */
      workbuoy?: { correlationId?: string; [k: string]: unknown };
    }

    interface Locals {
      prisma?: PrismaClient;
      storage?: { bucket?: unknown; [k: string]: unknown };
    }

    interface Application {
      locals: Locals;
    }
  }
}
export {};
