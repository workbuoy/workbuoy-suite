// src/core/knowledge/fileIndex.ts
import { FileRepo } from '../persist/fileRepo';
import type { KnowledgeResult, KnowledgeIndex } from './index';

export class FileKnowledgeIndex implements KnowledgeIndex {
  private repo = new FileRepo<KnowledgeResult>('knowledge.index.json');
  async search(q: string): Promise<KnowledgeResult[]> {
    if (!q) return [];
    const results = await this.repo.all();
    const existing = results.filter(r => r.title.includes(q) || r.snippet.includes(q));
    if (existing.length) return existing;
    const r = { id: `q-${Date.now()}`, title: `Cached ${q}`, snippet: 'cached', score: 1.0 };
    await this.repo.upsert(r);
    return [r];
  }
}
