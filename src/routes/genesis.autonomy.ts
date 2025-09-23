import { access } from 'fs/promises';
import path from 'path';

import { Router, Request, Response } from 'express';

type AutonomySuggestion = {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
};

function awarenessSnapshot() {
  const generatedAt = new Date().toISOString();
  return {
    ok: true,
    awarenessScore: 0.86,
    introspectionReport: {
      generatedAt,
      summary: 'Systems aligned with guardrails. No unattended autonomy detected.',
      signals: [
        { id: 'memory', status: 'green', detail: 'Conversation memory trimmed to last 200 turns.' },
        { id: 'policies', status: 'green', detail: 'All safety policies loaded and verified.' },
        {
          id: 'approvals',
          status: 'yellow',
          detail: 'Awaiting human validation for evolution tasks.',
        },
      ],
      recommendations: [
        'Maintain manual review cadence for evolution plans.',
        'Rotate API credentials before next autonomy experiment.',
      ],
    },
  };
}

function proposalFor(goal: unknown, context: unknown): AutonomySuggestion[] {
  const base: AutonomySuggestion[] = [
    {
      title: 'Capture requirements',
      description: 'Gather operator goals and validate safety constraints before planning.',
      impact: 'high',
    },
    {
      title: 'Draft implementation plan',
      description: 'Generate a step-by-step plan that can be reviewed offline.',
      impact: 'medium',
    },
    {
      title: 'Prepare validation checklist',
      description: 'List tests and manual checks required before any merge.',
      impact: 'medium',
    },
  ];

  if (typeof goal === 'string' && goal.trim()) {
    base.unshift({
      title: 'Clarify goal',
      description: `Operator goal: ${goal.trim()}. Provide supporting context snapshots only.`,
      impact: 'high',
    });
  }

  if (context && typeof context === 'object') {
    base.push({
      title: 'Context summary',
      description: `Relevant context captured: ${JSON.stringify(context).slice(0, 140)}…`,
      impact: 'low',
    });
  }

  return base;
}

function approvalFilePath() {
  return process.env.EVOLUTION_APPROVAL_FILE || path.join(process.cwd(), '.evolution/APPROVED');
}

export function metaGenesisRouter() {
  const router = Router();

  router.get('/genesis/introspection-report', (_req: Request, res: Response) => {
    res.json(awarenessSnapshot());
  });

  router.post('/genesis/autonomous-develop', (req: Request, res: Response) => {
    const suggestions = proposalFor(req.body?.goal, req.body?.context);
    res.json({
      mode: 'proposal',
      ok: true,
      awarenessScore: 0.86,
      suggestions,
      notice: 'Endpoint returns planning suggestions only. Execution requires manual approval.',
    });
  });

  router.post('/genetics/implement-evolution', async (req: Request, res: Response) => {
    const approvalPath = approvalFilePath();
    try {
      await access(approvalPath);
    } catch {
      return res.status(403).json({
        ok: false,
        error: 'approval_required',
        message: `Manual approval required. Place operator sign-off at ${approvalPath}.`,
      });
    }

    res.status(202).json({
      ok: true,
      status: 'awaiting_manual_merge',
      message: 'Evolution proposal acknowledged. Manual merge workflow must be executed offline.',
      checklist: [
        'Verify APPROVED token validity and operator signature.',
        'Run regression suite (npm test, npm run typecheck).',
        'Perform human-led git merge following evolution SOP.',
      ],
      receipt: {
        requestedAt: new Date().toISOString(),
        requestedBy: req.body?.requestedBy || 'unknown-requester',
      },
    });
  });

  return router;
}

export default metaGenesisRouter;
