
export function routeFromText(text: string){
  const s = (text || '').toLowerCase();
  if (s.includes('faktura') || s.includes('invoice')) {
    return { capability:'finance.invoice.prepareDraft', payload:{} };
  }
  if (s.includes('cash') || s.includes('kpi') || s.includes('dashboard')) {
    return { capability:'ops.analytics.queryKPI', payload:{ kpi:'cashflowTrend' } };
  }
  return { capability:'crm.deal.search', payload:{ text:s } };
}
