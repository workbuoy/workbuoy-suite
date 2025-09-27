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

  registerMetric = jest.fn((metric: Partial<RegisteredMetric> | undefined) => {
    if (!metric) {
      return;
    }
    const name =
      typeof metric.name === 'string' ? metric.name : `mock_metric_${this.metricsList.length}`;
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
}

const globalRegistry = new Registry();

const createMetricFactory = (type: RegisteredMetric['type']) => {
  return jest.fn((config: { name?: string; registers?: Registry[] } = {}) => {
    const metric = createMetric();
    const name = config.name ?? `mock_metric_${Math.random().toString(36).slice(2)}`;
    const registries = Array.isArray(config.registers) ? config.registers : [];
    if (registries.length === 0) {
      globalRegistry.registerMetric({ name, type });
    } else {
      for (const registry of registries) {
        if (registry && typeof registry.registerMetric === 'function') {
          registry.registerMetric({ name, type });
        }
      }
    }
    return metric;
  });
};

const promClientMock = {
  Counter: createMetricFactory('counter'),
  Gauge: createMetricFactory('gauge'),
  Histogram: createMetricFactory('histogram'),
  Summary: createMetricFactory('summary'),
  Registry,
  collectDefaultMetrics: jest.fn(),
  register: globalRegistry,
};

export default promClientMock;
export const Counter = promClientMock.Counter;
export const Gauge = promClientMock.Gauge;
export const Histogram = promClientMock.Histogram;
export const Summary = promClientMock.Summary;
export const collectDefaultMetrics = promClientMock.collectDefaultMetrics;
export { Registry };
export const register = globalRegistry;
