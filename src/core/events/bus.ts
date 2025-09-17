import crypto from 'crypto';

export type Priority = 'high' | 'medium' | 'low';

export interface WorkbuoyEvent<T = any> {
  id: string;
  type: string;
  priority: Priority;
  timestamp: string;
  payload: T;
  correlationId?: string;
  source?: string;
  retries: number;
  lastError?: string;
  headers?: Record<string, string>;
  meta?: Record<string, any>;
}

export interface LegacyEvent<T = any> {
  id?: string;
  type: string;
  priority?: string;
  payload?: T;
  timestamp?: string;
  ts?: string;
  correlationId?: string;
  source?: string;
  retries?: number;
  attempts?: number;
  headers?: Record<string, string>;
  meta?: Record<string, any>;
  lastError?: string;
}

export interface EmitOptions {
  priority?: string;
  idempotencyKey?: string;
  correlationId?: string;
  source?: string;
  headers?: Record<string, string>;
  meta?: Record<string, any>;
}

type Handler<T = any> = (event: WorkbuoyEvent<T>) => Promise<void> | void;
type ConsumerMap = Map<string, Handler>;

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const DEFAULT_MAX_ATTEMPTS = Math.max(1, Number(process.env.BUS_MAX_ATTEMPTS || process.env.EVENTBUS_MAX_ATTEMPTS || 3));

function normalizePriority(priority?: string): Priority {
  const value = (priority ?? 'medium').toLowerCase();
  if (value === 'high' || value === 'urgent' || value === 'critical') return 'high';
  if (value === 'low' || value === 'minor') return 'low';
  return 'medium';
}

