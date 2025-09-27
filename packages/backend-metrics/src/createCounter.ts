import { Counter, type CounterConfiguration, type Registry } from 'prom-client';

export function createCounter(
  registry: Registry,
  name: string,
  help: string,
  labelNames: string[] = [],
): Counter<string> {
  const config: CounterConfiguration<string> = {
    name,
    help,
    registers: [registry],
    labelNames,
  };

  return new Counter(config);
}
