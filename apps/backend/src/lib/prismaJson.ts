// Centralize JSON portability for Prisma clients from the backend package.
export const toPrismaJson = (value: unknown): unknown =>
  value === null ? null : value;
