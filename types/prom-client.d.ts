declare module 'prom-client' {
  export interface CounterConfiguration<T extends string = string> {
    name: string;
    help: string;
    labelNames?: readonly T[] | T[];
    registers?: Registry[];
  }

  export class Counter<T extends string = string> {
    constructor(configuration: CounterConfiguration<T>);
    inc(value?: number): void;
    inc(labels: Record<T, string>, value?: number): void;
  }

  export interface HistogramConfiguration<T extends string = string> {
    name: string;
    help: string;
    labelNames?: readonly T[] | T[];
    buckets?: number[];
    registers?: Registry[];
  }

  export class Histogram<T extends string = string> {
    constructor(configuration: HistogramConfiguration<T>);
    observe(value: number): void;
    observe(labels: Record<T, string>, value: number): void;
  }

  export class Registry {
    contentType: string;
    metrics(): Promise<string> | string;
    registerMetric(metric: any): void;
  }

  export function collectDefaultMetrics(options?: { register?: Registry }): void;

  export const register: Registry;
}
