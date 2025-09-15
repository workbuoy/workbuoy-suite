export interface InsightCard {
  kind: string;
  title: string;
  recommendation?: { capability: string; payload: any };
  evidence: Record<string, any>;
  severity?: 'low'|'moderate'|'high';
}

export interface CRMCustomer {
  id: string;
  name: string;
  overdueAmount?: number;
  openDealsAmount?: number;
}

export async function buildInsights(tenantId: string, sources: { crm: { customers: CRMCustomer[] }, finance?: any }): Promise<InsightCard[]> {
  const cards: InsightCard[] = [];
  for (const c of sources.crm.customers) {
    const overdue = c.overdueAmount ?? 0;
    const pipeline = c.openDealsAmount ?? 0;
    if (overdue > 89000 && pipeline > 450000) {
      cards.push({
        kind: 'credit_review_recommended',
        title: `${c.name}: forfalt ${overdue} vs pipeline ${pipeline}`,
        recommendation: {
          capability: 'ops.insight.suggestCreditReview',
          payload: { customerId: c.id, overdue, pipeline, tenantId }
        },
        evidence: { overdue, pipeline, customerId: c.id, tenantId },
        severity: 'moderate'
      });
    }
  }
  return cards;
}
