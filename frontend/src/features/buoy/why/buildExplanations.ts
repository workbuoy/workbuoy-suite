export type RawWhy = string | { title?:string; quote?:string; link?:string; source?:string };
export function buildExplanations(rows: RawWhy[]): RawWhy[] { return rows; }