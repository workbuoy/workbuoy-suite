import { Counter, Histogram, Registry } from 'prom-client';
import { ensureDefaultMetrics, getRegistry } from './registry.js';

type BaseCfg = {
  name: string;
  help: string;
  labelNames?: string[];
  registers?: Registry[]; // tolerer forskjeller i prom-client-typinger
};

export function createCounter(cfg: BaseCfg) {
  const reg = (cfg.registers?.[0] as any) ?? getRegistry();
  ensureDefaultMetrics({ register: reg as any });
  return new Counter({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    registers: (cfg.registers ?? [reg]) as any,
  } as any);
}

export function createHistogram(cfg: BaseCfg & { buckets?: number[] }) {
  const reg = (cfg.registers?.[0] as any) ?? getRegistry();
  ensureDefaultMetrics({ register: reg as any });
  return new Histogram({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    buckets: cfg.buckets,
    registers: (cfg.registers ?? [reg]) as any,
  } as any);
}
