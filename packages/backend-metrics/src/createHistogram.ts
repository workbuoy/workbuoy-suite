import { Histogram, type HistogramConfiguration, type Registry } from 'prom-client';

export function createHistogram(
  registry: Registry,
  name: string,
  help: string,
  labelNames: string[] = [],
  buckets?: number[],
): Histogram<string> {
  const config: HistogramConfiguration<string> = {
    name,
    help,
    registers: [registry],
    labelNames,
    buckets,
  };

  return new Histogram(config);
}
