import { Counter, Histogram } from 'prom-client';
import { ensureDefaultMetrics, getRegistry } from './registry.js';
import type { AnyRegistry } from './types.js';

type BaseOptions = {
  name: string;
  help: string;
  labelNames?: string[];
  registers?: AnyRegistry[];
  register?: AnyRegistry;
};

export function createCounter(opts: BaseOptions) {
  const reg = getRegistry(opts.register);
  ensureDefaultMetrics({ register: reg });
  return new (Counter as any)({
    name: opts.name,
    help: opts.help,
    labelNames: opts.labelNames ?? [],
    registers: opts.registers ? (opts.registers as any) : [reg],
  }) as any;
}

export function createHistogram(opts: BaseOptions & { buckets?: number[] }) {
  const reg = getRegistry(opts.register);
  ensureDefaultMetrics({ register: reg });
  return new (Histogram as any)({
    name: opts.name,
    help: opts.help,
    labelNames: opts.labelNames ?? [],
    buckets: opts.buckets,
    registers: opts.registers ? (opts.registers as any) : [reg],
  }) as any;
}
