import crypto from 'node:crypto';
import bus from '../core/eventBusV2';
import { CircuitBreaker } from '../core/circuit';
import { getConnectorCallRepository } from './internal/callsRepository';
import { getConnectorCircuit } from './internal/circuitRegistry';

export interface ConnectorExecutionOptions {
  connector: string;
  capabilityId: string;
  action?: string;
  payload: any;
  idempotencyKey: string;
  maxRetries?: number;
  retryBaseMs?: number;
  breaker?: CircuitBreaker;
  sleepFn?: (ms: number) => Promise<void>;
}

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_BASE_MS = 250;

function hashPayload(payload: any): string {
  const json = JSON.stringify(payload ?? null);
  return crypto.createHash('sha256').update(json).digest('hex');
}

function serializeError(err: any): string {
  if (!err) return 'unknown_error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return String(err);
}

function extractStatus(err: any): number | undefined {
  const candidates = [err?.statusCode, err?.status, err?.response?.status, err?.response?.statusCode];
  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) return numeric;
  }
  return undefined;
}

function parseRetryAfter(err: any): number | undefined {
  const header = err?.response?.headers?.['retry-after'] ?? err?.response?.headers?.RetryAfter ?? err?.retryAfter;
  if (!header) return undefined;
  if (typeof header === 'number' && Number.isFinite(header)) return header * 1000;
  if (typeof header === 'string') {
    const numeric = Number(header);
    if (Number.isFinite(numeric)) return numeric * 1000;
    const date = Date.parse(header);
    if (!Number.isNaN(date)) {
      const diff = date - Date.now();
      return diff > 0 ? diff : undefined;
    }
  }
  return undefined;
}

function shouldRetry(err: any, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) return false;
  const status = extractStatus(err);
  if (!status) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return status < 400;
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise(resolve => setTimeout(resolve, ms));
}

function computeDelay(attempt: number, baseMs: number, err: any): number {
  const exponential = baseMs * Math.pow(2, attempt - 1);
  const jitter = Math.floor(Math.random() * baseMs);
  const retryAfter = parseRetryAfter(err);
  const candidate = exponential + jitter;
  if (typeof retryAfter === 'number') {
    return Math.max(candidate, retryAfter);
  }
  return candidate;
}

export async function executeConnectorAction<T>(
  opts: ConnectorExecutionOptions,
  call: () => Promise<T>,
): Promise<{ response: T; idempotencyKey: string }> {
  if (!opts.idempotencyKey) throw new Error('connector_idempotency_key_required');
  const repo = getConnectorCallRepository();
  const key = opts.idempotencyKey;
  const requestHash = hashPayload(opts.payload);
  const existing = await repo.find(key);
  if (existing) {
    if (existing.status === 'success') {
      return { response: existing.response, idempotencyKey: key };
    }
    if (existing.status === 'pending') {
      throw Object.assign(new Error('connector_execution_inflight'), { code: 'inflight', connector: opts.connector });
    }
    throw Object.assign(new Error('connector_execution_failed'), { code: 'failed', connector: opts.connector, lastError: existing.lastError });
  }

  await repo.create({
    key,
    connector: opts.connector,
    capabilityId: opts.capabilityId,
    action: opts.action,
    requestHash,
  });

  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseMs = opts.retryBaseMs ?? DEFAULT_BASE_MS;
  const breaker = opts.breaker ?? getConnectorCircuit(opts.connector);
  let attempt = 0;

  while (true) {
    try {
      const response = await breaker.call(`${opts.connector}:${opts.action ?? 'execute'}`, call);
      await repo.markSuccess(key, response, attempt);
      return { response, idempotencyKey: key };
    } catch (err: any) {
      attempt += 1;
      const retry = shouldRetry(err, attempt, maxRetries);
      if (!retry) {
        const message = serializeError(err);
        await repo.markFailed(key, message, attempt);
        await bus.emit('eventbus.dlq', {
          connector: opts.connector,
          capabilityId: opts.capabilityId,
          idempotencyKey: key,
          error: message,
        });
        throw Object.assign(new Error('connector_execution_failed'), { code: 'failed', connector: opts.connector, cause: err });
      }
      await repo.incrementRetries(key, attempt);
      const delay = computeDelay(attempt, baseMs, err);
      await (opts.sleepFn ?? sleep)(delay);
    }
  }
}
