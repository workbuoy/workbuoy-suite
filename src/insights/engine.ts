export type Severity = 'low'|'moderate'|'high';

export interface InsightCard {
  kind: string;
  title: string;
  recommendation?: { capability: string; payload: any };
  evidence: Record<string, any>;
  severity?: Severity;
  explanations?: Array<{ reasoning: string; policyBasis?: string[]; impact?: { minutesSaved?: number; dsoDeltaDays?: number } }>;
}

/**
 * Very small, deterministic rules producing nudges.
 * Data shape is intentionally loose to accept in-memory sources.
 */
export async function buildInsights(tenantId: string, sources: { crm: any; finance: any }): Promise<InsightCard[]> {
  const cards: InsightCard[] = [];
  const customers = sources.crm?.customers ?? [];
  for (const c of customers) {
    const overdue = Number(c.overdueAmount ?? 0);
    const pipeline = Number(c.openDealsAmount ?? 0);
    if (overdue > 75000 && pipeline > 300000) {
      cards.push({
        kind: 'credit_review_recommended',
        title: `${c.name}: forfalt ${overdue} vs pipeline ${pipeline}`,
        evidence: { overdue, pipeline, customerId: c.id },
        recommendation: {
          capability: 'ops.insight.suggestCreditReview',
          payload: { customerId: c.id, overdue, pipeline }
        },
        severity: 'moderate',
        explanations: [{
          reasoning: 'Høy forfalt saldo samtidig som stor pipelinestørrelse – anbefaler kredittvurdering',
          policyBasis: ['local:insight.creditReview'],
          impact: { minutesSaved: 10 }
        }]
      });
    }
  }
  // Simple finance-based nudge
  const ar = Number(sources.finance?.aging?.over30 ?? 0);
  if (ar > 50000) {
    cards.push({
      kind: 'ar_over_30_high',
      title: `Forfalt over 30 dager: ${ar}`,
      evidence: { over30: ar },
      severity: 'low',
      explanations: [{
        reasoning: 'AR>30 dager er over terskel, vurder påminnelse',
        policyBasis: ['local:insight.ar30'],
        impact: { minutesSaved: 5, dsoDeltaDays: 2 }
      }],
      recommendation: {
        capability: 'finance.payment.suggestReminder',
        payload: { bucket: '>30' }
      }
    });
  }
  return cards;
}
