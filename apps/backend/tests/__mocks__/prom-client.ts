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
const collectDefaultMetrics = jest.fn();

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
