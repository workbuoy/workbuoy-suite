// Centralize JSON portability for Prisma (v6+ clients can emit variations)
export const toPrismaJson = (value: unknown): any =>
  value === null ? (null as any) : (value as any);
