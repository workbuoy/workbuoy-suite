import { Counter, Histogram, Registry } from 'prom-client';
import { ensureDefaultMetrics, getRegistry } from './registry.js';

export type CounterConfig = {
  name: string;
  help: string;
  labelNames?: string[];
  registers?: Registry[];
};

export type HistogramConfig = CounterConfig & {
  buckets?: number[];
};

export function createCounter(cfg: CounterConfig) {
  const reg = (cfg.registers?.[0] as any) ?? getRegistry();
  ensureDefaultMetrics({ register: reg as any });
  return new Counter({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    registers: (cfg.registers ?? [reg]) as any
  } as any);
}

export function createHistogram(cfg: HistogramConfig) {
  const reg = (cfg.registers?.[0] as any) ?? getRegistry();
  ensureDefaultMetrics({ register: reg as any });
  return new Histogram({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    buckets: cfg.buckets,
    registers: (cfg.registers ?? [reg]) as any
  } as any);
}
