import crypto from 'crypto';

export type Priority = 'high' | 'medium' | 'low';
export interface LegacyEvent<T = any> {
  id?: string;
  type: string;
  payload?: T;
  priority?: string;
  ts?: string;
  correlationId?: string;
  source?: string;
  attempts?: number;
  headers?: Record<string, string>;
  meta?: Record<string, any>;
}
export interface EmitOptions {
  priority?: string;
  idempotencyKey?: string;
  correlationId?: string;
  source?: string;
}
export interface QueuedEvent<T = any> {
  id: string;
  type: string;
  payload: T;
  priority: Priority;
  ts: string;
  correlationId?: string;
  source?: string;
  attempts: number;
  headers?: Record<string, string>;
  meta?: Record<string, any>;
  lastError?: string;
}
export interface PriorityBusStats {
  queues: Array<{ name: Priority; size: number }>;
  dlq: Array<QueuedEvent>;
}

type Handler = (event: QueuedEvent) => Promise<void> | void;

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const DEFAULT_MAX_ATTEMPTS = Math.max(1, Number(process.env.BUS_MAX_ATTEMPTS || process.env.EVENTBUS_MAX_ATTEMPTS || 3));

function normalizePriority(priority?: string): Priority {
  switch ((priority || '').toLowerCase()) {
    case 'high':
    case 'urgent':
    case 'critical':
      return 'high';
    case 'low':
    case 'minor':
      return 'low';
    case 'mid':
    case 'med':
    case 'medium':
    case 'normal':
    default:
      return 'medium';
  }
}

function nextId(seed?: string): string {
  if (seed) return seed;
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toPublicEvent(event: QueuedEvent): QueuedEvent {
  return { ...event };
}

class PriorityEventBus {
  private queues: Record<Priority, QueuedEvent[]> = {
    high: [],
    medium: [],
    low: []
  };
  private handlers = new Map<string, Map<string, Handler>>();
  private pending = new Set<string>();
  private processed = new Set<string>();
  private dlq: QueuedEvent[] = [];
  public DLQ = this.dlq;
  private drainSequence: Promise<void> = Promise.resolve();
  private listenerSeq = 0;
  private readonly maxAttempts = DEFAULT_MAX_ATTEMPTS;

  async emit<T = any>(eventOrType: string | LegacyEvent<T>, maybePayload?: T, opts?: EmitOptions): Promise<void> {
    const event = this.normalize(eventOrType, maybePayload, opts);
    const enqueued = this.enqueue(event);
    if (!enqueued) return;
    await this.ensureDrain();
  }

  async publish<T = any>(event: LegacyEvent<T>, opts?: EmitOptions): Promise<void> {
    await this.emit(event, undefined, opts);
  }

  on<T = any>(type: string, handler: (payload: T, event: QueuedEvent<T>) => Promise<void> | void): void {
    const consumerId = `listener-${++this.listenerSeq}`;
    this.subscribe(type, consumerId, async (event) => {
      await handler(event.payload as T, event as QueuedEvent<T>);
    });
  }

  subscribe<T = any>(type: string, consumerOrHandler: string | Handler, maybeHandler?: Handler): void {
    const handler: Handler | undefined = typeof consumerOrHandler === 'function' ? consumerOrHandler : maybeHandler;
    if (!handler) return;
    const consumerId = typeof consumerOrHandler === 'string' ? consumerOrHandler : `consumer-${++this.listenerSeq}`;
    const topicHandlers = this.handlers.get(type) ?? new Map<string, Handler>();
    topicHandlers.set(consumerId, handler);
    this.handlers.set(type, topicHandlers);
  }

  clearHandlers(): void {
    this.handlers.clear();
  }

  async stats(): Promise<PriorityBusStats> {
    return {
      queues: PRIORITIES.map((name) => ({ name, size: this.queues[name].length })),
      dlq: this.dlq.map((event) => toPublicEvent(event))
    };
  }

  dlqList(): QueuedEvent[] {
    return this.dlq.map((event) => toPublicEvent(event));
  }

  _peek(): { sizes: Record<Priority | 'dlq', number>; queues: Record<Priority, QueuedEvent[]>; dlq: QueuedEvent[] } {
    return {
      sizes: {
        high: this.queues.high.length,
        medium: this.queues.medium.length,
        low: this.queues.low.length,
        dlq: this.dlq.length
      },
      queues: {
        high: this.queues.high.map((event) => toPublicEvent(event)),
        medium: this.queues.medium.map((event) => toPublicEvent(event)),
        low: this.queues.low.map((event) => toPublicEvent(event))
      },
      dlq: this.dlq.map((event) => toPublicEvent(event))
    };
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

  private normalize<T>(eventOrType: string | LegacyEvent<T>, payload?: T, opts?: EmitOptions): QueuedEvent<T> {
    if (!eventOrType) throw new Error('event type required');
    const base: LegacyEvent<T> = typeof eventOrType === 'string'
      ? { type: eventOrType, payload, priority: opts?.priority, correlationId: opts?.correlationId, source: opts?.source }
      : { ...eventOrType };

    if (payload !== undefined && base.payload === undefined) base.payload = payload;
    if (opts?.priority) base.priority = opts.priority;
    if (opts?.correlationId) base.correlationId = opts.correlationId;
    if (opts?.idempotencyKey) base.id = opts.idempotencyKey;

    const priority = normalizePriority(base.priority);
    const id = nextId(base.id);
    const ts = base.ts || new Date().toISOString();
    const attempts = typeof base.attempts === 'number' && base.attempts > 0 ? base.attempts : 0;

    return {
      id,
      type: base.type,
      payload: base.payload as T,
      priority,
      correlationId: base.correlationId,
      source: base.source,
      ts,
      attempts,
      headers: base.headers,
      meta: base.meta
    };
  }

  private enqueue(event: QueuedEvent, allowDuplicate = false): boolean {
    if (!allowDuplicate) {
      if (this.processed.has(event.id)) return false;
      if (this.pending.has(event.id)) return false;
    }
    this.queues[event.priority].push(event);
    this.pending.add(event.id);
    return true;
  }

  private dequeue(): QueuedEvent | undefined {
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
      let lastError: string | undefined;
      for (const handler of handlers.values()) {
        try {
          await handler(event);
        } catch (err) {
          failed = true;
          lastError = err instanceof Error ? err.message : String(err);
        }
      }

      if (!failed) {
        this.processed.add(event.id);
        continue;
      }

      event.attempts += 1;
      event.lastError = lastError;
      if (event.attempts >= this.maxAttempts) {
        this.dlq.push({ ...event });
        this.processed.add(event.id);
      } else {
        this.enqueue(event, true);
      }
    }
  }
}

const bus = new PriorityEventBus();

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
export default bus;