function nextId(seed?: string): string {
  if (seed) return seed;
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneEvent<T>(event: WorkbuoyEvent<T>): WorkbuoyEvent<T> {
  return { ...event, payload: event.payload };
}

class PriorityEventBus {
  private readonly queues: Record<Priority, WorkbuoyEvent[]> = {
    high: [],
    medium: [],
    low: []
  };
  private readonly handlers = new Map<string, ConsumerMap>();
  private readonly pending = new Set<string>();
  private readonly processed = new Set<string>();
  private readonly dlq: WorkbuoyEvent[] = [];
  private listenerSeq = 0;
  private drainSequence: Promise<void> = Promise.resolve();
  private readonly maxAttempts = DEFAULT_MAX_ATTEMPTS;

  async emit<T>(eventOrType: string | LegacyEvent<T>, payload?: T, opts?: EmitOptions): Promise<void> {
    const event = this.normalize(eventOrType, payload, opts);
    if (!this.enqueue(event)) return;
    await this.ensureDrain();
  }

  async publish<T>(event: LegacyEvent<T>, opts?: EmitOptions): Promise<void> {
    const normalized = this.normalize(event, undefined, opts);
    if (!this.enqueue(normalized)) return;
    await this.ensureDrain();
  }

  subscribe<T>(type: string, consumerOrHandler: string | Handler<T>, maybeHandler?: Handler<T>): void {
    const handler = typeof consumerOrHandler === 'function' ? consumerOrHandler : maybeHandler;
    if (!handler) return;
    const consumerId = typeof consumerOrHandler === 'string' ? consumerOrHandler : `listener-${++this.listenerSeq}`;
    const topicHandlers = this.handlers.get(type) ?? new Map<string, Handler>();
    topicHandlers.set(consumerId, handler as Handler);
    this.handlers.set(type, topicHandlers);
  }

  on<T>(type: string, handler: (payload: T, event: WorkbuoyEvent<T>) => Promise<void> | void): void {
    this.subscribe(type, async (event) => {
      await handler(event.payload as T, event as WorkbuoyEvent<T>);
    });
  }

  async stats(): Promise<{ queues: Array<{ name: Priority; size: number }>; dlq: Array<WorkbuoyEvent> }> {
    return {
      queues: PRIORITIES.map((name) => ({ name, size: this.queues[name].length })),
      dlq: this.dlq.map((event) => cloneEvent(event))
    };
  }

  _peek(): { sizes: Record<Priority | 'dlq', number>; queues: Record<Priority, WorkbuoyEvent[]>; dlq: WorkbuoyEvent[] } {
    return {
      sizes: {
        high: this.queues.high.length,
        medium: this.queues.medium.length,
        low: this.queues.low.length,
        dlq: this.dlq.length
      },
      queues: {
        high: this.queues.high.map((event) => cloneEvent(event)),
        medium: this.queues.medium.map((event) => cloneEvent(event)),
        low: this.queues.low.map((event) => cloneEvent(event))
      },
      dlq: this.dlq.map((event) => cloneEvent(event))
    };
  }

  dlqList(): WorkbuoyEvent[] {
    return this.dlq.map((event) => cloneEvent(event));
  }

  reset(): void {
    this.handlers.clear();
    this.pending.clear();
    this.processed.clear();
    this.queues.high.length = 0;
    this.queues.medium.length = 0;
    this.queues.low.length = 0;
    this.dlq.length = 0;
  }

  private normalize<T>(eventOrType: string | LegacyEvent<T>, payload?: T, opts?: EmitOptions): WorkbuoyEvent<T> {
    if (!eventOrType) throw new Error('event type required');
    const base: LegacyEvent<T> = typeof eventOrType === 'string'
      ? { type: eventOrType, payload }
      : { ...eventOrType };

    if (payload !== undefined && base.payload === undefined) base.payload = payload;
    if (opts?.priority) base.priority = opts.priority;
    if (opts?.correlationId) base.correlationId = opts.correlationId;
    if (opts?.source) base.source = opts.source;
    if (opts?.headers) base.headers = { ...(base.headers ?? {}), ...opts.headers };
    if (opts?.meta) base.meta = { ...(base.meta ?? {}), ...opts.meta };
    if (opts?.idempotencyKey) base.id = opts.idempotencyKey;

    const id = nextId(base.id);
    const priority = normalizePriority(base.priority);
    const timestamp = base.timestamp ?? base.ts ?? new Date().toISOString();
    const retries = typeof base.retries === 'number'
      ? base.retries
      : typeof base.attempts === 'number' && base.attempts > 0
        ? base.attempts
        : 0;

    return {
      id,
      type: base.type,
      priority,
      timestamp,
      correlationId: base.correlationId,
      source: base.source,
      payload: base.payload as T,
      retries,
      lastError: base.lastError,
      headers: base.headers,
      meta: base.meta
    };
  }

  private enqueue(event: WorkbuoyEvent, allowDuplicate = false): boolean {
    if (!allowDuplicate) {
      if (this.processed.has(event.id)) return false;
      if (this.pending.has(event.id)) return false;
    }
    this.queues[event.priority].push(event);
    this.pending.add(event.id);
    return true;
  }

  private dequeue(): WorkbuoyEvent | undefined {
    for (const priority of PRIORITIES) {
      const queue = this.queues[priority];
      if (queue.length) {
        const event = queue.shift()!;
        this.pending.delete(event.id);
        return event;
      }
    }
    return undefined;
  }

  private ensureDrain(): Promise<void> {
    this.drainSequence = this.drainSequence.then(() => this.drain());
    return this.drainSequence;
  }

  private async drain(): Promise<void> {
    while (true) {
      const event = this.dequeue();
      if (!event) break;
      const handlers = this.handlers.get(event.type);
      if (!handlers || handlers.size === 0) {
        this.processed.add(event.id);
        continue;
      }

      let failed = false;
      for (const handler of handlers.values()) {
        try {
          await handler(event);
        } catch (err) {
          failed = true;
          event.retries += 1;
          event.lastError = err instanceof Error ? err.message : String(err);
        }
      }

      if (!failed) {
        this.processed.add(event.id);
        continue;
      }

      if (event.retries >= this.maxAttempts) {
        this.dlq.push({ ...event });
        this.processed.add(event.id);
      } else {
        this.enqueue({ ...event }, true);
      }
    }
  }
}

const bus = new PriorityEventBus();

export const EventBus = {
  subscribe(type: string, handler: Handler): void {
    bus.subscribe(type, handler);
  },
  async publish<T>(event: LegacyEvent<T>): Promise<void> {
    await bus.publish(event);
  },
  __dlq(): WorkbuoyEvent[] {
    return bus.dlqList();
  },
  __reset(): void {
    bus.reset();
  }
};

export { bus };
export const priorityBus = bus;
export const PriorityBus = bus;
export const emit = bus.emit.bind(bus);
export const on = bus.on.bind(bus);
export const stats = bus.stats.bind(bus);
export const publish = bus.publish.bind(bus);
export const subscribe = bus.subscribe.bind(bus);
export const dlqList = bus.dlqList.bind(bus);
export const reset = bus.reset.bind(bus);
export const peek = bus._peek.bind(bus);
export default bus;
