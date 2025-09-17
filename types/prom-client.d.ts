declare module 'prom-client' {
  export interface CounterConfiguration<T extends string = string> {
    name: string;
    help: string;
    labelNames?: readonly T[] | T[];
    registers?: Registry[];
  }

  export class Counter<T extends string = string> {
    constructor(configuration: CounterConfiguration<T>);
    inc(labels?: Record<T, string>, value?: number): void;
  }

  export class Registry {
    contentType: string;
    metrics(): Promise<string> | string;
    registerMetric(metric: any): void;
  }

  export function collectDefaultMetrics(options?: { register?: Registry }): void;
}
