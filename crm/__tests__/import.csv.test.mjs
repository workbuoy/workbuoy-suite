import { parseCSV } from '../lib/import/csv.js';
test('parseCSV handles quotes and commas', () => {
  const csv = 'name,email,company\n"Ada, Countess",ada@acme.io,Acme';
  const rows = parseCSV(csv);
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe('Ada, Countess');
  expect(rows[0].company).toBe('Acme');
});
