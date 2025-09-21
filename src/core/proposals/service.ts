import crypto from 'node:crypto';
import bus from '../eventBusV2';
import { ProposalCreateInput, ProposalListFilter, ProposalRecord, ProposalUpdateInput } from './types';
import { getProposalsRepository } from './repository';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function ensureArray(input: string[] | undefined): string[] {
  return Array.from(new Set(input ?? []));
}

export async function createProposal(input: ProposalCreateInput): Promise<ProposalRecord> {
  const repo = getProposalsRepository();
  const basis = ensureArray(input.basis);
  const record = await repo.create({ ...input, basis });
  await bus.emit('proposal.created', { proposal: clone(record) });
  return record;
}

export async function listProposals(filter?: ProposalListFilter): Promise<ProposalRecord[]> {
  const repo = getProposalsRepository();
  return repo.list(filter);
}

export async function getProposal(id: string): Promise<ProposalRecord | undefined> {
  const repo = getProposalsRepository();
  return repo.get(id);
}

export async function updateProposal(id: string, update: ProposalUpdateInput): Promise<ProposalRecord> {
  const repo = getProposalsRepository();
  const record = await repo.update(id, update);
  return record;
}

export async function markProposalApproved(id: string, approvedBy: string, idempotencyKey?: string): Promise<ProposalRecord> {
  const record = await updateProposal(id, { status: 'approved', approvedBy, idempotencyKey });
  await bus.emit('proposal.approved', { proposal: clone(record) });
  return record;
}

export async function markProposalRejected(id: string, rejectedBy: string, reason?: string): Promise<ProposalRecord> {
  const record = await updateProposal(id, { status: 'rejected', rejectedBy, failureReason: reason ?? null });
  await bus.emit('proposal.rejected', { proposal: clone(record) });
  return record;
}

export async function markProposalExecuted(id: string, executionResult: any): Promise<ProposalRecord> {
  const record = await updateProposal(id, { status: 'executed', executionResult, failureReason: null });
  await bus.emit('proposal.executed', { proposal: clone(record) });
  return record;
}

export async function markProposalFailed(id: string, failureReason: string): Promise<ProposalRecord> {
  const record = await updateProposal(id, { status: 'failed', failureReason });
  await bus.emit('proposal.failed', { proposal: clone(record) });
  return record;
}

export function generateProposalIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function sanitizeProposal(record: ProposalRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    userId: record.userId,
    featureId: record.featureId,
    capabilityId: record.capabilityId,
    status: record.status,
    preview: record.preview,
    basis: record.basis,
    idempotencyKey: record.idempotencyKey ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    approvedBy: record.approvedBy ?? undefined,
    rejectedBy: record.rejectedBy ?? undefined,
    requestedMode: record.requestedMode,
    effectiveMode: record.effectiveMode,
    executionResult: record.executionResult,
    failureReason: record.failureReason ?? undefined,
  };
}
