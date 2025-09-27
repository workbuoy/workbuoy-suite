type Metric = {
  labels: jest.Mock<Metric, any[]>;
  inc: jest.Mock<void, any[]>;
  observe: jest.Mock<void, any[]>;
  set: jest.Mock<void, any[]>;
  reset: jest.Mock<void, any[]>;
};

interface RegisteredMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
}

const createMetric = (): Metric => ({
  labels: jest.fn(() => createMetric()),
  inc: jest.fn(),
  observe: jest.fn(),
  set: jest.fn(),
  reset: jest.fn(),
});

class Registry {
  private metricsList: RegisteredMetric[] = [];
  private defaultLabels: Record<string, string> = {};
  contentType = 'text/plain; version=0.0.4; charset=utf-8';

  registerMetric = jest.fn((metric: Partial<RegisteredMetric> | undefined) => {
    if (!metric) {
      return;
    }
    const name =
      typeof metric.name === 'string' ? metric.name : `mock_metric_${this.metricsList.length}`;
    if (this.metricsList.some((existing) => existing.name === name)) {
      return;
    }

    const type = metric.type ?? 'counter';
    this.metricsList.push({ name, type });
  });

  metrics = jest.fn(async () => {
    return this.metricsList
      .map(({ name, type }) => `# HELP ${name} mock metric\n# TYPE ${name} ${type}\n${name} 0`)
      .join('\n');
  });

  clear = jest.fn(() => {
    this.metricsList = [];
  });

  resetMetrics = jest.fn(() => {
    this.metricsList = [];
  });

  setDefaultLabels = jest.fn((labels: Record<string, string>) => {
    this.defaultLabels = { ...labels };
  });
}

const register = new Registry();

const createMetricFactory = (type: RegisteredMetric['type']) =>
  jest.fn((config: { name?: string; registers?: Registry[] } = {}) => {
    const metric = createMetric();
    const name = config.name ?? `mock_metric_${Math.random().toString(36).slice(2)}`;
    const registries = Array.isArray(config.registers) && config.registers.length > 0
      ? config.registers
      : [register];

    for (const registry of registries) {
      if (registry && typeof registry.registerMetric === 'function') {
        registry.registerMetric({ name, type });
      }
    }

    return metric;
  });

const Counter = createMetricFactory('counter');
const Gauge = createMetricFactory('gauge');
const Histogram = createMetricFactory('histogram');
const Summary = createMetricFactory('summary');

const collectDefaultMetrics = jest.fn(
  ({ register: providedRegister, prefix }: { register?: Registry; prefix?: string } = {}) => {
    const target = providedRegister ?? register;
    const normalizedPrefix = prefix ?? '';

    const defaults: RegisteredMetric[] = [
      { name: `${normalizedPrefix}process_cpu_user_seconds_total`, type: 'counter' },
      { name: `${normalizedPrefix}process_resident_memory_bytes`, type: 'gauge' },
      { name: `${normalizedPrefix}nodejs_eventloop_lag_seconds`, type: 'histogram' },
    ];

    for (const metric of defaults) {
      target.registerMetric(metric);
    }
  },
);

const promClientMock = {
  Counter,
  Gauge,
  Histogram,
  Summary,
  Registry,
  collectDefaultMetrics,
  register,
};

export default promClientMock;
export { Counter, Gauge, Histogram, Summary, collectDefaultMetrics, Registry, register };
