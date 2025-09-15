import { publish } from '../../core/events/publish';
export class KnowledgeIndex {
  async health() { return { ok: true, sourceCount: 0 }; }
  async query({ q }: { q: string }) {
    const result = [{ id: 'dummy', score: 0.42, snippet: 'hello' }];
    await publish('ki.queried', { q, result });
    return result;
  }
}
