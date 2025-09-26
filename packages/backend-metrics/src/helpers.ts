import { Counter, Histogram, Registry } from 'prom-client';
import { ensureDefaultMetrics, getRegistry } from './registry.js';

type BaseCfg = {
  name: string;
  help: string;
  labelNames?: string[];
  registry?: Registry;
  registers?: Registry[]; // tolerate cross-version typing
};

function resolveRegisters(cfg: BaseCfg): Registry[] {
  if (cfg.registers && cfg.registers.length > 0) {
    return cfg.registers;
  }

  if (cfg.registry) {
    return [cfg.registry];
  }

  const defaultRegistry = getRegistry() as Registry;
  return [defaultRegistry];
}

export function createCounter(cfg: BaseCfg) {
  const registers = resolveRegisters(cfg);
  const [primary] = registers;
  if (primary) {
    ensureDefaultMetrics({ register: primary as any });
  }

  return new Counter({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    registers: registers as any,
  } as any);
}

export function createHistogram(cfg: BaseCfg & { buckets?: number[] }) {
  const registers = resolveRegisters(cfg);
  const [primary] = registers;
  if (primary) {
    ensureDefaultMetrics({ register: primary as any });
  }

  return new Histogram({
    name: cfg.name,
    help: cfg.help,
    labelNames: cfg.labelNames ?? [],
    buckets: cfg.buckets,
    registers: registers as any,
  } as any);
}
