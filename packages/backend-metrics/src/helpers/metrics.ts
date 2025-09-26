import {
  Counter,
  type CounterConfiguration,
  Histogram,
  type HistogramConfiguration,
  Registry,
} from "prom-client";

import { getRegistry, type AnyRegistry } from "../registry.js";

const defaultRegistry = getRegistry();

type CounterInit<T extends string> = Omit<CounterConfiguration<T>, "registers"> & {
  registry?: Registry;
  registers?: AnyRegistry[];
};

type HistogramInit<T extends string> = Omit<HistogramConfiguration<T>, "registers"> & {
  registry?: Registry;
  registers?: AnyRegistry[];
};

function resolveRegisters(
  registry: Registry | undefined,
  registers: AnyRegistry[] | undefined,
): AnyRegistry[] {
  if (Array.isArray(registers) && registers.length > 0) {
    return registers as AnyRegistry[];
  }
  if (registry) {
    return [registry as AnyRegistry];
  }
  return [defaultRegistry as AnyRegistry];
}

export function createCounter<T extends string>(config: CounterInit<T>): Counter<T> {
  const { registry, registers, ...rest } = config;
  return new Counter<T>({ ...rest, registers: resolveRegisters(registry, registers) as any });
}

export function createHistogram<T extends string>(config: HistogramInit<T>): Histogram<T> {
  const { registry, registers, ...rest } = config;
  return new Histogram<T>({ ...rest, registers: resolveRegisters(registry, registers) as any });
}
