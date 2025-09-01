import { extractName, extractCompany } from '../lib/crm/nlp';

test('extractName finds First Last', () => {
  const t = 'Hi, I am Ada Lovelace from Acme Inc.';
  expect(extractName(t)).toBe('Ada Lovelace');
});

test('extractCompany finds Acme Inc', () => {
  const t = 'Hi, I am Ada Lovelace from Acme Inc.';
  expect(extractCompany(t)).toBe('Acme Inc');
});
