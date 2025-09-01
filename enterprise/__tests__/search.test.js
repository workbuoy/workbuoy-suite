/**
 * @jest-environment node
 */
import { indexSignals, searchSignals } from '../lib/search.js';

describe('search index & query', () => {
  const demo = [
    { ts: '2024-01-01T00:00:00Z', type: 'crm', title: 'kundeX deal oppdatert', payload: { value: 100 }, source: 'hubspot', entityId: 'd1', accountId: 'a1' },
    { ts: '2024-01-02T00:00:00Z', type: 'mail', title: 'subject:meeting plan', payload: { from: 'a@b.com' }, source: 'gmail', entityId: 'm1', accountId: 'a1' },
    { ts: '2024-01-03T00:00:00Z', type: 'files', title: 'file:rapport Q1', payload: { path: '/r.pdf' }, source: 'drive', entityId: 'f1', accountId: 'a2' },
  ];

  it('indexes without throwing', async () => {
    const r = await indexSignals(demo);
    expect(r).toBeTruthy();
  });

  it('searches by keyword', async () => {
    const r = await searchSignals('kundeX');
    expect(Array.isArray(r)).toBe(true);
    expect(r.find(x=>x.title.includes('kundeX'))).toBeTruthy();
  });

  it('filters by source types', async () => {
    const r = await searchSignals('subject:meeting', ['mail']);
    expect(Array.isArray(r)).toBe(true);
  });

  it('filters by account', async () => {
    const r = await searchSignals('account:a2 rapport');
    expect(r.find(x=>x.accountId==='a2')).toBeTruthy();
  });

  it('gracefully handles empty query', async () => {
    const r = await searchSignals('');
    expect(r).toEqual([]);
  });
});
