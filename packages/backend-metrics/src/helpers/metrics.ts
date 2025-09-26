import { Counter, Histogram, Registry } from 'prom-client';

type CfgBase = {
  name: string;
  help: string;
  labelNames?: string[];
  registers?: Registry[];
};

export function createCounter(cfg: CfgBase) {
  return new Counter({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    registers: cfg.registers as any, // tolerate prom-client version diffs
  } as any);
}

export function createHistogram(cfg: CfgBase & { buckets?: number[] }) {
  return new Histogram({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    buckets: cfg.buckets,
    registers: cfg.registers as any,
  } as any);
}
