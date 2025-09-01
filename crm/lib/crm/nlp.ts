/**
 * Extremely simple NLP stubs: pull a Name and Company from free text.
 * Name heuristic: first capitalized First Last pair.
 * Company heuristic: word before 'Inc|Corp|LLC|AS'.
 */
export function extractName(text: string): string | null {
  const m = text.match(/\b([A-Z][a-z]+)\s([A-Z][a-z]+)\b/);
  return m ? `${m[1]} ${m[2]}` : null;
}
export function extractCompany(text: string): string | null {
  const m = text.match(/\b([A-Z][\w]+)\s+(Inc|Corp|LLC|AS)\b/i);
  return m ? `${m[1]} ${m[2]}` : null;
}
