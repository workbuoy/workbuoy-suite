import { Router } from 'express';
import { RoleRegistry } from '../../src/roles/registry';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { requiresProMode } from '../../src/core/proactivity/guards';
import { ProactivityMode } from '../../src/core/proactivity/modes';
import { resolveProactivityForRequest } from './utils/proactivityContext';
import { envBool } from '../../src/core/env';
import { getRoleRegistry, resolveUserBinding } from '../../src/roles/service';
import type { UserRoleBinding } from '../../src/roles/types';
import {
  listProposals,
  createProposal as recordProposal,
  sanitizeProposal,
  getProposal,
  markProposalApproved,
  markProposalExecuted,
  markProposalFailed,
  markProposalRejected,
  generateProposalIdempotencyKey,
} from '../../src/core/proposals/service';
import { getCapabilityImpl } from '../../src/capabilities/registry';
import { runCapabilityWithRole } from '../../src/core/capabilityRunnerRole';
import { policyCheck } from '../../src/core/policy';
import { logIntent } from '../../src/core/intentLog';

const router = Router();
const fallbackRegistry = new RoleRegistry(loadRolesFromRepo(), loadFeaturesFromRepo(), []);
const usePersistence = envBool('FF_PERSISTENCE', false);

async function selectRegistry() {
  if (usePersistence) {
    return getRoleRegistry();
  }
  return fallbackRegistry;
}

async function resolveBinding(req: any): Promise<{ tenantId: string; userId: string; role: string; binding: UserRoleBinding }>
{
  const tenantId = String(req.header('x-tenant') || req.header('x-tenant-id') || 'demo');
  const userId = String(req.header('x-user') || req.header('x-user-id') || 'demo-user');
  const role = String(req.header('x-role') || req.header('x-user-role') || 'sales_rep');
  const fallback: UserRoleBinding = { userId, primaryRole: role };
  const binding = (await resolveUserBinding(tenantId, userId, fallback)) ?? fallback;
  return { tenantId, userId, role, binding };
}

function headerIdempotencyKey(req: any): string | undefined {
  const header = req.header('idempotency-key') || req.header('Idempotency-Key');
  if (typeof header === 'string') {
    const trimmed = header.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
}

router.use(async (req, _res, next) => {
  try {
    const registry = await selectRegistry();
    const { binding } = await resolveBinding(req);
    const context = resolveProactivityForRequest(registry, req as any, {
      logEvent: false,
      roleBinding: binding,
    });
    (req as any).proactivityContext = context;
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/proposals', async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const allowedStatuses = new Set(['proposed', 'approved', 'rejected', 'executed', 'failed']);
  if (status && !allowedStatuses.has(status)) {
    return res.status(400).json({ error: 'invalid_status' });
  }
  const filter = status ? { status: status as any } : undefined;
  const proposals = await listProposals(filter);
  res.json({ proposals: proposals.map(sanitizeProposal) });
});

router.post('/proposals', requiresProMode(ProactivityMode.Ambisiøs), async (req, res) => {
  const ctx = (req as any).proactivityContext;
  const { capabilityId, payload, preview, featureId } = req.body || {};
  if (!capabilityId) {
    return res.status(400).json({ error: 'capability_required' });
  }
  const headerKey = headerIdempotencyKey(req);
  const idempotencyKey = headerKey ?? generateProposalIdempotencyKey();
  const proposal = await recordProposal({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    featureId: featureId ?? ctx.state.featureId,
    capabilityId,
    payload: payload ?? {},
    preview,
    idempotencyKey,
    basis: ctx.state.basis,
    requestedMode: ctx.state.requested,
    effectiveMode: ctx.state.effective,
  });
  res.status(201).json({ proposal: sanitizeProposal(proposal) });
});

router.post('/proposals/:id/approve', requiresProMode(ProactivityMode.Kraken), async (req, res) => {
  const ctx = (req as any).proactivityContext;
  const proposalId = req.params.id;
  const proposal = await getProposal(proposalId);
  if (!proposal) return res.status(404).json({ error: 'proposal_not_found' });

  if (proposal.status === 'rejected') {
    return res.status(409).json({ error: 'proposal_rejected', proposal: sanitizeProposal(proposal) });
  }
  if (proposal.status === 'executed') {
    return res.json({ proposal: sanitizeProposal(proposal) });
  }

  const capability = getCapabilityImpl(proposal.capabilityId);
  if (!capability) {
    return res.status(404).json({ error: 'capability_not_registered' });
  }

  const headerKey = headerIdempotencyKey(req);
  let idempotencyKey = headerKey ?? proposal.idempotencyKey ?? undefined;
  if (!idempotencyKey) {
    idempotencyKey = generateProposalIdempotencyKey();
  }
  if (proposal.status === 'failed' && !headerKey) {
    idempotencyKey = generateProposalIdempotencyKey();
  } else if (headerKey) {
    idempotencyKey = headerKey;
  }

  await markProposalApproved(proposalId, ctx.userId, idempotencyKey);

  try {
    const result = await runCapabilityWithRole(
      ctx.registry,
      proposal.capabilityId,
      proposal.featureId,
      proposal.payload,
      {
        tenantId: ctx.tenantId,
        roleBinding: ctx.roleBinding,
        requestedMode: ctx.state.requested,
        compatMode: req.header('x-proactivity-compat'),
        idempotencyKey,
        connectorName: proposal.capabilityId.split('.')[0],
      },
      capability,
      policyCheck,
      logIntent,
    );

    await markProposalExecuted(proposalId, result.outcome);
    const updated = await getProposal(proposalId);
    res.json({
      proposal: updated ? sanitizeProposal(updated) : undefined,
      outcome: result.outcome,
      idempotencyKey: result.idempotencyKey ?? idempotencyKey,
      basis: result.proactivity.basis,
    });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    await markProposalFailed(proposalId, message);
    const failed = await getProposal(proposalId);
    res.status(500).json({ error: 'proposal_execute_failed', message, proposal: failed ? sanitizeProposal(failed) : undefined });
  }
});

router.post('/proposals/:id/reject', requiresProMode(ProactivityMode.Ambisiøs), async (req, res) => {
  const ctx = (req as any).proactivityContext;
  const proposalId = req.params.id;
  const proposal = await getProposal(proposalId);
  if (!proposal) return res.status(404).json({ error: 'proposal_not_found' });
  if (proposal.status === 'executed') {
    return res.status(409).json({ error: 'proposal_already_executed', proposal: sanitizeProposal(proposal) });
  }
  const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
  const updated = await markProposalRejected(proposalId, ctx.userId, reason);
  res.json({ proposal: sanitizeProposal(updated) });
});

export default router;
