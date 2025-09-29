import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';

const proposalInputSchema = z.object({
  title: z.string().min(1, 'title_required').max(120, 'title_too_long'),
  value: z.coerce.number().min(0, 'value_must_be_positive'),
  currency: z.enum(['NOK', 'EUR', 'USD'], {
    errorMap: () => ({ message: 'unsupported_currency' }),
  }),
});

export type ProposalInput = z.infer<typeof proposalInputSchema>;
export type ProposalRecord = ProposalInput & { id: string };

const inMemoryStore = new Map<string, ProposalRecord>();

function formatIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join('.') || undefined,
    message: issue.message,
  }));
}

export function createCrmProposalRouter(
  store: Map<string, ProposalRecord> = inMemoryStore,
) {
  const router = Router();

  router.post('/proposals', (req, res) => {
    const parsed = proposalInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
        details: formatIssues(parsed.error.issues),
      });
    }

    const id = randomUUID();
    const record: ProposalRecord = { id, ...parsed.data };
    store.set(id, record);
    res.status(201).json(record);
  });

  router.get('/proposals/:id', (req, res) => {
    const id = String(req.params.id ?? '').trim();
    if (!id) {
      return res.status(400).json({ error: 'proposal_id_required' });
    }

    const record = store.get(id);
    if (!record) {
      return res.status(404).json({ error: 'proposal_not_found' });
    }

    res.json(record);
  });

  return router;
}

export const crmProposalRouter = createCrmProposalRouter();
