import type { ProactivityMode } from '../proactivity/modes';

export type ProposalStatus = 'proposed' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface ProposalRecord {
  id: string;
  tenantId: string;
  userId: string;
  featureId?: string;
  capabilityId: string;
  payload: any;
  preview?: any;
  status: ProposalStatus;
  idempotencyKey?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  basis: string[];
  requestedMode?: ProactivityMode;
  effectiveMode?: ProactivityMode;
  executionResult?: any;
  failureReason?: string | null;
}

export interface ProposalCreateInput {
  tenantId: string;
  userId: string;
  featureId?: string;
  capabilityId: string;
  payload: any;
  preview?: any;
  idempotencyKey?: string | null;
  basis?: string[];
  requestedMode?: ProactivityMode;
  effectiveMode?: ProactivityMode;
}

export interface ProposalUpdateInput {
  status?: ProposalStatus;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  executionResult?: any;
  failureReason?: string | null;
  idempotencyKey?: string | null;
}

export interface ProposalListFilter {
  status?: ProposalStatus;
}
