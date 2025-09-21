import crypto from 'node:crypto';
import { ProposalCreateInput, ProposalListFilter, ProposalRecord, ProposalStatus, ProposalUpdateInput } from './types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export interface ProposalsRepository {
  create(input: ProposalCreateInput): Promise<ProposalRecord>;
  get(id: string): Promise<ProposalRecord | undefined>;
  update(id: string, update: ProposalUpdateInput): Promise<ProposalRecord>;
  list(filter?: ProposalListFilter): Promise<ProposalRecord[]>;
  reset(): void;
}

class InMemoryProposalsRepository implements ProposalsRepository {
  private readonly items = new Map<string, ProposalRecord>();
  private readonly idempotencyIndex = new Map<string, string>();

  async create(input: ProposalCreateInput): Promise<ProposalRecord> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    if (input.idempotencyKey) {
      const existingId = this.idempotencyIndex.get(input.idempotencyKey);
      if (existingId) {
        const existing = this.items.get(existingId);
        if (existing) return clone(existing);
      }
    }
    const record: ProposalRecord = {
      id,
      tenantId: input.tenantId,
      userId: input.userId,
      featureId: input.featureId,
      capabilityId: input.capabilityId,
      payload: input.payload,
      preview: input.preview,
      status: 'proposed',
      idempotencyKey: input.idempotencyKey ?? null,
      createdAt: now,
      updatedAt: now,
      approvedBy: null,
      rejectedBy: null,
      basis: clone(input.basis ?? []),
      requestedMode: input.requestedMode,
      effectiveMode: input.effectiveMode,
      executionResult: undefined,
      failureReason: null,
    };
    this.items.set(record.id, record);
    if (record.idempotencyKey) {
      this.idempotencyIndex.set(record.idempotencyKey, record.id);
    }
    return clone(record);
  }

  async get(id: string): Promise<ProposalRecord | undefined> {
    const found = this.items.get(id);
    return found ? clone(found) : undefined;
  }

  async update(id: string, update: ProposalUpdateInput): Promise<ProposalRecord> {
    const existing = this.items.get(id);
    if (!existing) throw new Error('proposal_not_found');
    const next: ProposalRecord = {
      ...existing,
      ...update,
      status: (update.status ?? existing.status) as ProposalStatus,
      approvedBy: update.approvedBy ?? existing.approvedBy ?? null,
      rejectedBy: update.rejectedBy ?? existing.rejectedBy ?? null,
      executionResult: update.executionResult ?? existing.executionResult,
      failureReason: update.failureReason ?? existing.failureReason ?? null,
      idempotencyKey: update.idempotencyKey ?? existing.idempotencyKey ?? null,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, next);
    if (next.idempotencyKey) {
      this.idempotencyIndex.set(next.idempotencyKey, id);
    }
    return clone(next);
  }

  async list(filter?: ProposalListFilter): Promise<ProposalRecord[]> {
    const values = Array.from(this.items.values());
    const filtered = filter?.status
      ? values.filter(item => item.status === filter.status)
      : values;
    return filtered.map(item => clone(item));
  }

  reset() {
    this.items.clear();
    this.idempotencyIndex.clear();
  }
}

let repo: ProposalsRepository = new InMemoryProposalsRepository();

export function getProposalsRepository(): ProposalsRepository {
  return repo;
}

export function setProposalsRepository(next: ProposalsRepository) {
  repo = next;
}

export function resetProposalsRepository() {
  repo.reset();
}
