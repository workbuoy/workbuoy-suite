export type ConnectorCallStatus = 'pending' | 'success' | 'failed';

export interface ConnectorCallRecord {
  key: string;
  connector: string;
  capabilityId: string;
  action?: string;
  requestHash: string;
  status: ConnectorCallStatus;
  response?: any;
  retries: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorCallCreateInput {
  key: string;
  connector: string;
  capabilityId: string;
  action?: string;
  requestHash: string;
}

export interface ConnectorCallRepository {
  find(key: string): Promise<ConnectorCallRecord | undefined>;
  create(input: ConnectorCallCreateInput): Promise<ConnectorCallRecord>;
  markSuccess(key: string, response: any, retries: number): Promise<ConnectorCallRecord>;
  markFailed(key: string, error: string, retries: number): Promise<ConnectorCallRecord>;
  incrementRetries(key: string, retries: number): Promise<ConnectorCallRecord>;
  reset(): void;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

class InMemoryConnectorCallRepository implements ConnectorCallRepository {
  private readonly items = new Map<string, ConnectorCallRecord>();

  async find(key: string): Promise<ConnectorCallRecord | undefined> {
    const record = this.items.get(key);
    return record ? clone(record) : undefined;
  }

  async create(input: ConnectorCallCreateInput): Promise<ConnectorCallRecord> {
    const now = new Date().toISOString();
    const record: ConnectorCallRecord = {
      key: input.key,
      connector: input.connector,
      capabilityId: input.capabilityId,
      action: input.action,
      requestHash: input.requestHash,
      status: 'pending',
      retries: 0,
      createdAt: now,
      updatedAt: now,
      response: undefined,
      lastError: null,
    };
    this.items.set(record.key, record);
    return clone(record);
  }

  async markSuccess(key: string, response: any, retries: number): Promise<ConnectorCallRecord> {
    const existing = this.items.get(key);
    if (!existing) throw new Error('connector_call_not_found');
    const record: ConnectorCallRecord = {
      ...existing,
      status: 'success',
      response,
      retries,
      lastError: null,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(key, record);
    return clone(record);
  }

  async markFailed(key: string, error: string, retries: number): Promise<ConnectorCallRecord> {
    const existing = this.items.get(key);
    if (!existing) throw new Error('connector_call_not_found');
    const record: ConnectorCallRecord = {
      ...existing,
      status: 'failed',
      lastError: error,
      retries,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(key, record);
    return clone(record);
  }

  async incrementRetries(key: string, retries: number): Promise<ConnectorCallRecord> {
    const existing = this.items.get(key);
    if (!existing) throw new Error('connector_call_not_found');
    const record: ConnectorCallRecord = {
      ...existing,
      retries,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(key, record);
    return clone(record);
  }

  reset(): void {
    this.items.clear();
  }
}

let repository: ConnectorCallRepository = new InMemoryConnectorCallRepository();

export function getConnectorCallRepository(): ConnectorCallRepository {
  return repository;
}

export function setConnectorCallRepository(next: ConnectorCallRepository) {
  repository = next;
}

export function resetConnectorCallRepository() {
  repository.reset();
}
