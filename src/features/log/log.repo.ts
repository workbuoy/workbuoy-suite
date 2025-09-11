import { prisma } from "../../core/db/prisma";

export async function listLogs(level?: string) {
  return prisma.logEntry.findMany({
    where: level ? { level } : undefined,
    orderBy: { ts: "desc" }
  });
}

export async function appendLog(entry: { ts?: string; level?: string; msg: string; meta?: any; hash: string; prevHash?: string }) {
  return prisma.logEntry.create({
    data: {
      ts: entry.ts ? new Date(entry.ts) : new Date(),
      level: entry.level ?? "info",
      msg: entry.msg,
      meta: entry.meta ?? {},
      hash: entry.hash,
      prevHash: entry.prevHash
    }
  });
}
