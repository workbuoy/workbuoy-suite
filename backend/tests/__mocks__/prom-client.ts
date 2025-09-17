type Metric = {
  labels: jest.Mock<Metric, any[]>;
  inc: jest.Mock<void, any[]>;
  observe: jest.Mock<void, any[]>;
  set: jest.Mock<void, any[]>;
  reset: jest.Mock<void, any[]>;
};

const createMetric = (): Metric => ({
  labels: jest.fn(() => createMetric()),
  inc: jest.fn(),
  observe: jest.fn(),
  set: jest.fn(),
  reset: jest.fn(),
});

class MockRegistry {
  private metricsList: any[] = [];

  registerMetric = jest.fn((metric: any) => {
    this.metricsList.push(metric);
  });

  metrics = jest.fn(async () => JSON.stringify(this.metricsList));

  clear = jest.fn(() => {
    this.metricsList = [];
  });

  resetMetrics = jest.fn(() => {
    this.metricsList = [];
  });
}

const register = new MockRegistry();

const promClientMock = {
  Counter: jest.fn(() => createMetric()),
  Gauge: jest.fn(() => createMetric()),
  Histogram: jest.fn(() => createMetric()),
  Summary: jest.fn(() => createMetric()),
  Registry: MockRegistry,
  collectDefaultMetrics: jest.fn(),
  register,
};

export default promClientMock;
export const Counter = promClientMock.Counter;
export const Gauge = promClientMock.Gauge;
export const Histogram = promClientMock.Histogram;
export const Summary = promClientMock.Summary;
export const Registry = promClientMock.Registry;
export const collectDefaultMetrics = promClientMock.collectDefaultMetrics;
export { register };
