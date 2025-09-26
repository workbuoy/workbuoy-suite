import { collectDefaultMetrics, Registry, register as globalRegister } from 'prom-client';

type AnyRegistry = unknown;
type CollectDefaultsOptions = Record<string, unknown>;

type PRegistry = Registry & { contentType?: string };

let _singleton: PRegistry | undefined;

export function getRegistry(reg?: AnyRegistry): PRegistry {
  if (reg && typeof reg === 'object') return reg as PRegistry;
  if (!_singleton) _singleton = (globalRegister as unknown as PRegistry) ?? new (Registry as any)();
  return _singleton;
}

const isRegistryLike = (value: unknown): value is AnyRegistry =>
  !!value && typeof value === 'object' && typeof (value as any).metrics === 'function';

const isCollectDefaultsOptions = (value: unknown): value is CollectDefaultsOptions =>
  !!value && typeof value === 'object' && !isRegistryLike(value);

export function setupDefaultMetrics(): void;
export function setupDefaultMetrics(opts: CollectDefaultsOptions): void;
export function setupDefaultMetrics(register: AnyRegistry): void;
export function setupDefaultMetrics(arg?: CollectDefaultsOptions | AnyRegistry): void {
  const options: CollectDefaultsOptions | undefined =
    arg === undefined ? undefined : isCollectDefaultsOptions(arg) ? arg : { register: arg };

  const reg = getRegistry(options?.register ?? (isRegistryLike(arg) ? arg : undefined));
  collectDefaultMetrics({ ...(options as any), register: reg } as any);
}

export const ensureDefaultMetrics: {
  (): void;
  (opts: CollectDefaultsOptions): void;
  (register: AnyRegistry): void;
} = setupDefaultMetrics as any;

export function mergeRegistries(registries?: AnyRegistry[]): PRegistry {
  const regs = (registries?.length ? registries : [getRegistry()]) as PRegistry[];
  const maybeMerge = (Registry as any).merge ?? (globalRegister as any)?.merge;
  if (typeof maybeMerge === 'function') return maybeMerge(regs);
  const target = new (Registry as any)() as PRegistry;
  (target as any).metrics = async () => (await Promise.all(regs.map((r) => (r as any).metrics?.() ?? ''))).join('');
  (target as any).getSingleMetricAsString = async (name: string) =>
    (await Promise.all(regs.map((r) => (r as any).getSingleMetricAsString?.(name) ?? ''))).join('');
  return target;
}

export async function getMetricsText(reg?: AnyRegistry): Promise<string> {
  const r = (reg ? mergeRegistries([reg]) : getRegistry()) as any;
  return typeof r.metrics === 'function' ? r.metrics() : '';
}

export async function getOpenMetricsText(reg?: AnyRegistry): Promise<string> {
  return getMetricsText(reg);
}
