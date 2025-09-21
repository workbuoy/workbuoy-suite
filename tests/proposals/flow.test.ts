import request from 'supertest';
import app from '../../src/server';
import { resetSubscriptionState, setSubscriptionForTenant } from '../../src/core/subscription/state';
import { resetProposalsRepository } from '../../src/core/proposals/repository';
import { registerCapability } from '../../src/capabilities/registry';
import {
  resetConnectorCallRepository,
  getConnectorCallRepository,
} from '../../src/connectors/internal/callsRepository';
import { resetConnectorCircuits } from '../../src/connectors/internal/circuitRegistry';

describe('proposal approval flow', () => {
  beforeEach(() => {
    resetSubscriptionState();
    resetProposalsRepository();
    resetConnectorCallRepository();
    resetConnectorCircuits();
  });

  it('creates proposal in mode 4 and executes on approval', async () => {
    setSubscriptionForTenant('DEV', { plan: 'enterprise' });

    const prepareRes = await request(app)
      .post('/api/dev/run')
      .set('x-tenant', 'DEV')
      .set('x-user', 'approver')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'ambisiøs')
      .send({ capability: 'crm.lead.route', payload: {} });

    expect(prepareRes.status).toBe(200);
    expect(prepareRes.body.proposal).toBeDefined();
    const proposalId = prepareRes.body.proposal.id;
    expect(prepareRes.body.proposal.preview).toBeDefined();
    expect(prepareRes.body.proposal.status).toBe('proposed');

    const approveRes = await request(app)
      .post(`/api/proposals/${proposalId}/approve`)
      .set('x-tenant', 'DEV')
      .set('x-user', 'approver')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'kraken');

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.proposal.status).toBe('executed');
    expect(approveRes.body.outcome).toEqual(expect.objectContaining({ routed: true }));
    expect(typeof approveRes.body.idempotencyKey).toBe('string');
  });

  it('rejects proposal without executing capability', async () => {
    setSubscriptionForTenant('TEN', { plan: 'enterprise' });

    const createRes = await request(app)
      .post('/api/proposals')
      .set('x-tenant', 'TEN')
      .set('x-user', 'reviewer')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'ambisiøs')
      .send({ capabilityId: 'finance.invoice.prepareDraft', payload: { dealId: 'D-1' } });

    expect(createRes.status).toBe(201);
    const proposalId = createRes.body.proposal.id;

    const rejectRes = await request(app)
      .post(`/api/proposals/${proposalId}/reject`)
      .set('x-tenant', 'TEN')
      .set('x-user', 'reviewer')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'ambisiøs')
      .send({ reason: 'Needs clarification' });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.proposal.status).toBe('rejected');
  });

  it('re-approves a failed proposal with a fresh idempotency key', async () => {
    setSubscriptionForTenant('RETRY', { plan: 'enterprise' });
    let attempts = 0;
    registerCapability('test.fail.once', {
      execute: async () => {
        attempts += 1;
        if (attempts === 1) {
          const error: any = new Error('transient_failure');
          error.statusCode = 500;
          throw error;
        }
        return { ok: true, attempts };
      },
    });

    const createRes = await request(app)
      .post('/api/proposals')
      .set('x-tenant', 'RETRY')
      .set('x-user', 'agent')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'ambisiøs')
      .send({ capabilityId: 'test.fail.once', payload: { foo: 'bar' } });

    expect(createRes.status).toBe(201);
    const proposalId = createRes.body.proposal.id;
    const originalKey = createRes.body.proposal.idempotencyKey;

    const firstApprove = await request(app)
      .post(`/api/proposals/${proposalId}/approve`)
      .set('x-tenant', 'RETRY')
      .set('x-user', 'agent')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'kraken');

    expect(firstApprove.status).toBe(500);
    expect(firstApprove.body.proposal.status).toBe('failed');

    const secondApprove = await request(app)
      .post(`/api/proposals/${proposalId}/approve`)
      .set('x-tenant', 'RETRY')
      .set('x-user', 'agent')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'kraken');

    expect(secondApprove.status).toBe(200);
    expect(secondApprove.body.proposal.status).toBe('executed');
    expect(secondApprove.body.idempotencyKey).not.toBe(originalKey);
    const repo = getConnectorCallRepository();
    const failedCall = await repo.find(originalKey);
    expect(failedCall?.status).toBe('failed');
    const retriedCall = await repo.find(secondApprove.body.idempotencyKey);
    expect(retriedCall?.status).toBe('success');
  });
});
