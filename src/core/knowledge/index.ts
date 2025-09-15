// src/core/knowledge/index.ts
export type KnowledgeResult = { id: string; title: string; snippet: string; score: number };
export interface KnowledgeIndex {
  search(q: string): Promise<KnowledgeResult[]>;
}
export class StubKnowledgeIndex implements KnowledgeIndex {
  async search(q: string): Promise<KnowledgeResult[]> {
    if (!q) return [];
    return [{ id: 'stub-1', title: `Result for "${q}"`, snippet: 'stub', score: 0.1 }];
  }
}
export function getKnowledgeIndex(): KnowledgeIndex {
  return new StubKnowledgeIndex();
}
