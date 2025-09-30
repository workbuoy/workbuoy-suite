// Mirror the shared Prisma JSON helper locally so we don't depend on workspace internals
export const toPrismaJson = (value: unknown): any =>
  value === null ? (null as any) : (value as any);
