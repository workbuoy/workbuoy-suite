import { GlobalSearchQuery } from './types';

const periodMap: Record<string,string> = {
  'siste 30 dager': '30d',
  'siste 7 dager': '7d',
  'siste kvartal': 'Q-1',
  '30d': '30d',
};

export function parseToQuery(input: string): GlobalSearchQuery {
  const q: GlobalSearchQuery = { text: input, filters: {}, scope: 'team', viz: 'table' };
  const lower = input.toLowerCase();

  // Kunde
  const kundeMatch = lower.match(/vis\s+([\w-]+)|kunde[:=]\s*([\w-]+)/);
  const kunde = (kundeMatch?.[1] || kundeMatch?.[2])?.trim();
  if (kunde) q.filters['kunde'] = kunde;

  // Tidsrom
  for (const k of Object.keys(periodMap)) {
    if (lower.includes(k)) { q.filters['tidsrom'] = periodMap[k]; break; }
  }

  // Region
  const reg = lower.match(/region\s*[:=]\s*([\w-]+)/) || lower.match(/region\s+([\w-]+)/);
  if (reg?.[1]) q.filters['region'] = reg[1];

  // Beløp over
  const bel = lower.match(/over\s*(\d+[kKmM]?)/);
  if (bel?.[1]) q.filters['beløp_min'] = bel[1];

  // Sort
  if (lower.includes('størst deal') || lower.includes('størst')) q.sort = 'deal_størrelse:desc';

  // Viz
  if (lower.includes('graf') || lower.includes('linje')) q.viz = 'line';
  if (lower.includes('tabell')) q.viz = 'table';
  if (lower.includes('stolpe')) q.viz = 'bar';

  return q;
}
